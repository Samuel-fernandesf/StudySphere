import React from "react";
import "./ChatList.css";

export default function ChatList({ chats, selectedChatId, onOpenChat, loading }) {
  if (loading) {
    return (
      <div className="chat-list-loading">
        <div className="spinner"></div>
        <p>Carregando grupos...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="chat-list-empty">
        <p>Nenhum grupo encontrado</p>
        <small>Crie um novo grupo para começar</small>
      </div>
    );
  }

  const getGroupIcon = (materia) => {
    const icons = {
      'Matemática': '📐',
      'Física': '⚡',
      'Química': '🧪',
      'História': '📚',
      'Biologia': '🧬',
      'Geografia': '🌍',
      'Literatura': '📖',
      'Inglês': '🇬🇧',
      'Português': '📝'
    };
    return icons[materia] || '📁';
  };

  const getMembersCount = (chat) => {
    return chat.usuarios_participantes?.length || 0;
  };

  const getOnlineCount = (chat) => {
    // Simulação - em produção viria do backend
    const total = getMembersCount(chat);
    return Math.floor(total * 0.6); // 60% online
  };

  const getChatName = (chat) => {
    if (chat.nome_grupo) {
      return chat.nome_grupo;
    }
    if (chat.usuarios_participantes && chat.usuarios_participantes.length > 0) {
      return chat.usuarios_participantes
        .map(up => up.usuario_relacionado?.nome_completo || up.usuario_relacionado?.username || 'Usuário')
        .join(', ');
    }
    return 'Privado';
  };

  const getLastMessage = (chat) => {
    if (chat.last_message_preview) {
      return chat.last_message_preview;
    }
    return 'Nenhuma mensagem ainda';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="chat-list">
      {chats.map((chat) => {
        const isSelected = chat.id === selectedChatId;
        const membersCount = getMembersCount(chat);
        const onlineCount = getOnlineCount(chat);
        const hasUnread = chat.unread_count > 0;

        return (
          <div
            key={chat.id}
            className={`chat-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
            onClick={() => onOpenChat(chat.id)}
          >
            <div className="chat-icon">
              {getGroupIcon(chat.materia || chat.nome_grupo)}
            </div>

            <div className="chat-info">
              <div className="chat-header-row">
                <h4 className="chat-name">{getChatName(chat)}</h4>
                {hasUnread && (
                  <span className="unread-badge">{chat.unread_count}</span>
                )}
              </div>

              <div className="chat-members">
                <span className="members-icon">👥</span>
                <span className="members-text">
                  {membersCount} membros
                  {onlineCount > 0 && (
                    <>
                      {' • '}
                      <span className="online-indicator">●</span>
                      {' '}{onlineCount} Online
                    </>
                  )}
                </span>
              </div>

              <div className="chat-last-message">
                {getLastMessage(chat)}
              </div>

              {chat.last_message_time && (
                <div className="chat-time">
                  {formatTime(chat.last_message_time)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
