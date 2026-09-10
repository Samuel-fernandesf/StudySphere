import React, { useState, useEffect } from "react";
import ChatList from "../../components/Chats/ChatList";
import ChatWindow from "../../components/Chats/ChatWindow";
import NewChatModal from "../../components/Chats/NewChatModal";
import { SocketProvider } from "../../contexts/SocketContext";
import api from "../../api/api";
import "./Chats.css";

export default function Chats({ isEmbedded = false }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setLoading(true);
      const res = await api.get("/chats");
      setChats(res.data || []);
      if (res.data && res.data.length > 0 && !selectedChat) {
        setSelectedChat(res.data[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar chats:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChat(chatId) {
    const chat = chats.find((c) => c.id === chatId);
    setSelectedChat(chat);
  }

  function handleCloseChat() {
    setSelectedChat(null);
  }

  function handleNewChat() {
    setShowNewChatModal(true);
  }

  function handleChatCreated(newChat) {
    setChats((prev) => [newChat, ...prev]);
    setShowNewChatModal(false);
    setSelectedChat(newChat);
  }

  const filteredChats = searchTerm
    ? chats.filter((c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chats;

  return (
    <SocketProvider>
      <div className={`chats-page ${isEmbedded ? "embedded" : ""}`}>
        {!isEmbedded ? (
          <div className="chats-header">
            <div>
              <h1 className="chats-title">Chats Colaborativos</h1>
              <p className="chats-subtitle">Conecte-se com seus colegas de estudo</p>
            </div>
            <button className="btn-new-chat" onClick={handleNewChat}>
              + Novo Grupo
            </button>
          </div>
        ) : (
          <div className="chats-embedded-header">
            <div className="chats-embedded-info">
              <span className="chats-embedded-title">Conversas e Grupos de Estudo</span>
            </div>
            <button className="btn-new-chat embedded-btn" onClick={handleNewChat}>
              + Novo Grupo
            </button>
          </div>
        )}

        <div className="chats-main">
          <div className="chats-sidebar">
            <div className="chats-sidebar-header">
              <h3>Grupos de Estudo</h3>
              <span className="chat-count">{chats.length}</span>
            </div>
            <div className="chats-search">
              <input
                type="text"
                placeholder="Buscar grupos..."
                className="search-input"
              />
            </div>
            <ChatList
              chats={chats}
              selectedChatId={selectedChat?.id}
              onOpenChat={handleOpenChat}
              loading={loading}
            />
          </div>

          <div className="chats-window">
            {selectedChat ? (
              <ChatWindow chat={selectedChat} onClose={handleCloseChat} />
            ) : (
              <div className="no-chat-selected">
                <div className="no-chat-icon">💬</div>
                <h3>Selecione um chat</h3>
                <p>Escolha uma conversa para começar a interagir</p>
              </div>
            )}
          </div>
        </div>

        {showNewChatModal && (
          <NewChatModal
            onClose={() => setShowNewChatModal(false)}
            onChatCreated={handleChatCreated}
          />
        )}
      </div>
    </SocketProvider>
  );
}
