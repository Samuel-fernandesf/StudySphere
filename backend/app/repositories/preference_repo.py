from models import UserPreferences
from utils.db import db

class PreferenceRepository:
    """Gerencia persistência das preferências do usuário"""
    
    def get_by_user_id(self, user_id):
        """Busca preferências do usuário ou cria padrão se inexistente"""
        prefs = UserPreferences.query.filter_by(user_id=user_id).first()
        if not prefs:
            prefs = self.create_default(user_id)
        return prefs
    
    def create_default(self, user_id):
        """Cria preferências padrão para um novo usuário"""
        prefs = UserPreferences(user_id=user_id)
        db.session.add(prefs)
        db.session.commit()
        return prefs
    
    def update(self, user_id, data):
        """Atualiza campos permitidos das preferências do usuário"""
        prefs = self.get_by_user_id(user_id)
        
        allowed_fields = [
            'push_notifications', 'email_notifications', 'study_reminders',
            'weekly_reports', 'achievements', 'theme', 'language',
            'sound_effects', 'daily_goal', 'profile_visibility'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(prefs, field, data[field])
        
        db.session.commit()
        return prefs
