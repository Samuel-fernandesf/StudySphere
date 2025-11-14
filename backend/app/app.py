import os
from flask import Flask
from flask_migrate import Migrate
from blueprints.home import home
from blueprints import auth
from utils.db import db
from flask_cors import CORS
import dotenv

app = Flask(__name__)
CORS(app, supports_credentials=True)

#Chaves de configuração em um arquivo .env
app.config['SECRET_KEY'] = dotenv.get_key(dotenv.find_dotenv(), 'SECRET_KEY')
app.config["SQLALCHEMY_DATABASE_URI"] = dotenv.get_key(dotenv.find_dotenv(), 'DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Inicializando o banco de dados
db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(home, url_prefix='/api/dashboard')

