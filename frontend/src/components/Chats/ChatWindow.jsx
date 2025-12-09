// src/components/chats/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../api/api';
import './ChatWindow.css';

export default function ChatWindow({ chat, onClose }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const listRef = useRef(null);

  // 1. Identificar o usuário atual para saber quais balões são "Meus" (direita) ou "Outros" (esquerda)
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    setCurrentUserId(userId);
  }, []);

  if (!chat) {
    return (
      <div className="chat-window-empty">
        <p>Selecione um chat para começar</p>
      </div>
    );
  }

  // Helper para padronizar mensagens vindas do Socket ou API
  function normalizeMessage(raw) {
    return {
      id: raw.id ?? null,
      temp_id: raw.temp_id ?? null,
      chat_id: raw.chat_id ?? raw.chat ?? null,
      user_id: raw.usuario_id ?? raw.user_id ?? raw.user?.id ?? null,
      user_name: raw.usuario_remetente?.nome_completo ?? raw.usuario_remetente?.username ?? raw.user_name ?? raw.user?.name ?? 'Usuário',
      content: raw.conteudo_msg ?? raw.content ?? '',
      created_at: raw.data_envio ?? raw.created_at ?? new Date().toISOString(),
      failed: raw.failed ?? false,
      sending: raw.sending ?? false
    };
  }

  // 2. Carregar mensagens e ouvir o Socket
  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      try {
        const res = await api.get(`/chats/${chat.id}/messages`);
        if (!mounted) return;
        const msgs = Array.isArray(res.data) ? res.data : (res.data?.messages ?? []);
        setMessages(msgs.map(normalizeMessage));
        scrollToBottom();
      } catch (err) {
        console.error('Erro ao carregar mensagens', err);
      }
    }

    loadMessages();

    if (socket) {
      socket.emit('join_chat', { chat_id: String(chat.id) });

      const onNewMessage = (payload) => {
        if (String(payload.chat_id) !== String(chat.id)) return;

        setMessages(prev => {
          // Substitui mensagem temporária (otimista) pela real se tiver temp_id
          if (payload.temp_id) {
            const found = prev.some(m => m.temp_id === payload.temp_id);
            const mapped = prev.map(m => (m.temp_id === payload.temp_id ? normalizeMessage(payload) : m));
            return found ? mapped : [...mapped, normalizeMessage(payload)];
          }
          // Evita duplicatas
          if (prev.some(m => m.id && m.id === payload.id)) return prev;
          return [...prev, normalizeMessage(payload)];
        });
        scrollToBottom();
      };

      const onSendError = (payload) => {
        if (!payload?.temp_id) return;
        setMessages(prev => prev.map(m => (m.temp_id === payload.temp_id ? { ...m, failed: true, sending: false } : m)));
      };

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
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  }

  // 3. Enviar Mensagem
  function send() {
    if (!text.trim() || !socket) return;
    
    const temp_id = 't_' + Date.now();
    const user_name = localStorage.getItem('user_name') ?? 'Você';

    const optimistic = {
      id: null,
      temp_id,
      content: text,
      user_id: currentUserId,
      user_name,
      created_at: new Date().toISOString(),
      sending: true,
      failed: false
    };

    setMessages(prev => [...prev, optimistic]);
    setText('');
    scrollToBottom();
    setIsSending(true);

    socket.emit('send_message', { 
      chat_id: String(chat.id), 
      content: optimistic.content, 
      temp_id 
    }, (res) => {
      setIsSending(false);
      if (res?.status !== 'ok') {
        setMessages(prev => prev.map(m => (m.temp_id === temp_id ? { ...m, failed: true, sending: false } : m)));
      }
    });
  }

  // 4. Helpers de Interface (UI)
  const getChatName = () => {
    if (chat.nome_grupo) return chat.nome_grupo;
    if (chat.usuarios_participantes?.length > 0) {
      return chat.usuarios_participantes
        .map(up => up.usuario_relacionado?.nome_completo || up.usuario_relacionado?.username || 'Usuário')
        .join(', ');
    }
    return 'Privado';
  };

  const getMembersCount = () => chat.usuarios_participantes?.length || 0;

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // 5. Renderização (Baseada na opção nova e moderna)
  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-window-info">
          <h3>{getChatName()}</h3>
          <p>{getMembersCount()} membros • Online</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
            {/* Botão simples de fechar para mobile/desktop */}
            <button onClick={onClose} className="chat-window-menu" style={{fontSize: '14px', width: 'auto', padding: '0 10px'}}>Fechar</button>
            <button className="chat-window-menu">⋮</button>
        </div>
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
            // Verifica se a mensagem é minha (baseado no ID)
            const isOwn = String(m.user_id) === String(currentUserId);
            // Mostra nome se for mensagem de outro e for a primeira da sequência
            const showName = !isOwn && (i === 0 || messages[i - 1].user_id !== m.user_id);

            return (
              <div key={m.id || m.temp_id || i} className={`message ${isOwn ? 'own' : 'other'}`}>
                {showName && (
                  <div className="message-sender">{m.user_name}</div>
                )}
                <div className="message-bubble">
                  <div className="message-content">{m.content}</div>
                  <div className="message-time">
                    {formatMessageTime(m.created_at)}
                    {m.sending && <span style={{ marginLeft: 4 }}>🕒</span>}
                    {m.failed && <span style={{ marginLeft: 4, color: '#ffcccc' }}>⚠️</span>}
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
          disabled={isSending}
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