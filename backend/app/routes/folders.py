from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import folderRepository

folders_bp = Blueprint('folders', __name__)


@folders_bp.route('/folders', methods=['GET'])
@jwt_required()
def get_folders():
    """Retorna pastas de uma matéria em um nível específico"""
    try:
        user_id = get_jwt_identity()
        # Garantir que user_id é inteiro
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        subject_id = request.args.get('subject_id', type=int)
        parent_id = request.args.get('parent_id', type=int)
        
        if not subject_id:
            return jsonify({'message': 'subject_id é obrigatório'}), 400
        
        folders = folderRepository.get_folders_by_subject(subject_id, parent_id)
        return jsonify({
            'folders': [folder.to_dict() for folder in folders],
            'subject_id': subject_id,
            'parent_id': parent_id
        }), 200
    except Exception as e:
        import traceback
        print(f"Erro ao listar pastas: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao listar pastas: {str(e)}'}), 500


@folders_bp.route('/folders/<int:folder_id>/path', methods=['GET'])
@jwt_required()
def get_folder_path(folder_id):
    """Retorna o caminho completo (breadcrumb) de uma pasta"""
    try:
        path = folderRepository.get_folder_path(folder_id)
        return jsonify({'path': path}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao obter caminho da pasta: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao obter caminho: {str(e)}'}), 500


@folders_bp.route('/folders', methods=['POST'])
@jwt_required()
def create_folder():
    """Cria uma nova pasta"""
    user_id = get_jwt_identity()
    if isinstance(user_id, str):
        user_id = int(user_id)

    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': 'Campo obrigatório: name'}), 400
    
    if not data.get('subject_id'):
        return jsonify({'message': 'Campo obrigatório: subject_id'}), 400
    
    try:
        folder = folderRepository.create_folder(
            user_id=user_id,
            subject_id=data['subject_id'],
            name=data['name'],
            parent_id=data.get('parent_id'),
            color=data.get('color', '#6366f1')
        )
        return jsonify({
            'message': 'Pasta criada com sucesso!',
            'folder': folder.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        import traceback
        print(f"Erro ao criar pasta: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao criar pasta: {str(e)}'}), 500


@folders_bp.route('/folders/<int:folder_id>', methods=['GET'])
@jwt_required()
def get_folder(folder_id):
    """Retorna uma pasta específica"""
    folder = folderRepository.get_folder_by_id(folder_id)
    
    if not folder:
        return jsonify({'message': 'Pasta não encontrada'}), 404
    
    return jsonify({'folder': folder.to_dict()}), 200


@folders_bp.route('/folders/<int:folder_id>', methods=['PUT'])
@jwt_required()
def update_folder(folder_id):
    """Atualiza uma pasta existente"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        folder = folderRepository.get_folder_by_id(folder_id)
        
        if not folder:
            return jsonify({'message': 'Pasta não encontrada'}), 404
        
        if folder.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'color' in data:
            update_data['color'] = data['color']
        
        updated_folder = folderRepository.update_folder(folder_id, **update_data)
        return jsonify({
            'message': 'Pasta atualizada com sucesso!',
            'folder': updated_folder.to_dict()
        }), 200
    except Exception as e:
        import traceback
        print(f"Erro ao atualizar pasta: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao atualizar pasta: {str(e)}'}), 500


@folders_bp.route('/folders/<int:folder_id>', methods=['DELETE'])
@jwt_required()
def delete_folder(folder_id):
    """Deleta uma pasta e todo seu conteúdo"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        folder = folderRepository.get_folder_by_id(folder_id)
        
        if not folder:
            return jsonify({'message': 'Pasta não encontrada'}), 404
        
        if folder.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        folderRepository.delete_folder(folder_id)
        return jsonify({'message': 'Pasta e conteúdo deletados com sucesso!'}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao deletar pasta: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao deletar pasta: {str(e)}'}), 500
