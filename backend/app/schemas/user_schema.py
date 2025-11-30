from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    username = fields.Str(required=True)
    nome_completo = fields.Str(required=True)

    curso = fields.Str(required=True, allow_none=None)
    biografia = fields.Str(required=True, allow_none=None)
    nascimento = fields.Date(required=True, allow_none=None)
