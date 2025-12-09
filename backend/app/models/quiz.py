from utils.db import db
from datetime import datetime
import enum

class DificuldadeQuiz(enum.Enum):
    facil = 'Fácil'
    medio = 'Médio'
    dificil = 'Difícil'

class Quiz(db.Model):
    __tablename__ = 'quiz'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    materia = db.Column(db.String(100), nullable=False)
    dificuldade = db.Column(db.Enum(DificuldadeQuiz), default=DificuldadeQuiz.medio, nullable=False)
    tempo_estimado = db.Column(db.Integer, nullable=True)  # em minutos
    criador_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    is_publico = db.Column(db.Boolean, default=True, nullable=False)

    # Relacionamentos
    questoes = db.relationship('Questao', back_populates='quiz', lazy='dynamic', cascade='all, delete-orphan')
    tentativas = db.relationship('TentativaQuiz', back_populates='quiz', lazy='dynamic', cascade='all, delete-orphan')
    tags = db.relationship('TagQuiz', back_populates='quiz', lazy='dynamic', cascade='all, delete-orphan')

    def __init__(self, titulo, materia, criador_id, descricao=None, dificuldade=DificuldadeQuiz.medio, tempo_estimado=None, is_publico=True):
        self.titulo = titulo
        self.descricao = descricao
        self.materia = materia
        self.dificuldade = dificuldade
        self.tempo_estimado = tempo_estimado
        self.criador_id = criador_id
        self.is_publico = is_publico

class Questao(db.Model):
    __tablename__ = 'questao'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    enunciado = db.Column(db.Text, nullable=False)
    ordem = db.Column(db.Integer, nullable=False)
    pontos = db.Column(db.Integer, default=1, nullable=False)

    # Relacionamentos
    quiz = db.relationship('Quiz', back_populates='questoes')
    alternativas = db.relationship('Alternativa', back_populates='questao', lazy='dynamic', cascade='all, delete-orphan')

    def __init__(self, quiz_id, enunciado, ordem, pontos=1):
        self.quiz_id = quiz_id
        self.enunciado = enunciado
        self.ordem = ordem
        self.pontos = pontos

class Alternativa(db.Model):
    __tablename__ = 'alternativa'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    questao_id = db.Column(db.Integer, db.ForeignKey('questao.id', ondelete='CASCADE'), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    is_correta = db.Column(db.Boolean, default=False, nullable=False)
    ordem = db.Column(db.Integer, nullable=False)

    # Relacionamentos
    questao = db.relationship('Questao', back_populates='alternativas')

    def __init__(self, questao_id, texto, is_correta=False, ordem=0):
        self.questao_id = questao_id
        self.texto = texto
        self.is_correta = is_correta
        self.ordem = ordem

class TentativaQuiz(db.Model):
    __tablename__ = 'tentativa_quiz'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    pontuacao = db.Column(db.Integer, nullable=False)
    pontuacao_maxima = db.Column(db.Integer, nullable=False)
    tempo_gasto = db.Column(db.Integer, nullable=True)  # em segundos
    data_tentativa = db.Column(db.DateTime, nullable=False, default=db.func.now())
    concluido = db.Column(db.Boolean, default=True, nullable=False)

    # Relacionamentos
    quiz = db.relationship('Quiz', back_populates='tentativas')
    respostas = db.relationship('RespostaUsuario', back_populates='tentativa', lazy='dynamic', cascade='all, delete-orphan')

    def __init__(self, quiz_id, usuario_id, pontuacao, pontuacao_maxima, tempo_gasto=None, concluido=True):
        self.quiz_id = quiz_id
        self.usuario_id = usuario_id
        self.pontuacao = pontuacao
        self.pontuacao_maxima = pontuacao_maxima
        self.tempo_gasto = tempo_gasto
        self.concluido = concluido

class RespostaUsuario(db.Model):
    __tablename__ = 'resposta_usuario'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tentativa_id = db.Column(db.Integer, db.ForeignKey('tentativa_quiz.id', ondelete='CASCADE'), nullable=False)
    questao_id = db.Column(db.Integer, db.ForeignKey('questao.id', ondelete='CASCADE'), nullable=False)
    alternativa_id = db.Column(db.Integer, db.ForeignKey('alternativa.id', ondelete='CASCADE'), nullable=True)
    is_correta = db.Column(db.Boolean, nullable=False)

    # Relacionamentos
    tentativa = db.relationship('TentativaQuiz', back_populates='respostas')

    def __init__(self, tentativa_id, questao_id, alternativa_id, is_correta):
        self.tentativa_id = tentativa_id
        self.questao_id = questao_id
        self.alternativa_id = alternativa_id
        self.is_correta = is_correta

class TagQuiz(db.Model):
    __tablename__ = 'tag_quiz'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    nome = db.Column(db.String(50), nullable=False)

    # Relacionamentos
    quiz = db.relationship('Quiz', back_populates='tags')

    def __init__(self, quiz_id, nome):
        self.quiz_id = quiz_id
        self.nome = nome
