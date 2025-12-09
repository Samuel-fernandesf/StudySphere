// src/components/Chats/NewChatModal.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import { useChatService } from "../../services/chatService";

import './NewChatModal.css';

export default function NewChatModal({ onClose, onChatCreated }) {
  const { createChat, createPrivateChat } = useChatService();

  const [activeTab, setActiveTab] = useState("private");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchControllerRef = useRef(null); 

  useEffect(() => {
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
      searchControllerRef.current = null;
    }

    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    searchControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search`, {
          params: { q: searchTerm },
          signal: controller.signal
        });
    
        const users = res?.data?.users ?? res?.data ?? [];
        setSearchResults(users.filter(u => !selectedUsers.some(s => String(s.id) === String(u.id))));
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
        } else {
          console.error("Erro na busca:", err);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
      searchControllerRef.current = null;
    };
  }, [searchTerm, selectedUsers]);

  function toggleUser(user) {
    if (activeTab === "private") {
      handleCreatePrivate(user.id);
      return;
    }

    const exists = selectedUsers.some(u => String(u.id) === String(user.id));
    if (exists) {
      setSelectedUsers(prev => prev.filter(u => String(u.id) !== String(user.id)));
      setSearchResults(prev => {
        if (prev.some(u => String(u.id) === String(user.id))) return prev;
        return [user, ...prev];
      });
    } else {
      setSelectedUsers(prev => [...prev, user]);
      setSearchResults(prev => prev.filter(u => String(u.id) !== String(user.id)));
    }
  }

  async function handleCreatePrivate(otherUserId) {
    setIsLoading(true);
    try {
      const chat = await createPrivateChat(otherUserId);
      onChatCreated(chat);
      onClose();
    } catch (err) {
      console.error("Erro ao criar chat privado:", err);
      alert("Erro ao criar chat privado");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateGroup() {
    if (!groupName || selectedUsers.length === 0) {
      alert("Forneça nome do grupo e pelo menos 1 membro.");
      return;
    }

    setIsLoading(true);
    try {
      const members = selectedUsers.map(u => u.id);
      const chat = await createChat({ nome_grupo: groupName, members });
      onChatCreated(chat);
      onClose();
    } catch (err) {
      console.error("Erro ao criar grupo:", err);
      alert("Erro ao criar grupo");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">

        <div className="modal-header">
          <h3 className="text-lg font-semibold">Nova Conversa</h3>
          <button type="button" onClick={onClose} aria-label="Fechar">X</button>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === "private" ? "active" : ""}`}
            onClick={() => { setActiveTab("private"); setSelectedUsers([]); }}
          >
            Privado
          </button>

          <button
            type="button"
            className={`tab ${activeTab === "group" ? "active" : ""}`}
            onClick={() => { setActiveTab("group"); setSelectedUsers([]); }}
          >
            Grupo
          </button>
        </div>

        {activeTab === "group" && (
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nome do grupo (obrigatório)"
            aria-label="Nome do grupo"
          />
        )}

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar usuários por nome ou username (min 2 caracteres)"
          aria-label="Buscar usuários"
        />

        <div className="mb-3">
          {activeTab === "group" && selectedUsers.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
              {selectedUsers.map((u) => (
                <div key={u.id} className="user-tag">
                  <span>{u.username}</span>
                  <button type="button" onClick={() => toggleUser(u)} aria-label={`Remover ${u.username}`}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="search-results-box" style={{ maxHeight: "12rem", overflow: "auto" }}>
            {searchResults.length === 0 && (
              <div className="text-sm text-gray-500">Nenhum resultado</div>
            )}

            {searchResults.map((user) => (
              <div key={user.id} className="search-result-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.nome_completo}</div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => toggleUser(user)}
                    className="btn-secondary"
                    disabled={isLoading}
                  >
                    {activeTab === "group"
                      ? selectedUsers.some((u) => u.id === user.id)
                        ? "Remover"
                        : "Adicionar"
                      : "Conversar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>

          {activeTab === "group" ? (
            <button type="button" onClick={handleCreateGroup} className="btn-primary" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Grupo"}
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled>Conversar</button>
          )}
        </div>

      </div>
    </div>
  );
}
