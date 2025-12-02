import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../api/api';
import './ChatWindow.css';

export default function ChatWindow({ chat, onClose }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef();
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    setCurrentUserId(userId);
  }, []);

  if (!chat) {
    return null;
  }

  function normalizeMessage(raw) {
    return {
      id: raw.id ?? null,
      chat_id: raw.chat_id ?? raw.chat ?? null,
      user_id: raw.usuario_id ?? raw.user_id ?? raw.user?.id ?? null,
      user_name: raw.usuario_remetente?.nome_completo ?? raw.usuario_remetente?.username ?? raw.user_name ?? raw.user?.name ?? 'Usuário',
      content: raw.conteudo_msg ?? raw.content ?? '',
      created_at: raw.data_envio ?? raw.created_at ?? null,
      temp_id: raw.temp_id ?? null,
      failed: raw.failed ?? false,
      sending: raw.sending ?? false
    };
  }

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      try {
        const res = await api.get(`/chats/${chat.id}/messages`);
        if (!mounted) return;
        const msgs = Array.isArray(res.data) ? res.data : (res.data?.messages ?? []);
        const normalized = msgs.map(normalizeMessage);
        setMessages(normalized);
        scrollToBottom();
      } catch (err) {
        console.error('Erro ao carregar mensagens', err);
      }
    }

    loadMessages();

    if (socket) {
      socket.emit('join_chat', { chat_id: String(chat.id) });

      function onNewMessage(payload) {
        if (String(payload.chat_id) !== String(chat.id)) return;

        setMessages(prev => {
          if (payload.temp_id) {
            const found = prev.some(m => m.temp_id && m.temp_id === payload.temp_id);
            const mapped = prev.map(m => (m.temp_id && m.temp_id === payload.temp_id ? normalizeMessage(payload) : m));
            return found ? mapped : [...mapped, normalizeMessage(payload)];
          }
          if (prev.some(m => m.id && m.id === payload.id)) return prev;
          return [...prev, normalizeMessage(payload)];
        });
        scrollToBottom();
      }

      function onSendError(payload) {
        if (!payload?.temp_id) return;
        setMessages(prev => prev.map(m => (m.temp_id === payload.temp_id ? { ...m, failed: true, sending: false } : m)));
      }

      socket.on('new_message', onNewMessage);
      socket.on('send_error', onSendError);

      return () => {
        mounted = false;
        socket.off('new_message', onNewMessage);
        socket.off('send_error', onSendError);
        socket.emit('leave_chat', { chat_id: String(chat.id) });
      };
    }

    return () => { mounted = false; };
  }, [chat.id, socket]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }

  function send() {
    if (!text.trim() || !socket) return;
    const temp_id = 't_' + Date.now();

    const user_id = localStorage.getItem('user_id') ?? null;
    const user_name = localStorage.getItem('user_name') ?? 'Você';

    const optimistic = {
      id: null,
      temp_id,
      content: text,
      user_id,
      user_name,
      created_at: new Date().toISOString(),
      sending: true,
      failed: false
    };

    setMessages(prev => [...prev, optimistic]);
    setText('');
    scrollToBottom();

    setIsSending(true);
    socket.emit('send_message', { chat_id: String(chat.id), content: optimistic.content, temp_id }, (res) => {
      setIsSending(false);
      if (res?.status === 'ok' && res.message) {
        const payload = res.message;
        setMessages(prev => {
          let replaced = false;
          const newList = prev.map(m => {
            if (m.temp_id && payload.temp_id && m.temp_id === payload.temp_id) {
              replaced = true;
              return normalizeMessage(payload);
            }
            return m;
          });
          if (!replaced) {
            newList.push(normalizeMessage(payload));
          }
          return newList;
        });
      } else {
        const tid = res?.temp_id ?? temp_id;
        setMessages(prev => prev.map(m => (m.temp_id === tid ? { ...m, failed: true, sending: false } : m)));
      }
    });
  }

  const getChatName = () => {
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

  const getMembersCount = () => {
    return chat.usuarios_participantes?.length || 0;
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-window-info">
          <h3>{getChatName()}</h3>
          <p>{getMembersCount()} membros • Online</p>
        </div>
        <button className="chat-window-menu">⋮</button>
      </div>

      <div ref={listRef} className="chat-window-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>Nenhuma mensagem ainda</p>
            <small>Seja o primeiro a enviar uma mensagem!</small>
          </div>
        ) : (
          messages.map((m, i) => {
            const isOwn = String(m.user_id) === String(currentUserId);
            const showName = i === 0 || messages[i - 1].user_id !== m.user_id;

            return (
              <div key={m.id || m.temp_id || i} className={`message ${isOwn ? 'own' : 'other'}`}>
                {!isOwn && showName && (
                  <div className="message-sender">{m.user_name}</div>
                )}
                <div className="message-bubble">
                  <div className="message-content">{m.content}</div>
                  <div className="message-time">
                    {formatMessageTime(m.created_at)}
                    {m.sending && ' • enviando...'}
                    {m.failed && ' • falha'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-window-input">
        <button className="input-attach">📎</button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Digite sua mensagem..."
          className="input-field"
        />
        <button 
          onClick={send} 
          disabled={isSending || !text.trim()} 
          className="input-send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
