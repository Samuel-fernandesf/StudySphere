from utils.db import db
from datetime import datetime

class Subject(db.Model):
    __tablename__ = 'subject'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(20), default='#3b82f6')
    icon = db.Column(db.String(50), default='BookOpen')
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())

    user = db.relationship('Usuario', backref=db.backref('subjects', lazy='dynamic'))

    def __init__(self, user_id, name, color='#3b82f6', icon='BookOpen', description=None):
        self.user_id = user_id
        self.name = name
        self.color = color
        self.icon = icon
        self.description = description

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'color': self.color,
            'icon': self.icon,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
