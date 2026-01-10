from utils.db import db
from models.community import Post, PostLike, PostComment
from models.usuario import Usuario
from datetime import datetime



def create_post(user_id, content, subject_id=None):
    """Cria um novo post na comunidade."""
    post = Post(user_id=user_id, content=content, subject_id=subject_id)
    db.session.add(post)
    
    # Adiciona pontos pela postagem
    user = Usuario.query.get(user_id)
    if user:
        user.pontos = (user.pontos or 0) + 5
    
    db.session.commit()
    return post


def get_posts(page=1, per_page=20, subject_id=None):
    """Busca posts paginados, opcionalmente filtrados por matéria."""
    query = Post.query
    if subject_id:
        query = query.filter_by(subject_id=subject_id)
    
    return query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )


def get_post_by_id(post_id):
    """Busca um post pelo ID."""
    return Post.query.get(post_id)


def delete_post(post_id, user_id):
    """Deleta um post se o usuário for o dono."""
    post = Post.query.filter_by(id=post_id, user_id=user_id).first()
    if post:
        db.session.delete(post)
        db.session.commit()
        return True
    return False




def toggle_like(post_id, user_id):
    """Alterna like no post. Retorna (liked, post)."""
    post = Post.query.get(post_id)
    if not post:
        return None, None
    
    existing_like = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
    
    if existing_like:
        db.session.delete(existing_like)
        # Remove pontos do autor do post
        if post.user:
            post.user.pontos = max(0, (post.user.pontos or 0) - 2)
        db.session.commit()
        return False, post
    else:
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.session.add(new_like)
        # Adiciona pontos ao autor do post
        if post.user and post.user_id != user_id:
            post.user.pontos = (post.user.pontos or 0) + 2
        db.session.commit()
        return True, post




def add_comment(post_id, user_id, content):
    """Adiciona um comentário ao post."""
    post = Post.query.get(post_id)
    if not post:
        return None
    
    comment = PostComment(post_id=post_id, user_id=user_id, content=content)
    db.session.add(comment)
    db.session.commit()
    return comment


def get_comments(post_id, page=1, per_page=50):
    """Busca comentários paginados de um post."""
    return PostComment.query.filter_by(post_id=post_id)\
        .order_by(PostComment.created_at.asc())\
        .paginate(page=page, per_page=per_page, error_out=False)


def delete_comment(comment_id, user_id):
    """Deleta um comentário se o usuário for o dono."""
    comment = PostComment.query.filter_by(id=comment_id, user_id=user_id).first()
    if comment:
        db.session.delete(comment)
        db.session.commit()
        return True
    return False




def get_ranking(limit=50):
    """Busca os usuários com mais pontos."""
    return Usuario.query\
        .filter(Usuario.pontos > 0)\
        .order_by(Usuario.pontos.desc())\
        .limit(limit)\
        .all()


def get_user_ranking(user_id):
    """Busca a posição de ranking de um usuário específico."""
    user = Usuario.query.get(user_id)
    if not user:
        return None, None
    
    # Conta usuários com mais pontos
    position = Usuario.query.filter(Usuario.pontos > (user.pontos or 0)).count() + 1
    return position, user


def add_points(user_id, points, reason=None):
    """Adiciona pontos a um usuário."""
    user = Usuario.query.get(user_id)
    if user:
        user.pontos = (user.pontos or 0) + points
        db.session.commit()
        return user
    return None
