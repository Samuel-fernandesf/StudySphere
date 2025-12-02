from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from models import TipoChat

class ChatSchema(Schema):
    id = fields.Int(dump_only=True)
    nome_grupo = fields.Str(required=True, allow_none=True)
    tipo_chat = EnumField(TipoChat, dump_only=True)
    
class MessageSchema(Schema):
    id = fields.Int(dump_only=True)
    usuario_id = fields.Int(dump_only=True)
    chat_id = fields.Int(dump_only=True)
    conteudo_msg = fields.Str(required=True)
    data_envio = fields.DateTime(dump_only=True)
