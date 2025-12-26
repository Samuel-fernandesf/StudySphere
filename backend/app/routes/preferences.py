from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import preferenceRepository

preferences_bp = Blueprint('preferences', __name__)

@preferences_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Retorna as preferências do usuário autenticado"""
    user_id = get_jwt_identity()
    
    try:
        prefs = preferenceRepository.get_by_user_id(user_id)
        return jsonify({'preferences': prefs.to_dict()}), 200
    except Exception as e:
        print(f"Erro ao buscar preferências: {e}")
        return jsonify({'error': 'Erro ao buscar preferências'}), 500


@preferences_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Atualiza as preferências do usuário"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    try:
        prefs = preferenceRepository.update(user_id, data)
        return jsonify({
            'message': 'Preferências atualizadas com sucesso',
            'preferences': prefs.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar preferências: {e}")
        return jsonify({'error': 'Erro ao atualizar preferências'}), 500
