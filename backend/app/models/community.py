from utils.db import db
from datetime import datetime


class Post(db.Model):
    """Posts da comunidade compartilhados pelos usuários."""
    __tablename__ = 'post'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    user = db.relationship('Usuario', backref=db.backref('posts', lazy='dynamic'))
    subject = db.relationship('Subject', backref=db.backref('posts', lazy='dynamic'))
    likes = db.relationship('PostLike', back_populates='post', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('PostComment', back_populates='post', lazy='dynamic', cascade='all, delete-orphan', order_by='PostComment.created_at')

    def __init__(self, user_id, content, subject_id=None):
        self.user_id = user_id
        self.content = content
        self.subject_id = subject_id

    def to_dict(self, current_user_id=None):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'nome_completo': self.user.nome_completo,
                'username': self.user.username
            },
            'content': self.content,
            'subject': {
                'id': self.subject.id,
                'name': self.subject.name
            } if self.subject else None,
            'likes_count': self.likes.count(),
            'comments_count': self.comments.count(),
            'liked_by_user': self.is_liked_by(current_user_id) if current_user_id else False,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def is_liked_by(self, user_id):
        if not user_id:
            return False
        return self.likes.filter_by(user_id=user_id).first() is not None


class PostLike(db.Model):
    """Likes em posts da comunidade."""
    __tablename__ = 'post_like'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Restrição única - usuário só pode curtir um post uma vez
    __table_args__ = (
        db.UniqueConstraint('post_id', 'user_id', name='uq_post_user_like'),
    )

    # Relacionamentos
    post = db.relationship('Post', back_populates='likes')
    user = db.relationship('Usuario', backref=db.backref('post_likes', lazy='dynamic'))

    def __init__(self, post_id, user_id):
        self.post_id = post_id
        self.user_id = user_id


class PostComment(db.Model):
    """Comentários em posts da comunidade."""
    __tablename__ = 'post_comment'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relacionamentos
    post = db.relationship('Post', back_populates='comments')
    user = db.relationship('Usuario', backref=db.backref('post_comments', lazy='dynamic'))

    def __init__(self, post_id, user_id, content):
        self.post_id = post_id
        self.user_id = user_id
        self.content = content

    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'nome_completo': self.user.nome_completo,
                'username': self.user.username
            },
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }
