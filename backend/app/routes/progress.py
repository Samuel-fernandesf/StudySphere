from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import progressRepository
from datetime import datetime, timedelta

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/progress/summary', methods=['GET'])
@jwt_required()
def get_progress_summary():
    """Retorna um resumo completo do progresso do usuário"""
    user_id = get_jwt_identity()
    
    try:
        summary = progressRepository.get_progress_summary(user_id)
        return jsonify(summary), 200
    except Exception as e:
        print(f"Erro ao obter resumo de progresso: {e}")
        return jsonify({'message': 'Erro ao obter resumo de progresso'}), 500

@progress_bp.route('/progress/study-sessions', methods=['GET'])
@jwt_required()
def get_study_sessions():
    """Retorna sessões de estudo do usuário"""
    user_id = get_jwt_identity()
    
    # Parâmetros opcionais para filtrar por período
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    start_date = datetime.fromisoformat(start_date_str).date() if start_date_str else None
    end_date = datetime.fromisoformat(end_date_str).date() if end_date_str else None
    
    try:
        sessions = progressRepository.get_study_sessions_by_user(user_id, start_date, end_date)
        return jsonify({'sessions': [session.to_dict() for session in sessions]}), 200
    except Exception as e:
        print(f"Erro ao obter sessões de estudo: {e}")
        return jsonify({'message': 'Erro ao obter sessões de estudo'}), 500

@progress_bp.route('/progress/study-sessions', methods=['POST'])
@jwt_required()
def create_study_session():
    """Cria uma nova sessão de estudo"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Validar campos obrigatórios
        if not data.get('subject_id') or not data.get('duration_minutes'):
            return jsonify({'message': 'Campos obrigatórios: subject_id, duration_minutes'}), 400
        
        # Converter string para date se fornecida
        date = None
        if data.get('date'):
            date = datetime.fromisoformat(data['date']).date()
        
        session = progressRepository.create_study_session(
            user_id=user_id,
            subject_id=data['subject_id'],
            duration_minutes=data['duration_minutes'],
            date=date,
            notes=data.get('notes')
        )
        
        return jsonify({
            'message': 'Sessão de estudo registrada com sucesso!',
            'session': session.to_dict()
        }), 201
    except Exception as e:
        print(f"Erro ao criar sessão de estudo: {e}")
        return jsonify({'message': 'Erro ao criar sessão de estudo'}), 500

@progress_bp.route('/progress/time-by-subject', methods=['GET'])
@jwt_required()
def get_time_by_subject():
    """Retorna tempo de estudo agrupado por matéria"""
    user_id = get_jwt_identity()
    
    # Parâmetros opcionais para filtrar por período
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    start_date = datetime.fromisoformat(start_date_str).date() if start_date_str else None
    end_date = datetime.fromisoformat(end_date_str).date() if end_date_str else None
    
    try:
        time_by_subject = progressRepository.get_study_time_by_subject(user_id, start_date, end_date)
        return jsonify({'time_by_subject': time_by_subject}), 200
    except Exception as e:
        print(f"Erro ao obter tempo por matéria: {e}")
        return jsonify({'message': 'Erro ao obter tempo por matéria'}), 500

@progress_bp.route('/progress/time-by-day', methods=['GET'])
@jwt_required()
def get_time_by_day():
    """Retorna tempo de estudo dos últimos N dias"""
    user_id = get_jwt_identity()
    
    # Parâmetro opcional para número de dias
    days = request.args.get('days', default=7, type=int)
    
    try:
        time_by_day = progressRepository.get_study_time_by_day(user_id, days)
        return jsonify({'time_by_day': time_by_day}), 200
    except Exception as e:
        print(f"Erro ao obter tempo por dia: {e}")
        return jsonify({'message': 'Erro ao obter tempo por dia'}), 500

@progress_bp.route('/progress/streak', methods=['GET'])
@jwt_required()
def get_streak():
    """Retorna a sequência atual de dias consecutivos de estudo"""
    user_id = get_jwt_identity()
    
    try:
        streak = progressRepository.get_current_streak(user_id)
        return jsonify({'current_streak': streak}), 200
    except Exception as e:
        print(f"Erro ao obter sequência: {e}")
        return jsonify({'message': 'Erro ao obter sequência'}), 500

@progress_bp.route('/progress/weekly-goal', methods=['GET'])
@jwt_required()
def get_weekly_goal():
    """Retorna o progresso da meta semanal"""
    user_id = get_jwt_identity()
    
    # Parâmetro opcional para meta semanal em horas
    goal_hours = request.args.get('goal_hours', default=20, type=int)
    
    try:
        weekly_goal = progressRepository.get_weekly_goal_progress(user_id, goal_hours)
        return jsonify(weekly_goal), 200
    except Exception as e:
        print(f"Erro ao obter meta semanal: {e}")
        return jsonify({'message': 'Erro ao obter meta semanal'}), 500
