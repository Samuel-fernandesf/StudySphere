from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import eventRepository
from datetime import datetime

events_bp = Blueprint('events', __name__)

@events_bp.route('/events', methods=['GET'])
@jwt_required()
def get_events():
    """Retorna todos os eventos do usuário autenticado"""
    user_id = get_jwt_identity()
    
    # Parâmetros opcionais para filtrar por período
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Converter strings para datetime se fornecidas
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    events = eventRepository.get_events_by_user(user_id, start_dt, end_dt)
    return jsonify({'events': [event.to_dict() for event in events]}), 200

@events_bp.route('/events', methods=['POST'])
@jwt_required()
def create_event():
    """Cria um novo evento"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Validar campos obrigatórios
        if not data.get('title') or not data.get('start_date') or not data.get('end_date'):
            return jsonify({'message': 'Campos obrigatórios: title, start_date, end_date'}), 400
        
        # Converter strings para datetime
        start_date = datetime.fromisoformat(data['start_date'])
        end_date = datetime.fromisoformat(data['end_date'])
        
        event = eventRepository.create_event(
            user_id=user_id,
            title=data['title'],
            start_date=start_date,
            end_date=end_date,
            description=data.get('description'),
            all_day=data.get('all_day', False),
            color=data.get('color', '#3b82f6')
        )
        
        return jsonify({'message': 'Evento criado com sucesso!', 'event': event.to_dict()}), 201
    except Exception as e:
        print(f"Erro ao criar evento: {e}")
        return jsonify({'message': 'Erro ao criar evento'}), 500

@events_bp.route('/events/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    """Retorna um evento específico"""
    user_id = get_jwt_identity()
    event = eventRepository.get_event_by_id(event_id)
    
    if not event:
        return jsonify({'message': 'Evento não encontrado'}), 404
    
    if event.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    return jsonify({'event': event.to_dict()}), 200

@events_bp.route('/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    """Atualiza um evento existente"""
    user_id = get_jwt_identity()
    event = eventRepository.get_event_by_id(event_id)
    
    if not event:
        return jsonify({'message': 'Evento não encontrado'}), 404
    
    if event.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    data = request.get_json()
    
    try:
        # Preparar dados para atualização
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'start_date' in data:
            update_data['start_date'] = datetime.fromisoformat(data['start_date'])
        if 'end_date' in data:
            update_data['end_date'] = datetime.fromisoformat(data['end_date'])
        if 'all_day' in data:
            update_data['all_day'] = data['all_day']
        if 'color' in data:
            update_data['color'] = data['color']
        
        updated_event = eventRepository.update_event(event_id, **update_data)
        return jsonify({'message': 'Evento atualizado com sucesso!', 'event': updated_event.to_dict()}), 200
    except Exception as e:
        print(f"Erro ao atualizar evento: {e}")
        return jsonify({'message': 'Erro ao atualizar evento'}), 500

@events_bp.route('/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    """Deleta um evento"""
    user_id = get_jwt_identity()
    event = eventRepository.get_event_by_id(event_id)
    
    if not event:
        return jsonify({'message': 'Evento não encontrado'}), 404
    
    if event.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    try:
        eventRepository.delete_event(event_id)
        return jsonify({'message': 'Evento deletado com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao deletar evento: {e}")
        return jsonify({'message': 'Erro ao deletar evento'}), 500
