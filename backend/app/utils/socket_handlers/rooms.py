
from flask import request, current_app
from flask_socketio import join_room, leave_room
from utils.extensions import socket_io
from .connections import sid_user
from repositories import chatUsuarioRepository

@socket_io.on('join_chat')
def handle_join_chat(payload):
    sid = request.sid
    user_id = sid_user.get(sid)
    if not user_id:
        return {'status': 'error', 'code': 'UNAUTHENTICATED', 'message': 'Conexão não autenticada'}

    chat_id = payload.get('chat_id')
    try:
        chat_id = int(chat_id)
    except Exception:
        return {'status': 'error', 'code': 'INVALID_PAYLOAD', 'message': 'chat_id inválido'}

    #Verifica se o usuário participa do chat
    if not chatUsuarioRepository.get_by_ids(int(user_id), chat_id):
        return {'status': 'error', 'code': 'NOT_MEMBER', 'message': 'Você não participa deste chat'}

    try:
        room_name = f'chat:{chat_id}'
        join_room(room_name, sid=sid)
        return {'status': 'ok', 'chat_id': chat_id}
    except Exception:
        current_app.logger.exception("Erro ao join_room")
        return {'status':'error', 'code':'SERVER_ERROR', 'message':'Não foi possível entrar no chat'}

@socket_io.on('leave_chat')
def handle_leave_chat(payload):
    sid = request.sid
    user_id = sid_user.get(sid)
    if not user_id:
        return {'status': 'error', 'code': 'UNAUTHENTICATED', 'message': 'Conexão não autenticada'}

    chat_id = payload.get('chat_id')
    try:
        chat_id = int(chat_id)
    except Exception:
        return {'status': 'error', 'code': 'INVALID_PAYLOAD', 'message': 'chat_id inválido'}

    try:
        room_name = f'chat:{chat_id}'
        leave_room(room_name, sid=sid)
        return {'status':'ok', 'chat_id':chat_id}
    except Exception:
        current_app.logger.exception("Erro no leave_room")
        return {'status':'error', 'code':'SERVER_ERROR', 'message':'Não foi possível sair do chat'}