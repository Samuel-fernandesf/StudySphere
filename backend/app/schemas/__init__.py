from .user_schema import UserSchema

#Instanciação única para serialização de apenas UM usuário
user_schema = UserSchema()

#Instanciação única para serialização de LISTAS de usuários
users_schema = UserSchema(many=True)