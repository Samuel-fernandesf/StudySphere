from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import taskRepository
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    """Retorna todas as tarefas do usuário autenticado"""
    user_id = get_jwt_identity()
    
    # Parâmetros opcionais para filtrar
    subject_id = request.args.get('subject_id', type=int)
    completed = request.args.get('completed', type=lambda v: v.lower() == 'true' if v else None)
    
    tasks = taskRepository.get_tasks_by_user(user_id, subject_id, completed)
    return jsonify({'tasks': [task.to_dict() for task in tasks]}), 200

@tasks_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """Cria uma nova tarefa"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
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
        print(f"Erro ao criar tarefa: {e}")
        return jsonify({'message': 'Erro ao criar tarefa'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Retorna uma tarefa específica"""
    user_id = get_jwt_identity()
    task = taskRepository.get_task_by_id(task_id)
    
    if not task:
        return jsonify({'message': 'Tarefa não encontrada'}), 404
    
    if task.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    return jsonify({'task': task.to_dict()}), 200

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Atualiza uma tarefa existente"""
    user_id = get_jwt_identity()
    task = taskRepository.get_task_by_id(task_id)
    
    if not task:
        return jsonify({'message': 'Tarefa não encontrada'}), 404
    
    if task.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    data = request.get_json()
    
    try:
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
        print(f"Erro ao atualizar tarefa: {e}")
        return jsonify({'message': 'Erro ao atualizar tarefa'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Deleta uma tarefa"""
    user_id = get_jwt_identity()
    task = taskRepository.get_task_by_id(task_id)
    
    if not task:
        return jsonify({'message': 'Tarefa não encontrada'}), 404
    
    if task.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    try:
        taskRepository.delete_task(task_id)
        return jsonify({'message': 'Tarefa deletada com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao deletar tarefa: {e}")
        return jsonify({'message': 'Erro ao deletar tarefa'}), 500

@tasks_bp.route('/tasks/<int:task_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_task_completion(task_id):
    """Alterna o status de conclusão de uma tarefa"""
    user_id = get_jwt_identity()
    task = taskRepository.get_task_by_id(task_id)
    
    if not task:
        return jsonify({'message': 'Tarefa não encontrada'}), 404
    
    if task.user_id != user_id:
        return jsonify({'message': 'Acesso não autorizado'}), 403
    
    try:
        updated_task = taskRepository.toggle_task_completion(task_id)
        return jsonify({
            'message': 'Status da tarefa atualizado!',
            'task': updated_task.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao alternar status da tarefa: {e}")
        return jsonify({'message': 'Erro ao alternar status da tarefa'}), 500

@tasks_bp.route('/tasks/by-subject', methods=['GET'])
@jwt_required()
def get_tasks_by_subject():
    """Retorna tarefas agrupadas por matéria"""
    user_id = get_jwt_identity()
    
    try:
        tasks_grouped = taskRepository.get_tasks_by_subject_grouped(user_id)
        return jsonify({'tasks_by_subject': tasks_grouped}), 200
    except Exception as e:
        print(f"Erro ao buscar tarefas por matéria: {e}")
        return jsonify({'message': 'Erro ao buscar tarefas'}), 500
