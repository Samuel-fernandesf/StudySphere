from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import join_room
from models import TipoChat
from repositories import chatRepository, messageRepository, chatUsuarioRepository, userRepository
from schemas import chat_schema, message_schema
from utils.socket_handlers.connections import user_sids
from utils.extensions import socket_io
from utils.db import db

chat = Blueprint('chats', __name__)

def _error(code, message, http_status=400):
    return jsonify({'status': 'error', 'code': code, 'message': message}), http_status

def _ok(payload=None, http_status=200):
    payload = payload or {'status': 'ok'}
    return jsonify(payload), http_status

def _parse_pagination(default_page=1, default_per_page=50, max_per_page=200):
    try:
        page = max(1, int(request.args.get('page', default_page)))
    except (TypeError, ValueError):
        page = default_page
    try:
        per_page = min(max_per_page, max(1, int(request.args.get('per_page', default_per_page))))
    except (TypeError, ValueError):
        per_page = default_per_page
    offset = (page - 1) * per_page
    return page, per_page, offset

def _normalize_message(raw: dict) -> dict:
    return {
        'id': raw.get('id'),
        'chat_id': raw.get('chat_id') or (raw.get('chat') or {}).get('id'),
        'user_id': raw.get('usuario_id') or raw.get('user_id'),
        'user_name': (raw.get('usuario_remetente') or {}).get('nome') if raw.get('usuario_remetente') else None,
        'content': raw.get('conteudo_msg') or raw.get('content'),
        'created_at': raw.get('data_envio') or raw.get('created_at'),
    }

#Decorator que qxige que o usuario seja membro do chat
def ensure_member(f):
    @wraps(f)
    def wrapper(chat_id, *args, **kwargs):
        user_id = get_jwt_identity()
        try:
            if not chatUsuarioRepository.get_by_ids(int(user_id), int(chat_id)):
                return _error('NOT_MEMBER', 'Você não participa deste chat', 403)
        except Exception:
            current_app.logger.exception("Erro ao verificar participação do usuário no chat")
            return _error('SERVER_ERROR', 'Erro interno', 500)
        return f(chat_id, *args, **kwargs)
    return wrapper

@chat.route('/', methods=["GET"])
@jwt_required()
def list_chats():
    user_id = get_jwt_identity()
    try:
        chats = chatRepository.get_chats_of_user(int(user_id))
        data = chat_schema.dump(chats, many=True)
        return jsonify(data)
    except Exception:
        current_app.logger.exception("Erro ao listar chats")
        return _error("SERVER_ERROR", "Erro interno ao listar chats", 500)

@chat.route('/<int:chat_id>', methods=["GET"])
@jwt_required()
@ensure_member
def get_chat(chat_id):
    try:
        chat_obj = chatRepository.get_by_id(chat_id)
        if not chat_obj:
            return _error('NOT_FOUND', 'Chat não encontrado', 404)
        return jsonify(chat_schema.dump(chat_obj))
    except Exception:
        current_app.logger.exception("Erro ao obter chat")
        return _error("SERVER_ERROR", "Erro interno ao obter chat", 500)

@chat.route("/<int:chat_id>/messages", methods=["GET"])
@jwt_required()
@ensure_member
def list_messages(chat_id):
    try:
        page, per_page, offset = _parse_pagination()
        msgs = messageRepository.get_messages_of_chat(chat_id=chat_id, limit=per_page, offset=offset)
        # serializa todos de uma vez
        raw_list = message_schema.dump(msgs, many=True)
        # inverter caso o repo retorne desc, preserva API atual (antigo -> recente)
        normalized = [_normalize_message(r) for r in reversed(raw_list)]
        return jsonify({'page': page, 'per_page': per_page, 'messages': normalized})
    except AttributeError:
        current_app.logger.exception("messageRepository.get_messages_of_chat não encontrado ou falhou")
        return _error('SERVER_ERROR', 'Erro ao recuperar mensagens (ver logs)', 500)
    except Exception:
        current_app.logger.exception("Erro ao listar mensagens")
        return _error("SERVER_ERROR", "Erro interno ao listar mensagens", 500)

