from utils.db import db
from datetime import datetime


class Folder(db.Model):
    __tablename__ = 'folder'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('folder.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(20), default='#6366f1') 
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())

    # Relacionamentos
    user = db.relationship('Usuario', backref=db.backref('folders', lazy='dynamic'))
    subject = db.relationship('Subject', backref=db.backref('folders', lazy='dynamic'))
    parent = db.relationship('Folder', remote_side=[id], backref=db.backref('children', lazy='dynamic'))

    def __init__(self, user_id, subject_id, name, parent_id=None, color='#6366f1'):
        self.user_id = user_id
        self.subject_id = subject_id
        self.name = name
        self.parent_id = parent_id
        self.color = color

    def get_depth(self):
        """Retorna a profundidade da pasta na hierarquia (0 = raiz)"""
        depth = 0
        current = self
        while current.parent_id is not None:
            depth += 1
            current = Folder.query.get(current.parent_id)
            if depth > 10:  # Proteção contra loop infinito
                break
        return depth

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subject_id': self.subject_id,
            'parent_id': self.parent_id,
            'name': self.name,
            'color': self.color,
            'depth': self.get_depth(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
