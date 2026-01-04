from utils.db import db
from datetime import datetime
import json


class AssistantConversation(db.Model):
    """Stores conversation sessions with the educational assistant."""
    __tablename__ = 'assistant_conversation'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False, default='Nova Conversa')
    subject = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = db.relationship('AssistantMessage', back_populates='conversation', 
                               lazy='dynamic', cascade='all, delete-orphan',
                               order_by='AssistantMessage.created_at')
    user = db.relationship('Usuario', backref=db.backref('assistant_conversations', lazy='dynamic'))

    def __init__(self, user_id, title='Nova Conversa', subject=None):
        self.user_id = user_id
        self.title = title
        self.subject = subject

    def to_dict(self, include_messages=False):
        data = {
            'id': self.id,
            'title': self.title,
            'subject': self.subject,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        if include_messages:
            data['messages'] = [msg.to_dict() for msg in self.messages.all()]
        return data


class AssistantMessage(db.Model):
    """Stores individual messages within a conversation."""
    __tablename__ = 'assistant_message'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('assistant_conversation.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    citations = db.Column(db.Text, nullable=True)  # JSON array of citation URLs
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    conversation = db.relationship('AssistantConversation', back_populates='messages')

    def __init__(self, conversation_id, role, content, citations=None):
        self.conversation_id = conversation_id
        self.role = role
        self.content = content
        self.citations = json.dumps(citations) if citations else None

    def to_dict(self):
        citations_list = []
        if self.citations:
            try:
                citations_list = json.loads(self.citations)
            except json.JSONDecodeError:
                citations_list = []
        
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'citations': citations_list,
            'created_at': self.created_at.isoformat()
        }
