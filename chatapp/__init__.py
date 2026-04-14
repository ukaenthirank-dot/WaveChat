from pathlib import Path
import time

from flask import Flask, jsonify, render_template, request
from flask_wtf.csrf import CSRFError

from .api import api_bp
from .auth import auth_bp
from .config import Config
from .extensions import csrf, db, login_manager, socketio
from .models import User
from .security import create_socket_token, install_security_headers
from .sockets import register_socket_events

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def wants_json_response() -> bool:
    return (
        request.path.startswith("/api/")
        or request.path.startswith("/auth/")
        or request.path.startswith("/socket.io")
        or request.accept_mimetypes.best == "application/json"
    )


def create_app() -> Flask:
    app = Flask(
        __name__,
        instance_relative_config=True,
        template_folder=str(TEMPLATES_DIR),
        static_folder=str(STATIC_DIR),
        static_url_path="/static",
    )
    app.config.from_object(Config())
    app.config["ASSET_VERSION"] = str(int(time.time()))

    Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    socketio.init_app(app)
    install_security_headers(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.before_request
    def protect_forms():
        if request.method in UNSAFE_METHODS and not request.path.startswith("/socket.io"):
            csrf.protect()

    @app.context_processor
    def inject_asset_version():
        from flask_login import current_user

        return {
            "asset_version": app.config["ASSET_VERSION"],
            "socket_token": create_socket_token(current_user) if current_user.is_authenticated else "",
            "rtc_configuration": {
                "iceServers": app.config.get("RTC_ICE_SERVERS", []),
                "iceTransportPolicy": app.config.get("RTC_ICE_TRANSPORT_POLICY", "all"),
            },
        }

    @app.route("/")
    @app.route("/login")
    def index():
        from flask_login import current_user

        force_auth = request.path == "/login" or request.args.get("login") == "1"
        if force_auth:
            return render_template("auth.html")
        if current_user.is_authenticated:
            return render_template("chat.html")
        return render_template("auth.html")

    @app.errorhandler(CSRFError)
    def handle_csrf(error):
        return jsonify({"ok": False, "error": error.description}), 400

    @app.errorhandler(400)
    def bad_request(error):
        if wants_json_response():
            return jsonify({"ok": False, "error": getattr(error, "description", "Bad request")}), 400
        return error

    @app.errorhandler(413)
    def too_large(_error):
        return jsonify({"ok": False, "error": "Upload is too large."}), 413

    @app.errorhandler(500)
    def handle_internal_error(error):
        app.logger.exception("Unhandled application error: %s", error)
        if wants_json_response():
            return jsonify({"ok": False, "error": "Internal server error. Please try again."}), 500
        return render_template("auth.html"), 500

    with app.app_context():
        db.create_all()

    register_socket_events(socketio)
    return app


@login_manager.user_loader
def load_user(user_id: str):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    if wants_json_response():
        return jsonify({"ok": False, "error": "Authentication required."}), 401
    return render_template("auth.html"), 401
