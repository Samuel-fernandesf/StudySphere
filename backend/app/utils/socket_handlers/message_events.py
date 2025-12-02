from .connections import sid_user
from flask import request, current_app
from flask_socketio import emit, disconnect
from utils.extensions import socket_io
from repositories import messageRepository, chatUsuarioRepository
from models import TipoMensagem
from schemas import message_schema

@socket_io.on('send_message')
def handle_send_message(payload):
    sid = request.sid
    user_id = sid_user.get(sid)

    if not user_id:
        emit('error', {'code': 'UNAUTHENTICATED', 'message': 'Conexão não autenticada'}, room=sid)
        return disconnect()
    
    chat_id = payload.get('chat_id')
    content = payload.get('content')
    temp_id = payload.get('temp_id')

    try:
        chat_id = int(chat_id)
    except Exception:
        emit('send_error', {'code': 'INVALID_PAYLOAD', 'message': 'chat_id inválido', 'temp_id': temp_id}, room=sid)
        return
        
    if not chat_id or not content:
        emit('send_error', {'code': 'INVALID_PAYLOAD', 'message': 'chat_id e content obrigatórios', 'temp_id': temp_id}, room=sid)
        return
    
    if not isinstance(content, str) or len(content) > 5000:
        emit('send_error', {'code': 'INVALID_CONTENT', 'message': 'Conteúdo inválido', 'temp_id': temp_id}, room=sid)
        return
    
    if not chatUsuarioRepository.get_by_ids(int(user_id), int(chat_id)):
        emit('send_error', {'code': 'NOT_MEMBER', 'message': 'Você não participa deste chat', 'temp_id': temp_id}, room=sid)
        return
    
    try:
        message = messageRepository.create_message(user_id, chat_id, content, TipoMensagem.mensagem)
        raw = message_schema.dump(message)

        message_payload = {
            'id': raw.get('id'),
            'chat_id': raw.get('chat_id') or raw.get('chat') and raw['chat'].get('id'),
            'user_id': raw.get('usuario_id') or raw.get('user_id'),
            'user_name': None,
            'content': raw.get('conteudo_msg') or raw.get('content'),
            'created_at': raw.get('data_envio') or raw.get('created_at'),
        }

        try:
            if raw.get('usuario_remetente'):
                message_payload['user_name'] = raw['usuario_remetente'].get('nome') or raw['usuario_remetente'].get('username')
        except Exception:
            pass

        if temp_id:
            message_payload['temp_id'] = temp_id

        room_name = f'chat:{chat_id}'
        emit('new_message', message_payload, room=room_name, include_self=False)

        return {'status': 'ok', 'message': message_payload}

    except Exception:
        current_app.logger.exception("Erro ao salvar ou emitir mensagem")
        emit('send_error', {'code': 'SERVER_ERROR', 'message': 'Erro interno ao salvar mensagem', 'temp_id': temp_id}, room=sid)


