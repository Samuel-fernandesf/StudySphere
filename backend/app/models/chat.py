from utils.db import db
from sqlalchemy import UniqueConstraint
import enum

class TipoChat(enum.Enum):
    publico='Público'
    privado='Privado'

class TipoMensagem(enum.Enum):
    mensagem='Mensagem'
    arquivo='Arquivo'

class Chat(db.Model):
    __tablename__ = 'chat'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome_grupo = db.Column(db.String(100), nullable=True)
    tipo = db.Column(db.Enum(TipoChat), default=TipoChat.publico, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    #Relacionamentos
    usuarios_participantes = db.relationship('ChatUsuario', back_populates='chat', lazy='select')
    mensagens = db.relationship('Mensagem', back_populates='chat', lazy='dynamic')

    def __init__(self, tipo, nome_grupo=None):
        self.tipo = tipo
        self.nome_grupo = nome_grupo if nome_grupo else None
    
class Mensagem(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id', ondelete='CASCADE'), nullable=False)
    conteudo_msg = db.Column(db.Text, nullable=False)
    tipo_mensagem = db.Column(db.Enum(TipoMensagem), default=TipoMensagem.mensagem, nullable=False)
    data_envio = db.Column(db.DateTime, nullable=False, default=db.func.now())

    #Relacionamentos
    chat = db.relationship('Chat', back_populates='mensagens', lazy='select')
    usuario_remetente = db.relationship('Usuario', back_populates='mensagem_enviadas', lazy='select')

    def __init__(self, usuario_id, chat_id, conteudo_msg, tipo_mensagem=TipoMensagem.mensagem):
        self.usuario_id = usuario_id
        self.chat_id = chat_id
        self.conteudo_msg = conteudo_msg
        self.tipo_mensagem = tipo_mensagem

class ChatUsuario(db.Model):
    __tablename__='chat_usuario'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id', ondelete='CASCADE'), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint('usuario_id', 'chat_id', name='uq_user_per_chat'),
    )

    #Relacionamentos
    usuario_relacionado = db.relationship('Usuario', back_populates='chat_participa', lazy='select')
    chat = db.relationship('Chat', back_populates='usuarios_participantes', lazy='select')

    def __init__(self, usuario_id, chat_id, is_admin=False):
        self.usuario_id = usuario_id
        self.chat_id = chat_id
        self.is_admin = is_admin
