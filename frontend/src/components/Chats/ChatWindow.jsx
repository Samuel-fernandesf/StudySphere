// src/components/chats/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../api/api';
import './ChatList.css';
import './NewChatModal.css';


function AddMemberSearchModal({ onClose, chat, onMemberAdded }) {
  const { socket } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    // cancela fetch anterior
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/users/search', {
          params: { q: searchTerm },
          signal: controller.signal
        });
        const users = res?.data?.users ?? res?.data ?? [];
        // Opcional: filtrar membros que já estão no chat (se chat.usuarios_participantes existir)
        const filtered = users.filter(u =>
          !(chat?.usuarios_participantes ?? []).some(p => String(p.usuario_id) === String(u.id))
        );
        setSearchResults(filtered);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Erro na busca:', err);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
      controllerRef.current = null;
    };
  }, [searchTerm, chat]);

  async function handleAdd(user) {
    if (!socket) {
      alert('Socket não disponível');
      return;
    }
    setIsLoading(true);
    socket.emit('add_member', { chat_id: chat.id, new_member_id: String(user.id) }, (res) => {
      setIsLoading(false);
      if (res?.status === 'ok') {
        // notifica o pai que membro foi adicionado
        onMemberAdded?.(user);
        // opcional: remover usuário da lista
        setSearchResults(prev => prev.filter(u => String(u.id) !== String(user.id)));
        alert(res.message || 'Membro adicionado');
      } else {
        alert('Erro ao adicionar membro: ' + (res?.message || res?.code || 'Erro desconhecido'));
      }
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Adicionar Membro</h3>
          <button type="button" onClick={onClose}>Fechar</button>
        </div>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar usuários..."
          disabled={isLoading}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid #ddd', borderRadius: 6, padding: 8 }}>
          {searchResults.length === 0 && <div style={{ color: '#999' }}>Nenhum resultado</div>}
          {searchResults.map(user => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{user.username}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{user.nome_completo}</div>
              </div>
              <div>
                <button type="button" onClick={() => handleAdd(user)} disabled={isLoading} style={{ padding: '6px 10px' }}>
                  {isLoading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- ChatWindow ----------------
export default function ChatWindow({ chat, onClose }) {
  const { socket } = useSocket();

  // ---- hooks devem estar no topo (Rule of Hooks) ----
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // early return quando não há chat (ok porque hooks já foram declarados)
  if (!chat) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
        Selecione um chat
      </div>
    );
  }

  // Callback quando membro for adicionado via modal
  function handleMemberAddedSuccess(user) {
    // O backend idealmente já emite atualizações; aqui apenas feedback local
    console.log(`Membro ${user.username} adicionado`);
    setShowAddMemberModal(false);
    // opcional: recarregar chat/dados de membros
  }

  function normalizeMessage(raw) {
    return {
      id: raw.id ?? null,
      chat_id: raw.chat_id ?? raw.chat ?? null,
      user_id: raw.usuario_id ?? raw.user_id ?? raw.user?.id ?? null,
      user_name: raw.usuario_remetente?.nome ?? raw.user_name ?? raw.user?.name ?? null,
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
        // aceita res.data (array) ou { messages: [...] }
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
      // pede para entrar na sala
      socket.emit('join_chat', { chat_id: String(chat.id) });

      // handlers
      function onNewMessage(payload) {
        // garantir que a message seja do chat
        if (String(payload.chat_id) !== String(chat.id)) return;

        setMessages(prev => {
          // substitui mensagem otimista por payload que contém temp_id
          if (payload.temp_id) {
            const found = prev.some(m => m.temp_id && m.temp_id === payload.temp_id);
            const mapped = prev.map(m => (m.temp_id && m.temp_id === payload.temp_id ? normalizeMessage(payload) : m));
            return found ? mapped : [...mapped, normalizeMessage(payload)];
          }
          // evita duplicação por id
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

      // cleanup
      return () => {
        mounted = false;
        socket.off('new_message', onNewMessage);
        socket.off('send_error', onSendError);
        socket.emit('leave_chat', { chat_id: String(chat.id) });
      };
    }

    // cleanup if no socket
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
    const user_name = localStorage.getItem('user_name') ?? null;

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
      // ack success
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
        // mark failed using temp_id from res or optimistic temp_id
        const tid = res?.temp_id ?? temp_id;
        setMessages(prev => prev.map(m => (m.temp_id === tid ? { ...m, failed: true, sending: false } : m)));
      }
    });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong style={{ flex: 1 }}>{chat.nome_grupo || chat.other_user_name || 'Privado'}</strong>

        {chat.nome_grupo && (
          <button type="button" onClick={() => setShowAddMemberModal(true)} style={{ padding: '6px 10px' }}>
            + Membro
          </button>
        )}

        <button type="button" onClick={onClose} style={{ padding: '6px 10px' }}>Fechar</button>
      </div>

      {showAddMemberModal && (
        <AddMemberSearchModal
          onClose={() => setShowAddMemberModal(false)}
          chat={chat}
          onMemberAdded={handleMemberAddedSuccess}
        />
      )}

      <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {messages.map((m, i) => (
          <div key={m.id || m.temp_id || i} style={{ marginBottom: 8, opacity: m.failed ? 0.6 : 1 }}>
            <div><small style={{ color: '#666' }}>{m.user_name ?? m.user_id}</small></div>
            <div>{m.content}</div>
            {m.sending && <small style={{ color: '#666' }}>enviando...</small>}
            {m.failed && <small style={{ color: 'red' }}>falha ao enviar</small>}
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Digite uma mensagem"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="button" onClick={send} disabled={isSending} style={{ padding: '8px 12px' }}>
          {isSending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
