from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()
socketio = SocketIO(
    async_mode="threading",
    manage_session=True,
    always_connect=True,
    logger=True,
    engineio_logger=True,
)
