from models.subject import Subject
from utils.db import db

def create_subject(user_id, name, color='#3b82f6', icon='BookOpen', description=None):
    """Cria uma nova matéria"""
    subject = Subject(
        user_id=user_id,
        name=name,
        color=color,
        icon=icon,
        description=description
    )
    db.session.add(subject)
    db.session.commit()
    return subject

def get_subject_by_id(subject_id):
    """Busca uma matéria pelo ID"""
    return Subject.query.get(subject_id)

def get_subjects_by_user(user_id):
    """Busca todas as matérias de um usuário"""
    return Subject.query.filter_by(user_id=user_id).order_by(Subject.name).all()

def update_subject(subject_id, **kwargs):
    """Atualiza uma matéria existente"""
    subject = Subject.query.get(subject_id)
    if not subject:
        return None
    
    for key, value in kwargs.items():
        if hasattr(subject, key):
            setattr(subject, key, value)
    
    db.session.commit()
    return subject

def delete_subject(subject_id):
    """Deleta uma matéria"""
    subject = Subject.query.get(subject_id)
    if not subject:
        return False
    
    db.session.delete(subject)
    db.session.commit()
    return True
