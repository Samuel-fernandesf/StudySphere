import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/";

// Exporta a instância do socket (sem conectar automaticamente)
export const socket = io(SOCKET_URL, { autoConnect: false });
