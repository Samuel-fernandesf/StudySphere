import { useState, useRef, useEffect, createContext, useContext } from "react";
import socket, { connectWithToken } from "../sockets/socket";
import api from "../api/api";
import { logout } from "../services/authService";

// Cria o objeto contexto
const SocketContext = createContext();

export function SocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const isRefreshing = useRef(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Evita dupla conexão no React StrictMode
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const token = localStorage.getItem("access_token");
        if (!token) {
            setIsConnected(false);
            return;
        }

        // Remove listeners anteriores para evitar duplicação
        socket.removeAllListeners();

        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Socket conectado:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            setIsConnected(false);
            console.log("Socket desconectado:", reason);
            
            // Se o servidor derrubou a conexão, tenta reconectar manualmente
            if (reason === "io server disconnect") {
                const currentToken = localStorage.getItem("access_token");
                if (currentToken) connectWithToken(currentToken);
            }
        });

        socket.on("connect_error", (err) => {
            console.error("Erro ao conectar socket:", err.message || err);
            setIsConnected(false);
        });

        socket.on("auth_error", async (payload) => {
            console.warn("Auth error via socket:", payload);

            if (payload?.code === 'TOKEN_EXPIRED') {
                if (isRefreshing.current) return;
                isRefreshing.current = true;

                try {
                    const res = await api.post('/auth/refresh');
                    if (!res || !res.data?.access_token) throw new Error("No token");
                    
                    const newToken = res.data.access_token;
                    localStorage.setItem("access_token", newToken);

                    // Reconecta com o novo access token
                    socket.disconnect();
                    socket.auth = { token: newToken };
                    socket.connect();
                } catch (err) {
                    console.warn("Refresh falhou, sessão encerrada");
                    logout();
                } finally {
                    isRefreshing.current = false;
                }
            } else {
                logout();
            }
        });

        // Tenta conectar se necessário
        if (!socket.connected) {
            connectWithToken(token);
        }

        return () => {
            socket.removeAllListeners();
        };
    }, []);

    function createChat(payload) {
        return new Promise((resolve, reject) => {
            if (!socket.connected) {
                return reject(new Error("Socket não conectado"));
            }

            const timeout = setTimeout(() => {
                reject(new Error("O servidor demorou muito para responder."));
            }, 10000);

            socket.emit("create_chat", payload, (response) => {
                clearTimeout(timeout);
                if (response?.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, createChat }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket deve ser usado dentro de um SocketProvider");
    }
    return context;
}