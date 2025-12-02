// src/components/chats/ChatList.jsx
import { useState, useEffect, useRef } from 'react';
import { useChatService } from '../../services/chatService';
import NewChatModal from './NewChatModal';

export default function ChatList({ onOpenChat }) {
  const { loadChats, createChat, registerChatListListeners } = useChatService();
  const [chats, setChats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      try {
        const list = await loadChats();
        if (!mountedRef.current) return;
        setChats(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar chats', err);
      }
    }

    load();
    return () => { mountedRef.current = false; };
  }, [loadChats]);

  // socket listeners em efeito separado
  useEffect(() => {
    function onJoined(payload) {
      // simples: recarrega a lista
      loadChats()
        .then(list => { if (mountedRef.current) setChats(Array.isArray(list) ? list : []); })
        .catch(err => console.error(err));
    }

    async function onInvitation(payload) {
      // se veio chat completo, insere
      if (payload?.chat) {
        upsertChat(payload.chat);
        return;
      }
        //se veio só chat_id, recarrega lista
      loadChats()
        .then(list => { if (mountedRef.current) setChats(Array.isArray(list) ? list : []); })
        .catch(err => console.error(err));
    }

    const unsubscribe = registerChatListListeners({
      onJoined,
      onInvitation,
    });

    return () => { unsubscribe && unsubscribe(); };
  }, [registerChatListListeners, loadChats]);

  function upsertChat(chatData) {
    if (!chatData || !chatData.id) return;
    setChats(prev => {
      if (prev.some(c => String(c.id) === String(chatData.id))) return prev;
      return [chatData, ...prev];
    });
  }

  // cria grupo público
  async function createPublic() {
    const name = window.prompt('Nome do grupo:');
    if (!name) return;

    try {
      const chatData = await createChat({ nome_grupo: name, members: [] });
      // assumindo createChat retorna o chat criado (padronize no service)
      if (chatData?.id) {
        upsertChat(chatData);
        onOpenChat(chatData.id);
        setShowModal(false);
      } else {
        // se service retornar wrapper {status, chat_data}, aceite também:
        if (chatData?.status === 'ok' && chatData.chat_data) {
          upsertChat(chatData.chat_data);
          onOpenChat(chatData.chat_data.id);
          setShowModal(false);
        } else {
          alert('Erro ao criar chat.');
        }
      }
    } catch (err) {
      console.error('Erro ao criar chat', err);
      alert('Erro ao criar chat. Tente novamente.');
    }
  }

  function handleChatCreated(chatData) {
    upsertChat(chatData);
    if (chatData?.id) onOpenChat(chatData.id);
    setShowModal(false);
  }

  return (
    <div className="chat-list" style={{ width: 320, borderRight: '1px solid #eee', padding: 12, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Chats</h3>
        <div>
          <button onClick={() => setShowModal(true)} style={{ cursor: 'pointer', padding: '4px 8px' }}>+ Novo</button>
          <button onClick={createPublic} style={{ marginLeft: 6, cursor: 'pointer', padding: '4px 8px' }}>Rápido</button>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flex: 1 }}>
        {chats.length === 0 && <li style={{ color: '#999', padding: 10 }}>Nenhum chat encontrado.</li>}
        {chats.map((c) => (
          <li key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenChat(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') onOpenChat(c.id); }}
              style={{ padding: '10px', borderBottom: '1px solid #f3f3f3', cursor: 'pointer', userSelect: 'none' }}>
            <div style={{ fontWeight: 'bold' }}>{c.nome_grupo || 'Privado'}</div>
            {c.last_message_preview && (
              <small style={{ color: '#666', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.last_message_preview}
              </small>
            )}
          </li>
        ))}
      </ul>

      {showModal && (
        <NewChatModal onClose={() => setShowModal(false)} onChatCreated={handleChatCreated} />
      )}
    </div>
  );
}
