from models.study_session import StudySession
from models.task import Task
from models.subject import Subject
from utils.db import db
from datetime import datetime, timedelta
from sqlalchemy import func

def create_study_session(user_id, subject_id, duration_minutes, date=None, notes=None):
    """Cria uma nova sessão de estudo"""
    session = StudySession(
        user_id=user_id,
        subject_id=subject_id,
        duration_minutes=duration_minutes,
        date=date or datetime.utcnow().date(),
        notes=notes
    )
    db.session.add(session)
    db.session.commit()
    return session

def get_study_sessions_by_user(user_id, start_date=None, end_date=None):
    """Retorna sessões de estudo do usuário em um período"""
    query = StudySession.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(StudySession.date >= start_date)
    if end_date:
        query = query.filter(StudySession.date <= end_date)
    
    return query.order_by(StudySession.date.desc()).all()

def get_total_study_time(user_id, start_date=None, end_date=None):
    """Retorna o total de horas estudadas em um período"""
    query = db.session.query(func.sum(StudySession.duration_minutes)).filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(StudySession.date >= start_date)
    if end_date:
        query = query.filter(StudySession.date <= end_date)
    
    total_minutes = query.scalar() or 0
    return total_minutes

def get_study_time_by_subject(user_id, start_date=None, end_date=None):
    """Retorna tempo de estudo agrupado por matéria"""
    query = db.session.query(
        Subject.id,
        Subject.name,
        Subject.color,
        func.sum(StudySession.duration_minutes).label('total_minutes')
    ).join(
        StudySession, Subject.id == StudySession.subject_id
    ).filter(
        StudySession.user_id == user_id
    )
    
    if start_date:
        query = query.filter(StudySession.date >= start_date)
    if end_date:
        query = query.filter(StudySession.date <= end_date)
    
    query = query.group_by(Subject.id, Subject.name, Subject.color)
    
    results = query.all()
    return [
        {
            'subject_id': r[0],
            'subject_name': r[1],
            'color': r[2],
            'total_minutes': r[3] or 0,
            'total_hours': round((r[3] or 0) / 60, 1)
        }
        for r in results
    ]

def get_study_time_by_day(user_id, days=7):
    """Retorna tempo de estudo dos últimos N dias"""
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days-1)
    
    query = db.session.query(
        StudySession.date,
        func.sum(StudySession.duration_minutes).label('total_minutes')
    ).filter(
        StudySession.user_id == user_id,
        StudySession.date >= start_date,
        StudySession.date <= end_date
    ).group_by(StudySession.date).order_by(StudySession.date)
    
    results = query.all()
    
    # Criar dicionário com todos os dias (incluindo dias sem estudo)
    date_dict = {}
    current_date = start_date
    while current_date <= end_date:
        date_dict[current_date] = 0
        current_date += timedelta(days=1)
    
    # Preencher com dados reais
    for date, minutes in results:
        date_dict[date] = minutes or 0
    
    # Converter para lista ordenada
    return [
        {
            'date': date.isoformat(),
            'total_minutes': minutes,
            'total_hours': round(minutes / 60, 1)
        }
        for date, minutes in sorted(date_dict.items())
    ]

def get_current_streak(user_id):
    """Retorna a sequência atual de dias consecutivos de estudo"""
    today = datetime.utcnow().date()
    streak = 0
    current_date = today
    
    while True:
        # Verificar se há sessões de estudo neste dia
        session_count = StudySession.query.filter_by(
            user_id=user_id
        ).filter(
            StudySession.date == current_date
        ).count()
        
        if session_count > 0:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            # Se não há sessão hoje, verificar ontem
            if current_date == today:
                current_date -= timedelta(days=1)
                continue
            else:
                break
    
    return streak

def get_weekly_goal_progress(user_id, weekly_goal_hours=20):
    """Retorna o progresso da meta semanal"""
    # Calcular início da semana (segunda-feira)
    today = datetime.utcnow().date()
    start_of_week = today - timedelta(days=today.weekday())
    
    total_minutes = get_total_study_time(user_id, start_of_week, today)
    total_hours = total_minutes / 60
    
    progress_percentage = min(100, (total_hours / weekly_goal_hours) * 100)
    
    return {
        'total_hours': round(total_hours, 1),
        'goal_hours': weekly_goal_hours,
        'progress_percentage': round(progress_percentage, 1),
        'remaining_hours': max(0, round(weekly_goal_hours - total_hours, 1))
    }

def get_daily_average(user_id, days=7):
    """Retorna a média diária de estudo"""
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days-1)
    
    total_minutes = get_total_study_time(user_id, start_date, end_date)
    average_minutes = total_minutes / days
    
    return {
        'average_minutes': round(average_minutes, 1),
        'average_hours': round(average_minutes / 60, 1)
    }

def get_progress_summary(user_id):
    """Retorna um resumo completo do progresso do usuário"""
    # Total de horas (todo o tempo)
    total_minutes_all_time = get_total_study_time(user_id)
    total_hours_all_time = total_minutes_all_time / 60
    
    # Sequência atual
    current_streak = get_current_streak(user_id)
    
    # Tarefas concluídas
    completed_tasks = Task.query.filter_by(user_id=user_id, completed=True).count()
    
    # Média diária
    daily_avg = get_daily_average(user_id, days=7)
    
    # Meta semanal
    weekly_goal = get_weekly_goal_progress(user_id)
    
    # Tempo por matéria (último mês)
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    time_by_subject = get_study_time_by_subject(user_id, start_date, end_date)
    
    # Tempo por dia (última semana)
    time_by_day = get_study_time_by_day(user_id, days=7)
    
    return {
        'total_hours': round(total_hours_all_time, 1),
        'current_streak': current_streak,
        'completed_tasks': completed_tasks,
        'daily_average': daily_avg,
        'weekly_goal': weekly_goal,
        'time_by_subject': time_by_subject,
        'time_by_day': time_by_day
    }
