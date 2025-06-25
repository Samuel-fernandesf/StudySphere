import os
from flask import Flask
from flask_migrate import Migrate
from routes.home import home
from utils.db import db

app = Flask(__name__)

#Chaves de configuração em um arquivo .env
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Inicializando o banco de dados
db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(home, url_prefix='/')
