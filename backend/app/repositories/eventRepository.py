from models.event import Event
from utils.db import db
from datetime import datetime

def create_event(user_id, title, start_date, end_date, description=None, all_day=False, color='#3b82f6'):
    """Cria um novo evento"""
    event = Event(
        user_id=user_id,
        title=title,
        start_date=start_date,
        end_date=end_date,
        description=description,
        all_day=all_day,
        color=color
    )
    db.session.add(event)
    db.session.commit()
    return event

def get_event_by_id(event_id):
    """Busca um evento pelo ID"""
    return Event.query.get(event_id)

def get_events_by_user(user_id, start_date=None, end_date=None):
    """Busca todos os eventos de um usuário, opcionalmente filtrados por período"""
    query = Event.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(Event.end_date >= start_date)
    if end_date:
        query = query.filter(Event.start_date <= end_date)
    
    return query.order_by(Event.start_date).all()

def update_event(event_id, **kwargs):
    """Atualiza um evento existente"""
    event = Event.query.get(event_id)
    if not event:
        return None
    
    for key, value in kwargs.items():
        if hasattr(event, key):
            setattr(event, key, value)
    
    db.session.commit()
    return event

def delete_event(event_id):
    """Deleta um evento"""
    event = Event.query.get(event_id)
    if not event:
        return False
    
    db.session.delete(event)
    db.session.commit()
    return True
