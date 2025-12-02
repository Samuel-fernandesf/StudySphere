import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../../components/Chats/ChatWindow';
import api from '../../api/api';
import Sidebar from '../../components/layout/Sidebar';

export default function ChatRoom() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/chats/${id}`);
        if (!mounted) return;
        setChat(res.data);
      } catch (err) {
        console.error('Erro ao carregar chat', err);
        setChat(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ChatWindow chat={chat} onClose={() => navigate('/chats')} />
      )}
    </div>
  );
}
