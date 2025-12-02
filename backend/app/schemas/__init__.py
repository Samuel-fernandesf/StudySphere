from .user_schema import UserSchema
from .chat_schema import ChatSchema, MessageSchema

#Instanciação única para serialização de apenas UM usuário
user_schema = UserSchema()
#Instanciação única para serialização de LISTAS de usuários
users_schema = UserSchema(many=True)

chat_schema = ChatSchema()
message_schema = MessageSchema()