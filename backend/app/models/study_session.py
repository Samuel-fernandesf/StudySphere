from utils.db import db
from datetime import datetime

class StudySession(db.Model):
    __tablename__ = 'study_session'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)  # duração em minutos
    date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    user = db.relationship('Usuario', backref=db.backref('study_sessions', lazy='dynamic'))
    subject = db.relationship('Subject', backref=db.backref('study_sessions', lazy='dynamic'))

    def __init__(self, user_id, subject_id, duration_minutes, date=None, notes=None):
        self.user_id = user_id
        self.subject_id = subject_id
        self.duration_minutes = duration_minutes
        self.date = date or datetime.now().date()
        self.notes = notes

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subject_id': self.subject_id,
            'duration_minutes': self.duration_minutes,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
