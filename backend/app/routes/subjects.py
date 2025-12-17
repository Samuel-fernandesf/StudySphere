from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import subjectRepository

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    """Retorna todas as matérias do usuário autenticado"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        subjects = subjectRepository.get_subjects_by_user(user_id)
        return jsonify({'subjects': [subject.to_dict() for subject in subjects]}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao listar matérias: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao listar matérias: {str(e)}'}), 500

@subjects_bp.route('/subjects', methods=['POST'])
@jwt_required()
def create_subject():
    """Cria uma nova matéria"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        data = request.get_json()
        
        # Validar campo obrigatório
        if not data.get('name'):
            return jsonify({'message': 'Campo obrigatório: name'}), 400
        
        subject = subjectRepository.create_subject(
            user_id=user_id,
            name=data['name'],
            color=data.get('color', '#3b82f6'),
            icon=data.get('icon', 'BookOpen'),
            description=data.get('description')
        )
        
        return jsonify({'message': 'Matéria criada com sucesso!', 'subject': subject.to_dict()}), 201
    except Exception as e:
        import traceback
        print(f"Erro ao criar matéria: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao criar matéria: {str(e)}'}), 500

@subjects_bp.route('/subjects/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subject(subject_id):
    """Retorna uma matéria específica"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        subject = subjectRepository.get_subject_by_id(subject_id)
        
        if not subject:
            return jsonify({'message': 'Matéria não encontrada'}), 404
            
        if subject.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify({'subject': subject.to_dict()}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao obter matéria: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao obter matéria: {str(e)}'}), 500

@subjects_bp.route('/subjects/<int:subject_id>', methods=['PUT'])
@jwt_required()
def update_subject(subject_id):
    """Atualiza uma matéria existente"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        subject = subjectRepository.get_subject_by_id(subject_id)
        
        if not subject:
            return jsonify({'message': 'Matéria não encontrada'}), 404
            
        if subject.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Preparar dados para atualização
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'color' in data:
            update_data['color'] = data['color']
        if 'icon' in data:
            update_data['icon'] = data['icon']
        if 'description' in data:
            update_data['description'] = data['description']
        
        updated_subject = subjectRepository.update_subject(subject_id, **update_data)
        return jsonify({'message': 'Matéria atualizada com sucesso!', 'subject': updated_subject.to_dict()}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao atualizar matéria: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao atualizar matéria: {str(e)}'}), 500

@subjects_bp.route('/subjects/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        subject = subjectRepository.get_subject_by_id(subject_id)
        
        if not subject:
            return jsonify({'message': 'Matéria não encontrada'}), 404
            
        if subject.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        subjectRepository.delete_subject(subject_id)
        return jsonify({'message': 'Matéria deletada com sucesso!'}), 200
    except Exception as e:
        import traceback
        print("ERRO AO DELETAR MATÉRIA:", e)
        traceback.print_exc()
        return jsonify({'message': f'Erro ao deletar matéria: {str(e)}'}), 500