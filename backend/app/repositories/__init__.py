from .user_repo import UserRepository
from .token_repo import TokenRepository
from .chat_repo import ChatRepository, MessageRepository, ChatUsuarioRepository

userRepository = UserRepository()
tokenRepository = TokenRepository()
chatRepository = ChatRepository()
messageRepository = MessageRepository()
chatUsuarioRepository = ChatUsuarioRepository()