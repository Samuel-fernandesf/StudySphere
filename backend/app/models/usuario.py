from flask import current_app #Usado para pegar os dados de onde a aplicação flask foi instanciada, no caso app.py
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
from utils.extensions import bcrypt
from utils.db import db
from datetime import datetime, timezone
import enum

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    nome_completo = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    nascimento = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    revoked_tokens = db.relationship('RevokedToken', back_populates='user')
    
    @property
    def cripto_pwd(self):
        return self.senha
    
    @cripto_pwd.setter
    def cripto_pwd(self, senha_texto):
        self.senha = bcrypt.generate_password_hash(senha_texto).decode('utf-8')

    def conversor_pwd(self, senha_descripto):
        return bcrypt.check_password_hash(self.senha, senha_descripto)

    def __init__(self, email, senha, nome_completo, username, nascimento):
        self.email = email
        self.cripto_pwd = senha
        self.nome_completo = nome_completo
        self.username = username
        self.nascimento = nascimento