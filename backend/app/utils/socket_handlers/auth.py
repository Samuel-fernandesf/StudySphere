from .connections import add_sid_for_user, remove_sid, user_sids
from flask import request, current_app
from flask_socketio import emit, disconnect, join_room
from flask_jwt_extended import decode_token, exceptions
from jwt import ExpiredSignatureError, DecodeError, InvalidSignatureError
from utils.extensions import socket_io
from repositories import tokenRepository, userRepository, chatRepository

@socket_io.on('connect')
def handle_connect(auth):

    token = None

    if auth and isinstance(auth, dict):
        token = auth.get('token')

    if not token:
        emit('auth_error', {'code':'NO_TOKEN', 'message':'Token ausente'}, room=request.sid)
        return disconnect()

    try:
        token_decoded = decode_token(token)

        identity = token_decoded.get('sub')
        jti = token_decoded.get('jti')

        if not identity:
            emit('auth_error', {'code': 'INVALID_TOKEN', 'message': 'Token sem identity'}, room=request.sid)
            return disconnect()
        
        if tokenRepository.is_revoked(jti=jti):
            emit('auth_error', {'code': 'TOKEN_REVOKED', 'message': 'Token revogado'}, room=request.sid)
            return disconnect()
        
        user = userRepository.get_by_id(identity)
        if not user:
            emit('auth_error', {'code': 'USER_NOT_FOUND', 'message': 'Usuário não existe'}, room=request.sid)
            return disconnect()
        
        add_sid_for_user(str(user.id), request.sid)
        emit('auth_success', {'user_id': str(user.id)}, room=request.sid)

        try:
            user_chats = chatRepository.get_chats_of_user(int(user.id))

            joined = []
            for chat in user_chats:
                try:
                    room_name = f'chat:{chat.id}'
                    # adiciona a SID atual à room
                    join_room(room_name, sid=request.sid)
                    joined.append(chat.id)
                except Exception:
                    current_app.logger.exception(f"Erro ao adicionar sid {request.sid} à sala {room_name}")

            if joined:
                emit('joined_chats', {'chat_ids': joined}, room=request.sid)

        except Exception:
            current_app.logger.exception("Erro ao recuperar chats do usuário para auto-join")

    except ExpiredSignatureError:
        emit('auth_error', {'code': 'TOKEN_EXPIRED', 'message': 'Token expirado'}, room=request.sid)
        return disconnect()
    
    except (DecodeError, InvalidSignatureError, exceptions.JWTExtendedException):
        emit('auth_error', {'code': 'INVALID_TOKEN', 'message': 'Token inválido'}, room=request.sid)
        return disconnect()

    except Exception as e:
        current_app.logger.exception('Erro ao autenticar conexão Socket.IO')
        emit('auth_error', {'code': 'SERVER_ERROR', 'message': 'Erro interno'}, room=request.sid)
        return disconnect()
    
@socket_io.on('disconnect')
def handle_disconnect():
    sid = request.sid
    user_id = remove_sid(sid)
    current_app.logger.info(f"Socket {sid} desconectado - user_id={user_id}")

def disconnect_user(user_id):
    sids = list(user_sids.get(str(user_id), set()))
    for sid in sids:

        socket_io.emit('auth_error', {'code': 'TOKEN_REVOKED', 'message': 'Token revogado'}, room=sid)
 
        try:
            socket_io.disconnect(sid)
        except Exception:
            current_app.logger.exception(f"Erro ao desconectar sid {sid}")
