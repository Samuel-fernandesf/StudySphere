import { io } from "socket.io-client";

// URL do servidor socket
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Exporta a instância do socket (sem conectar automaticamente)
export const socket = io(SOCKET_URL, {
    autoConnect: false, //não conecta automaticamente ao importar o módulo. Isso permite controlar a conexão
    withCredentials: true,
    transports: ['polling', 'websocket'],
});

//Serve para autenticar o usuário no momento do Handshake do Socketio
export function connectWithToken(accessToken) {
  //Serve para enviar dados extras como o token do JWT ao servidor
  socket.auth = { token: accessToken };

  //Inicia a conexão
  socket.connect();
}

export default socket
