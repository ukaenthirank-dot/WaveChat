import os

from chatapp import create_app, socketio

app = create_app()


def env_flag(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


if __name__ == "__main__":
    debug_enabled = env_flag("FLASK_DEBUG", False)
    socketio.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=debug_enabled,
        use_reloader=False,
        allow_unsafe_werkzeug=True,
    )
