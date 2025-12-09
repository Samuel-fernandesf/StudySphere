from .user_schema import UserSchema
from .chat_schema import ChatSchema, MessageSchema
from .quiz_schema import (
    QuizSchema, QuizDetalhadoSchema, TentativaQuizSchema,
    QuestaoSchema, AlternativaSchema
)

#Instanciação única para serialização de apenas UM usuário
user_schema = UserSchema()
#Instanciação única para serialização de LISTAS de usuários
users_schema = UserSchema(many=True)

chat_schema = ChatSchema()
message_schema = MessageSchema()

quiz_schema = QuizSchema()
quizzes_schema = QuizSchema(many=True)
quiz_detalhado_schema = QuizDetalhadoSchema()
tentativa_schema = TentativaQuizSchema()
tentativas_schema = TentativaQuizSchema(many=True)
