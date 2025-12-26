from utils.db import db

class UserPreferences(db.Model):
    """Armazena preferências de notificação, aparência e privacidade do usuário"""
    __tablename__ = 'user_preferences'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    push_notifications = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    study_reminders = db.Column(db.Boolean, default=True)
    weekly_reports = db.Column(db.Boolean, default=False)
    achievements = db.Column(db.Boolean, default=True)
    
    theme = db.Column(db.String(20), default='light')
    language = db.Column(db.String(10), default='pt')
    sound_effects = db.Column(db.Boolean, default=True)
    daily_goal = db.Column(db.Float, default=2.0)
    
    profile_visibility = db.Column(db.String(20), default='public')

    usuario = db.relationship('Usuario', backref=db.backref('preferences', uselist=False, cascade='all, delete-orphan'))

    def __init__(self, user_id, **kwargs):
        self.user_id = user_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def to_dict(self):
        """Retorna representação em dicionário das preferências"""
        return {
            'push_notifications': self.push_notifications,
            'email_notifications': self.email_notifications,
            'study_reminders': self.study_reminders,
            'weekly_reports': self.weekly_reports,
            'achievements': self.achievements,
            'theme': self.theme,
            'language': self.language,
            'sound_effects': self.sound_effects,
            'daily_goal': self.daily_goal,
            'profile_visibility': self.profile_visibility
        }
