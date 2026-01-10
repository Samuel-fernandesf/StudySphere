from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import community_repo

community_bp = Blueprint('community', __name__)




@community_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    """Busca posts da comunidade com paginação."""
    current_user_id = int(get_jwt_identity())
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    subject_id = request.args.get('subject_id', type=int)
    
    pagination = community_repo.get_posts(page=page, per_page=per_page, subject_id=subject_id)
    
    return jsonify({
        'posts': [post.to_dict(current_user_id) for post in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    }), 200


@community_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Cria um novo post na comunidade."""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Conteúdo é obrigatório'}), 400
    
    if len(content) > 2000:
        return jsonify({'error': 'Conteúdo muito longo (máximo 2000 caracteres)'}), 400
    
    subject_id = data.get('subject_id')
    
    post = community_repo.create_post(
        user_id=current_user_id,
        content=content,
        subject_id=subject_id
    )
    
    return jsonify({
        'message': 'Post criado com sucesso!',
        'post': post.to_dict(current_user_id)
    }), 201


@community_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Deleta um post."""
    current_user_id = int(get_jwt_identity())
    
    success = community_repo.delete_post(post_id, current_user_id)
    
    if not success:
        return jsonify({'error': 'Post não encontrado ou sem permissão'}), 404
    
    return jsonify({'message': 'Post deletado com sucesso'}), 200




@community_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    """Curte ou descurte um post."""
    current_user_id = int(get_jwt_identity())
    
    liked, post = community_repo.toggle_like(post_id, current_user_id)
    
    if post is None:
        return jsonify({'error': 'Post não encontrado'}), 404
    
    return jsonify({
        'liked': liked,
        'likes_count': post.likes.count()
    }), 200




@community_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(post_id):
    """Busca comentários de um post."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    pagination = community_repo.get_comments(post_id, page=page, per_page=per_page)
    
    return jsonify({
        'comments': [comment.to_dict() for comment in pagination.items],
        'total': pagination.total,
        'has_next': pagination.has_next
    }), 200


@community_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    """Adiciona um comentário a um post."""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Comentário é obrigatório'}), 400
    
    if len(content) > 500:
        return jsonify({'error': 'Comentário muito longo (máximo 500 caracteres)'}), 400
    
    comment = community_repo.add_comment(post_id, current_user_id, content)
    
    if not comment:
        return jsonify({'error': 'Post não encontrado'}), 404
    
    return jsonify({
        'message': 'Comentário adicionado!',
        'comment': comment.to_dict()
    }), 201


@community_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Deleta um comentário."""
    current_user_id = int(get_jwt_identity())
    
    success = community_repo.delete_comment(comment_id, current_user_id)
    
    if not success:
        return jsonify({'error': 'Comentário não encontrado ou sem permissão'}), 404
    
    return jsonify({'message': 'Comentário deletado'}), 200




@community_bp.route('/ranking', methods=['GET'])
@jwt_required()
def get_ranking():
    """Busca o ranking dos melhores usuários."""
    limit = request.args.get('limit', 50, type=int)
    
    users = community_repo.get_ranking(limit=limit)
    
    ranking = []
    for i, user in enumerate(users, 1):
        ranking.append({
            'position': i,
            'user_id': user.id,
            'nome_completo': user.nome_completo,
            'username': user.username,
            'pontos': user.pontos or 0
        })
    
    return jsonify({'ranking': ranking}), 200


@community_bp.route('/ranking/me', methods=['GET'])
@jwt_required()
def get_my_ranking():
    """Busca o ranking do usuário atual."""
    current_user_id = int(get_jwt_identity())
    
    position, user = community_repo.get_user_ranking(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'position': position,
        'pontos': user.pontos or 0,
        'nome_completo': user.nome_completo
    }), 200
