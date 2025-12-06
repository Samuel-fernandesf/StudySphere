from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

bcrypt = Bcrypt()
jwt = JWTManager()
socket_io = SocketIO(cors_allowed_origins=["http://localhost:3000"], logger=True, engineio_logger=True)