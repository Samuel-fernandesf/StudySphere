from .user_repo import UserRepository
from .token_repo import TokenRepository
from . import eventRepository
from . import subjectRepository
from . import taskRepository
from . import fileRepository
from . import folderRepository
from . import progressRepository
from .chat_repo import ChatRepository, MessageRepository, ChatUsuarioRepository
from .quiz_repo import (
    QuizRepository, QuestaoRepository, AlternativaRepository,
    TentativaQuizRepository, RespostaUsuarioRepository, TagQuizRepository
)
from .preference_repo import PreferenceRepository

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
preferenceRepository = PreferenceRepository()
