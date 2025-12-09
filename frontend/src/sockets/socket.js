import { io } from 'socket.io-client';

// URL do servidor socket
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Exporta a instância do socket
export const socket = io(SOCKET_URL, {
    autoConnect: false, //não conecta automaticamente ao importar o módulo. Isso permite controlar a conexão
    withCredentials: true,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 1000, 
    reconnectionDelayMax: 5000, 
    reconnectionAttempts: 5,
    timeout: 20000,
});

//Serve para autenticar o usuário no momento do Handshake do Socketio
export function connectWithToken(accessToken) {
    if (!accessToken){
        console.error('Token de acesso não fornecido');
        return;
    }

  //Serve para enviar dados extras como o token do JWT ao servidor
  socket.auth = { token: accessToken };

  //Inicia a conexão
  socket.connect();
}

// DEBUG
socket.on('connect', () => {
    console.log('Socket conectado com ID:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('Socket desconectado. Razão:', reason);
});

socket.on('connect_error', (error) => {
    console.error('Erro de conexão do socket:', error.message);
});

socket.on('reconnect_attempt', (attempt) => {
    console.log(`Tentativa de reconexão #${attempt}`);
});

socket.on('reconnect', (attempt) => {
    console.log(`Reconectado após ${attempt} tentativa(s)`);
});

socket.on('reconnect_failed', () => {
    console.error('Falha ao reconectar após todas as tentativas');
});

export default socket
