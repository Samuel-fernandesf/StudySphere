from models.task import Task
from utils.db import db
from datetime import datetime

def get_tasks_by_user(user_id, subject_id=None, completed=None):
    query = Task.query.filter_by(user_id=user_id)

    if subject_id is not None:
        query = query.filter_by(subject_id=subject_id)

    if completed is not None:
        query = query.filter_by(completed=completed)

    # teste sem nullslast
    return query.order_by(Task.due_date.asc(), Task.created_at.desc()).all()

def get_task_by_id(task_id):
    """Retorna uma tarefa específica pelo ID"""
    return Task.query.get(task_id)

def create_task(user_id, subject_id, title, description=None, due_date=None, priority='medium'):
    """Cria uma nova tarefa"""
    task = Task(
        user_id=user_id,
        subject_id=subject_id,
        title=title,
        description=description,
        due_date=due_date,
        priority=priority
    )
    db.session.add(task)
    db.session.commit()
    return task

def update_task(task_id, **kwargs):
    """Atualiza uma tarefa existente"""
    task = Task.query.get(task_id)
    if not task:
        return None
    
    for key, value in kwargs.items():
        if hasattr(task, key):
            setattr(task, key, value)
    
    db.session.commit()
    return task

def delete_task(task_id):
    """Deleta uma tarefa"""
    task = Task.query.get(task_id)
    if not task:
        return False
    
    db.session.delete(task)
    db.session.commit()
    return True

def toggle_task_completion(task_id):
    """Alterna o status de conclusão de uma tarefa"""
    task = Task.query.get(task_id)
    if not task:
        return None
    
    if task.completed:
        task.mark_as_incomplete()
    else:
        task.mark_as_completed()
    
    db.session.commit()
    return task

def get_completed_tasks_count(user_id, start_date=None, end_date=None):
    """Retorna o número de tarefas concluídas em um período"""
    query = Task.query.filter_by(user_id=user_id, completed=True)
    
    if start_date:
        query = query.filter(Task.completed_at >= start_date)
    if end_date:
        query = query.filter(Task.completed_at <= end_date)
    
    return query.count()

def get_tasks_by_subject_grouped(user_id):
    """Retorna tarefas agrupadas por matéria"""
    from models.subject import Subject
    
    subjects = Subject.query.filter_by(user_id=user_id).all()
    result = {}
    
    for subject in subjects:
        tasks = Task.query.filter_by(user_id=user_id, subject_id=subject.id).all()
        result[subject.id] = {
            'subject': subject.to_dict(),
            'tasks': [task.to_dict() for task in tasks]
        }
    
    return result