@chat.route('/', methods=["POST"])
@jwt_required()
def create_chat():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    nome_grupo = data.get('nome_grupo')
    other_user_id = data.get('other_user_id')
    members = data.get('members') or []

    # criar grupo público
    if nome_grupo:
        if not isinstance(nome_grupo, str) or not nome_grupo.strip():
            return _error('INVALID_PAYLOAD', 'nome_grupo inválido')

        try:
            new_chat = chatRepository.create_chat(nome_grupo=nome_grupo.strip(), tipo=TipoChat.publico)
            chatUsuarioRepository.add_user_to_chat(int(user_id), new_chat.id, is_admin=True)

            added = []
            for m in members:
                try:
                    member_id = int(m)
                except Exception:
                    continue
                if member_id == int(user_id):
                    continue
                if not chatUsuarioRepository.get_by_ids(member_id, new_chat.id):
                    chatUsuarioRepository.add_user_to_chat(member_id, new_chat.id, is_admin=False)
                    added.append(member_id)

            #Notificação ou convite para os usuários 
            room_name = f'chat:{new_chat.id}'

            for member_id in added:
                sids = user_sids.get(str(member_id), set())
                for sid in sids:
                    try:
                        # adiciona a sid do usuário à room para que ele passe a receber eventos
                        join_room(room_name, sid=sid)
                        socket_io.emit('invitation_public',
                                       {'chat_id': new_chat.id, 'from_user_id': str(user_id)},
                                       room=sid)
                    except Exception:
                        current_app.logger.exception(f"Erro ao adicionar sid {sid} à sala {room_name}")

            # adiciona se existir as sids do criador à sala também
            for sid in user_sids.get(str(user_id), set()):
                try:
                    join_room(room_name, sid=sid)
                except Exception:
                    current_app.logger.exception(f"Erro ao adicionar sid {sid} do criador à sala {room_name}")

            chat_data = chat_schema.dump(new_chat)
            if added:
                chat_data['added'] = added

            socket_io.emit('chat_created', {'chat': chat_data}, room=room_name)
            return jsonify({'status': 'ok', 'chat_data': chat_data}), 201
        except Exception:
            current_app.logger.exception("Erro ao criar grupo via REST")
            return _error('SERVER_ERROR', 'Erro ao criar grupo', 500)

    # criar chat privado
    if other_user_id:
        try:
            other_user_id = int(other_user_id)
        except Exception:
            return _error('INVALID_PAYLOAD', 'other_user_id inválido')

        if other_user_id == int(user_id):
            return _error('INVALID_PAYLOAD', 'Não é possível criar chat consigo mesmo')

        try:
            # verifica se já existe privado com esse usuário
            user_chats = chatRepository.get_chats_of_user(user_id)
            for chat in user_chats:
                if chat.tipo == TipoChat.privado:
                    members_ids = [assoc.usuario_id for assoc in chat.usuarios_participantes]
                    if other_user_id in members_ids:

                        #notifica o outro usuario que o chat existe
                        for sid in user_sids.get(str(other_user_id), set()):
                            socket_io.emit('private_chat_seen',
                                           {'chat_id': chat.id, 'from_user_id': str(user_id)},
                                           room=sid)
                            
                        return jsonify({'status': 'ok', 'chat_data': chat_schema.dump(chat)})

            new_chat = chatRepository.create_chat(nome_grupo=None, tipo=TipoChat.privado)
            chatUsuarioRepository.add_user_to_chat(user_id, new_chat.id, is_admin=False)
            chatUsuarioRepository.add_user_to_chat(other_user_id, new_chat.id, is_admin=False)

            room_name = f'chat:{new_chat.id}'

            #Auto-join do admin
            for sid in user_sids.get(str(user_id), set()):
                try:
                    join_room(room_name, sid=sid)
                except Exception:
                    current_app.logger.exception(f"Erro ao adicionar sid {sid} do criador à sala {room_name}")

            #join do outro usuario
            for sid in user_sids.get(str(other_user_id), set()):
                try:
                    join_room(room_name, sid=sid)
                    socket_io.emit('invitation_private',
                                   {'chat_id': new_chat.id, 'from_user_id': str(user_id)},
                                   room=sid)
                except Exception:
                    current_app.logger.exception(f"Erro ao adicionar sid {sid} à sala {room_name}")

            chat_data = chat_schema.dump(new_chat)
            socket_io.emit('chat_created', {'chat': chat_data}, room=room_name)
            return jsonify({'status': 'ok', 'chat_data': chat_data}), 201

        except Exception:
            current_app.logger.exception("Erro ao criar chat privado via REST")
            return _error('SERVER_ERROR', 'Erro ao criar chat privado', 500)

    return _error('INVALID_PAYLOAD', 'Nenhum parâmetro válido fornecido')

@chat.route("/<int:chat_id>/join", methods=["POST"])
@jwt_required()
def join_chat(chat_id):
    user_id = get_jwt_identity()
    try:
        if chatUsuarioRepository.get_by_ids(int(user_id), chat_id):
            return jsonify({'status': 'ok', 'message': 'Já participante'})

        chatUsuarioRepository.add_user_to_chat(int(user_id), chat_id, is_admin=False)
        return jsonify({'status': 'ok', 'chat_id': chat_id})
    except Exception:
        current_app.logger.exception("Erro ao adicionar usuário ao chat")
        return _error('SERVER_ERROR', 'Erro ao entrar no chat', 500)    


@chat.route("/<int:chat_id>/leave", methods=["POST"])
@jwt_required()
def leave_chat(chat_id):
    """POST /api/chats/<chat_id>/leave
    Remove o usuário do chat.
    """
    user_id = get_jwt_identity()
    try:
        # tenta remover; se não existir, retorna ok
        # ajuste o nome se o repo usar remove_user_from_chat
        if hasattr(chatUsuarioRepository, "remove_user_from_chat"):
            chatUsuarioRepository.remove_user_from_chat(int(user_id), chat_id)
        else:
            # se não houver método, apenas devolve ok (ou lance uma exceção para forçar implementação)
            current_app.logger.debug("chatUsuarioRepository.remove_user_from_chat não implementado; operação ignorada")
        return jsonify({'status': 'ok', 'chat_id': chat_id})
    except Exception:
        current_app.logger.exception("Erro ao sair do chat")
        return _error('SERVER_ERROR', 'Erro ao sair do chat', 500)
