from .connections import user_sids, sid_user
from flask import request, current_app
from flask_socketio import join_room, emit
from utils.extensions import socket_io
from repositories import chatRepository, chatUsuarioRepository
from models import TipoChat
from schemas import chat_schema

@socket_io.on('add_member')
def handle_add_member(data):
    sid = request.sid
    admin_user_id = sid_user.get(sid)

    if not admin_user_id:
        return {'status': 'error', 'code': 'UNAUTHENTICATED', 'message': 'Conexão não autenticada'}

    chat_id = data.get('chat_id')
    new_member_id = data.get('new_member_id')
    
    if not chat_id or not new_member_id:
        return {'status': 'error', 'message': 'Dados incompletos'}
    
    try:
        chat_id = int(chat_id)
        new_member_id = int(new_member_id)
    except ValueError:
        return {'status': 'error', 'code': 'INVALID_PAYLOAD', 'message': 'IDs devem ser inteiros'}

    #Verifica se o admin_user_id é o administrador do chat
    try:
        if not chatRepository.is_admin(admin_user_id, chat_id):
            return {
                'status': 'error',
                'code': 'FORBIDDEN',
                'message': 'Você não é admin deste chat'
            }
    except Exception:
        current_app.logger.exception("Erro ao verificar admin do chat")
        return {'status': 'error', 'code': 'SERVER_ERROR'}
    
    #Verifica se o usuário já é membro
    if chatUsuarioRepository.get_by_ids(new_member_id, chat_id):
        return {
            'status': 'error',
            'code': 'ALREADY_MEMBER',
            'message': 'Usuário já é membro deste chat'
        }
    
    #Adicionar Membro no banco 
    try:
        chatUsuarioRepository.add_user_to_chat(new_member_id, chat_id, is_admin=False)
    except Exception:
        current_app.logger.exception("Erro ao adicionar usuário no chat")
        return {'status': 'error', 'code': 'SERVER_ERROR'}
    
    #Coloca o membro no grupo
    room_name = f'chat:{chat_id}'

    try:
        if str(new_member_id) in user_sids:
            for member_sid in user_sids[str(new_member_id)]:
                try:
                    join_room(room_name, sid=member_sid)
                except Exception:
                    current_app.logger.exception(f"Erro ao join_room para sid {member_sid}")
    except Exception:
        current_app.logger.exception("Erro ao processar join_room do novo membro")

    #Notifica os membros do chat
    try:
        emit(
            'member_added',
            {
                'chat_id': chat_id,
                'user_id': new_member_id,
                'added_by': admin_user_id
            },
            room=room_name
        )
    except Exception:
        current_app.logger.exception("Erro ao emitir member_added")

    return {'status': 'ok', 'message': 'Membro adicionado com sucesso'}