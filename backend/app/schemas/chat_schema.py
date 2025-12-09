from marshmallow import Schema, fields, pre_dump
from marshmallow_enum import EnumField
from models import TipoChat

class UserBasicSchema(Schema):
    """Schema simplificado para informações básicas do usuário"""
    id = fields.Int(dump_only=True)
    username = fields.Str(dump_only=True)
    nome_completo = fields.Str(dump_only=True)

class ChatUsuarioSchema(Schema):
    """Schema para a relação Chat-Usuário"""
    usuario_id = fields.Int(dump_only=True)
    is_admin = fields.Bool(dump_only=True)
    usuario_relacionado = fields.Nested(UserBasicSchema, dump_only=True)

class ChatSchema(Schema):
    id = fields.Int(dump_only=True)
    nome_grupo = fields.Str(required=True, allow_none=True)
    tipo = EnumField(TipoChat, dump_only=True, data_key='tipo_chat')
    usuarios_participantes = fields.List(fields.Nested(ChatUsuarioSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    
    @pre_dump
    def process_chat(self, data, **kwargs):
        """Processa o chat antes de serializar para incluir nome do outro usuário em chats privados"""
        if hasattr(data, 'tipo') and data.tipo == TipoChat.privado:
            # Para chats privados, podemos adicionar o nome do outro usuário
            if hasattr(data, 'usuarios_participantes') and len(data.usuarios_participantes) == 2:
                # Pega o nome do outro usuário (não o atual)
                usuarios = data.usuarios_participantes
                if len(usuarios) >= 2:
                    # Se não tiver nome_grupo, usa o nome do outro usuário
                    if not data.nome_grupo and hasattr(usuarios[0], 'usuario_relacionado'):
                        # Isso será tratado no frontend
                        pass
        return data
    
class MessageSchema(Schema):
    id = fields.Int(dump_only=True)
    usuario_id = fields.Int(dump_only=True)
    chat_id = fields.Int(dump_only=True)
    conteudo_msg = fields.Str(required=True)
    data_envio = fields.DateTime(dump_only=True)
    usuario_remetente = fields.Nested(UserBasicSchema, dump_only=True)
