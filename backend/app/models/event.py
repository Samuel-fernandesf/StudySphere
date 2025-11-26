from utils.db import db
from datetime import datetime

class Event(db.Model):
    __tablename__ = 'event'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    all_day = db.Column(db.Boolean, default=False)
    color = db.Column(db.String(20), default='#3b82f6')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())

    user = db.relationship('Usuario', backref=db.backref('events', lazy='dynamic'))

    def __init__(self, user_id, title, start_date, end_date, description=None, all_day=False, color='#3b82f6'):
        self.user_id = user_id
        self.title = title
        self.description = description
        self.start_date = start_date
        self.end_date = end_date
        self.all_day = all_day
        self.color = color

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'all_day': self.all_day,
            'color': self.color,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
