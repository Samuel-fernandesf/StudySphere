// src/services/chatService.js
import { useCallback } from "react";
import api from "../api/api";
import { useSocket } from "../contexts/SocketContext";

export function useChatService() {
  const { socket } = useSocket();

  // Carrega todos os chats do usuário
  const loadChats = useCallback(async () => {
    const res = await api.get("/chats");
    return res.data || [];
  }, []);

  // Cria chat (REST) — padroniza retorno: sempre o objeto do chat
  const createChat = useCallback(async (payload) => {
    const res = await api.post("/chats", payload);
    return res.data?.chat_data || res.data;
  }, []);

  // Cria chat privado (other_user_id)
  const createPrivateChat = useCallback(async (otherUserId) => {
    const res = await api.post("/chats", { other_user_id: otherUserId });
    return res.data?.chat_data || res.data;
  }, []);

  // Registra listeners para a lista de chats.
  const registerChatListListeners = useCallback(({ onJoined, onInvitation }) => {
    if (typeof onJoined === "function" && socket) socket.on("joined_chats", onJoined);
    if (typeof onInvitation === "function" && socket) {
      socket.on("invitation_public", onInvitation);
      socket.on("invitation_private", onInvitation);
    }

    return () => {
      if (typeof onJoined === "function" && socket) socket.off("joined_chats", onJoined);
      if (typeof onInvitation === "function" && socket) {
        socket.off("invitation_public", onInvitation);
        socket.off("invitation_private", onInvitation);
      }
    };
  }, [socket]);

  return { loadChats, createChat, createPrivateChat, registerChatListListeners };
}
