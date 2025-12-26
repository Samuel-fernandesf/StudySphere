from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from utils.db import db
from utils.extensions import jwt, socket_io
from dotenv import load_dotenv
from datetime import timedelta
from utils import jwt_handlers, socket_handlers
from routes import auth, home, events_bp, subjects_bp, tasks_bp, files_bp, folders_bp, progress_bp, chat, quiz_bp, users, assistant_bp, preferences_bp
import os
from pathlib import Path

def create_app():
    dotenv_path = Path(__file__).resolve().parent.parent.parent / '.env'
    load_dotenv(dotenv_path=dotenv_path)

    app = Flask(__name__)

    app.config.from_prefixed_env()
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=10)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
    app.config["JWT_TOKEN_LOCATION"] = ["cookies", "headers"]
    app.config["JWT_COOKIE_SECURE"] = False
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins='*')
    migrate = Migrate(app, db)
    socket_io.init_app(app)

    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(users, url_prefix='/api/users')
    app.register_blueprint(home, url_prefix='/api/dashboard')
    app.register_blueprint(chat, url_prefix='/api/chats')
    app.register_blueprint(events_bp, url_prefix='/api')
    app.register_blueprint(subjects_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api')
    app.register_blueprint(files_bp, url_prefix='/api')
    app.register_blueprint(folders_bp, url_prefix='/api')
    app.register_blueprint(progress_bp, url_prefix='/api')
    app.register_blueprint(quiz_bp, url_prefix='/api/quizzes')
    app.register_blueprint(assistant_bp, url_prefix='/api/assistant')
    app.register_blueprint(preferences_bp, url_prefix='/api')

    return app