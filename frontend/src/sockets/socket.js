import { io } from "socket.io-client";

// URL do servidor socket
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5000';

console.log("🔧 Configurando Socket.IO com URL:", SOCKET_URL);

// Exporta a instância do socket (sem conectar automaticamente)
export const socket = io(SOCKET_URL, {
    autoConnect: false, // Não conecta automaticamente ao importar o módulo
    withCredentials: true, // Permite envio de cookies
    transports: ['websocket', 'polling'], // Prioriza WebSocket
    reconnection: true, // Habilita reconexão automática
    reconnectionDelay: 1000, // Delay inicial de reconexão (1s)
    reconnectionDelayMax: 5000, // Delay máximo de reconexão (5s)
    reconnectionAttempts: 5, // Número máximo de tentativas de reconexão
    timeout: 20000, // Timeout de conexão (20s)
});

// Serve para autenticar o usuário no momento do Handshake do Socket.IO
export function connectWithToken(accessToken) {
    if (!accessToken) {
        console.error("❌ Token de acesso não fornecido");
        return;
    }

    // Serve para enviar dados extras como o token do JWT ao servidor
    socket.auth = { token: accessToken };

    console.log("🔌 Conectando socket com autenticação...");

    // Inicia a conexão
    socket.connect();
}

// Log de eventos importantes para debug
socket.on("connect", () => {
    console.log("✅ Socket conectado com ID:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("❌ Socket desconectado. Razão:", reason);
});

socket.on("connect_error", (error) => {
    console.error("❌ Erro de conexão do socket:", error.message);
});

socket.on("reconnect_attempt", (attempt) => {
    console.log(`🔄 Tentativa de reconexão #${attempt}`);
});

socket.on("reconnect", (attempt) => {
    console.log(`✅ Reconectado após ${attempt} tentativa(s)`);
});

socket.on("reconnect_failed", () => {
    console.error("❌ Falha ao reconectar após todas as tentativas");
});

export default socket;
