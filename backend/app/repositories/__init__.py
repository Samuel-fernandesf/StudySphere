from .user_repo import UserRepository
from .token_repo import TokenRepository
from . import eventRepository
from . import subjectRepository
from . import taskRepository
from . import fileRepository
from . import progressRepository

userRepository = UserRepository()
tokenRepository = TokenRepository()
from .chat_repo import ChatRepository, MessageRepository, ChatUsuarioRepository

userRepository = UserRepository()
tokenRepository = TokenRepository()
chatRepository = ChatRepository()
messageRepository = MessageRepository()
chatUsuarioRepository = ChatUsuarioRepository()
