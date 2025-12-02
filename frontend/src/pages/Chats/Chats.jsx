import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import ChatList from "../../components/Chats/ChatList";
import ChatWindow from "../../components/Chats/ChatWindow";
import NewChatModal from "../../components/Chats/NewChatModal";
import { SocketProvider } from "../../contexts/SocketContext";
import api from "../../api/api";
import "./Chats.css";

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setLoading(true);
      const res = await api.get("/chats");
      setChats(res.data || []);
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

  return (
    <SocketProvider>
      <div className="chats-container">
        <Sidebar />
        
        <div className="main-content">
          <div className="chats-header">
            <div className="chats-header-left">
              <h1>Chats Colaborativos</h1>
              <p>Conecte-se com seus colegas de estudo</p>
            </div>
            <button className="btn-new-chat" onClick={handleNewChat}>
              + Novo Grupo
            </button>
          </div>

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
