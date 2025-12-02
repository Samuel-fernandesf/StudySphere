from models import Usuario, Chat, ChatUsuario, Mensagem, TipoMensagem, TipoChat
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from utils.db import db
from typing import List, Optional

class ChatRepository:

    # Métodos de Busca
    def get_all_chats(self) -> List[Chat]:
        return Chat.query.all()

    def get_by_id(self, chat_id: int) -> Optional[Chat]:
        return Chat.query.get(chat_id)

    def get_by_name_group(self, nome_grupo: str) -> Optional[Chat]:
        return Chat.query.filter_by(nome_grupo=nome_grupo).first()

    def get_chats_of_user(self, usuario_id: int) -> List[Chat]:
        return db.session.query(Chat).join(Chat.usuarios_participantes).filter_by(usuario_id=usuario_id).all()

    # Métodos de Cadastro e Edição
    def create_chat(self, tipo: TipoChat, nome_grupo: Optional[str] = None) -> Chat:
        try:
            new_chat = Chat(tipo=tipo, nome_grupo=nome_grupo)
            db.session.add(new_chat)
            db.session.commit()
            return new_chat
        except IntegrityError as e:
            db.session.rollback()
            raise ValueError("Erro de integridade ao criar o chat.")
        except Exception as e:
            db.session.rollback()
            raise e
        
    def update_chat_name(self, chat: Chat, novo_nome: str) -> Chat:
            chat.nome_grupo = novo_nome
            try:
                db.session.commit()
                return chat
            except Exception as e:
                db.session.rollback()
                raise e
                
    def delete_chat(self, chat: Chat):
        try:
            db.session.delete(chat)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
        
class MessageRepository:

    # Métodos de Busca
    def get_by_id(self, mensagem_id: int) -> Optional[Mensagem]:
        return Mensagem.query.get(mensagem_id)

    def get_messages_of_chat(self, chat_id: int, limit: int = 50, offset: int = 0) -> List[Mensagem]:
        return Mensagem.query.filter_by(chat_id=chat_id).order_by(Mensagem.data_envio.desc()).limit(limit).offset(offset).all()

    # Métodos de Cadastro
    def create_message(self, usuario_id: int, chat_id: int, conteudo_msg: str, tipo_mensagem: TipoMensagem = TipoMensagem.mensagem) -> Mensagem:
        try:
            new_message = Mensagem(
                usuario_id=usuario_id,
                chat_id=chat_id,
                conteudo_msg=conteudo_msg,
                tipo_mensagem=tipo_mensagem
            )
            db.session.add(new_message)
            db.session.commit()
            return new_message
        except Exception as e:
            db.session.rollback()
            raise e

    # Métodos de Exclusão
    def delete_message(self, message: Mensagem):
        try:
            db.session.delete(message)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
        
class ChatUsuarioRepository:

    # Métodos de Busca
    def get_by_ids(self, usuario_id: int, chat_id: int) -> Optional[ChatUsuario]:
        return ChatUsuario.query.filter_by(usuario_id=usuario_id, chat_id=chat_id).first()

    def get_members_of_chat(self, chat_id: int) -> List[ChatUsuario]:
        return ChatUsuario.query.filter_by(chat_id=chat_id).all()
        
    def is_admin(self, usuario_id: int, chat_id: int) -> bool:
        assoc = self.get_by_ids(usuario_id, chat_id)
        return assoc.is_admin if assoc else False 

    # Métodos de Cadastro e Exclusão
    def add_user_to_chat(self, usuario_id: int, chat_id: int, is_admin: bool = False) -> ChatUsuario:
        if self.get_by_ids(usuario_id, chat_id):
            raise ValueError("Usuário já é participante deste chat.")
            
        try:
            new_assoc = ChatUsuario(usuario_id=usuario_id, chat_id=chat_id, is_admin=is_admin)
            db.session.add(new_assoc)
            db.session.commit()
            return new_assoc
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Erro de integridade: Usuário ou Chat não existe.") 
        except Exception as e:
            db.session.rollback()
            raise e
            
    def remove_user_from_chat(self, usuario_id: int, chat_id: int):
        assoc = self.get_by_ids(usuario_id, chat_id)
        if assoc:
            try:
                db.session.delete(assoc)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                raise e
        else:
            raise ValueError("Associação Chat-Usuário não encontrada.")
            
    def set_admin_status(self, usuario_id: int, chat_id: int, is_admin: bool) -> ChatUsuario:
        assoc = self.get_by_ids(usuario_id, chat_id)
        if assoc:
            assoc.is_admin = is_admin
            try:
                db.session.commit()
                return assoc
            except Exception as e:
                db.session.rollback()
                raise e
        else:
            raise ValueError("Associação Chat-Usuário não encontrada.")