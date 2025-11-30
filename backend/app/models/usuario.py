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
    curso = db.Column(db.String(200), nullable=True)
    biografia = db.Column(db.Text, nullable=True)
    confirm_user = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    revoked_tokens = db.relationship('RevokedToken', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_confirmation_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    
        hora_utc = datetime.now(timezone.utc)
        timestamp = hora_utc.timestamp()

        return s.dumps({'user_id': self.id, 'timestamp': timestamp})
    
    @staticmethod # Não precisa de self, pois não depende de nenhuma instância
    def verify_confirmation_token(token, expires_sec=86400):#Expira em 24 horas
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

        try:
            dados = s.loads(token, max_age=expires_sec)
            user_id = dados['user_id']
            timestamp = int(dados['timestamp'])
        except:
            return None
        
        #Pegar o id do usuario que realizará a confirmação
        user= Usuario.query.get(user_id)

        if user is None:
            return None

        return user

    def get_reset_token(self):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

        hora_utc = datetime.now(timezone.utc)
        timestamp = hora_utc.timestamp()

        return s.dumps({'user_id': self.id, 'timestamp': timestamp})
    
    @staticmethod # não precisa de um objeto (instância). Útil para funções relacionadas à classe, mas que não usam 'self'. Pertence à classe, mas não depende de nenhuma instância específica dela, como se fosse uma função de fora do objeto basicamente.
    def verify_reset_token(token, expires_sec=1800):
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            dados = s.loads(token, max_age=expires_sec)
            user_id = dados['user_id']
            timestamp = int(dados['timestamp'])
        except:
            return None
        
        #Pegar o id do usuario que solicitou a redefinição
        user= Usuario.query.get(user_id)

        if user is None:
            return None

        return user
    
    @property
    def cripto_pwd(self):
        return self.senha
    
    @cripto_pwd.setter
    def cripto_pwd(self, senha_texto):
        self.senha = bcrypt.generate_password_hash(senha_texto).decode('utf-8')

    def conversor_pwd(self, senha_descripto):
        return bcrypt.check_password_hash(self.senha, senha_descripto)

    def __init__(self, email, senha, nome_completo, username, nascimento, curso=None, biografia=None):
        self.email = email
        self.cripto_pwd = senha
        self.nome_completo = nome_completo
        self.username = username
        self.nascimento = nascimento
        self.curso = curso
        self.biografia = biografia