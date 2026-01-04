from utils.db import db
from models.assistant_conversation import AssistantConversation, AssistantMessage
from datetime import datetime


def create_conversation(user_id, title='Nova Conversa', subject=None):
    """Create a new conversation for a user."""
    conversation = AssistantConversation(user_id=user_id, title=title, subject=subject)
    db.session.add(conversation)
    db.session.commit()
    return conversation


def get_user_conversations(user_id, limit=50):
    """Get all conversations for a user, ordered by most recent."""
    return AssistantConversation.query.filter_by(user_id=user_id)\
        .order_by(AssistantConversation.updated_at.desc())\
        .limit(limit)\
        .all()


def get_conversation_by_id(conversation_id, user_id=None):
    """Get a conversation by ID, optionally verifying ownership."""
    query = AssistantConversation.query.filter_by(id=conversation_id)
    if user_id:
        query = query.filter_by(user_id=user_id)
    return query.first()


def get_conversation_with_messages(conversation_id, user_id=None):
    """Get a conversation with all its messages."""
    conversation = get_conversation_by_id(conversation_id, user_id)
    if conversation:
        return conversation.to_dict(include_messages=True)
    return None


def add_message(conversation_id, role, content, citations=None):
    """Add a message to a conversation."""
    message = AssistantMessage(
        conversation_id=conversation_id,
        role=role,
        content=content,
        citations=citations
    )
    db.session.add(message)
    
    conversation = AssistantConversation.query.get(conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
    
    db.session.commit()
    return message


def delete_conversation(conversation_id, user_id):
    """Delete a conversation and all its messages."""
    conversation = get_conversation_by_id(conversation_id, user_id)
    if conversation:
        db.session.delete(conversation)
        db.session.commit()
        return True
    return False


def update_conversation_title(conversation_id, title, user_id):
    """Update a conversation's title."""
    conversation = get_conversation_by_id(conversation_id, user_id)
    if conversation:
        conversation.title = title
        db.session.commit()
        return conversation
    return None


def generate_title_from_question(question, max_length=50):
    """Generate a conversation title from the first question."""
    title = question.strip()
    if len(title) > max_length:
        title = title[:max_length-3] + '...'
    return title
