from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import taskRepository
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    """Retorna todas as tarefas do usuário autenticado"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        # Parâmetros opcionais para filtrar
        subject_id = request.args.get('subject_id', type=int)
        completed = request.args.get('completed', type=lambda v: v.lower() == 'true' if v else None)
        
        tasks = taskRepository.get_tasks_by_user(user_id, subject_id, completed)
        return jsonify({'tasks': [task.to_dict() for task in tasks]}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao listar tarefas: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao listar tarefas: {str(e)}'}), 500

@tasks_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """Cria uma nova tarefa"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)

        data = request.get_json()
    
        # Validar campos obrigatórios
        if not data.get('title') or not data.get('subject_id'):
            return jsonify({'message': 'Campos obrigatórios: title, subject_id'}), 400
        
        # Converter string para datetime se fornecida
        due_date = None
        if data.get('due_date'):
            due_date = datetime.fromisoformat(data['due_date'])
        
        task = taskRepository.create_task(
            user_id=user_id,
            subject_id=data['subject_id'],
            title=data['title'],
            description=data.get('description'),
            due_date=due_date,
            priority=data.get('priority', 'medium')
        )
        
        return jsonify({'message': 'Tarefa criada com sucesso!', 'task': task.to_dict()}), 201
    except Exception as e:
        import traceback
        print(f"Erro ao criar tarefa: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao criar tarefa: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Retorna uma tarefa específica"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        task = taskRepository.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'message': 'Tarefa não encontrada'}), 404
        
        if task.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify({'task': task.to_dict()}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao obter tarefa: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao obter tarefa: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Atualiza uma tarefa existente"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        task = taskRepository.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'message': 'Tarefa não encontrada'}), 404

        if task.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Preparar dados para atualização
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'due_date' in data:
            update_data['due_date'] = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        if 'priority' in data:
            update_data['priority'] = data['priority']
        if 'completed' in data:
            update_data['completed'] = data['completed']
            if data['completed']:
                update_data['completed_at'] = datetime.utcnow()
            else:
                update_data['completed_at'] = None
        
        updated_task = taskRepository.update_task(task_id, **update_data)
        return jsonify({'message': 'Tarefa atualizada com sucesso!', 'task': updated_task.to_dict()}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao atualizar tarefa: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao atualizar tarefa: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Deleta uma tarefa"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        task = taskRepository.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'message': 'Tarefa não encontrada'}), 404
        
        if task.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        taskRepository.delete_task(task_id)
        return jsonify({'message': 'Tarefa deletada com sucesso!'}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao deletar tarefa: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao deletar tarefa: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_task_completion(task_id):
    """Alterna o status de conclusão de uma tarefa"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        task = taskRepository.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'message': 'Tarefa não encontrada'}), 404
        
        if task.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        updated_task = taskRepository.toggle_task_completion(task_id)
        return jsonify({
            'message': 'Status da tarefa atualizado!',
            'task': updated_task.to_dict()
        }), 200
    except Exception as e:
        import traceback
        print(f"Erro ao alternar status da tarefa: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao alternar status da tarefa: {str(e)}'}), 500

@tasks_bp.route('/tasks/by-subject', methods=['GET'])
@jwt_required()
def get_tasks_by_subject():
    """Retorna tarefas agrupadas por matéria"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        tasks_grouped = taskRepository.get_tasks_by_subject_grouped(user_id)
        return jsonify({'tasks_by_subject': tasks_grouped}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao buscar tarefas por matéria: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao buscar tarefas: {str(e)}'}), 500
