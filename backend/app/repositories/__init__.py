from .user_repo import UserRepository
from .token_repo import TokenRepository
from . import eventRepository
from . import subjectRepository
from . import taskRepository
from . import fileRepository
from . import progressRepository
from .chat_repo import ChatRepository, MessageRepository, ChatUsuarioRepository
from .quiz_repo import (
    QuizRepository, QuestaoRepository, AlternativaRepository,
    TentativaQuizRepository, RespostaUsuarioRepository, TagQuizRepository
)

userRepository = UserRepository()
tokenRepository = TokenRepository()
chatRepository = ChatRepository()
messageRepository = MessageRepository()
chatUsuarioRepository = ChatUsuarioRepository()
quizRepository = QuizRepository()
questaoRepository = QuestaoRepository()
alternativaRepository = AlternativaRepository()
tentativaRepository = TentativaQuizRepository()
respostaRepository = RespostaUsuarioRepository()
tagRepository = TagQuizRepository()
