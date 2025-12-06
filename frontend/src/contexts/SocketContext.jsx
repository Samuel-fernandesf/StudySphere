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
        // Evita múltiplas inicializações
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const token = localStorage.getItem("access_token");
        
        // Se não houver token, apenas marca como não conectado
        if (!token) {
            console.log("Socket: Sem token de autenticação");
            setIsConnected(false);
            return;
        }

        // Remove todos os listeners anteriores para evitar duplicação
        socket.removeAllListeners();

        // Evento quando conectar
        socket.on("connect", () => {
            setIsConnected(true);
            console.log("✅ Socket conectado:", socket.id);
        });

        // Evento quando desconectar
        socket.on("disconnect", (reason) => {
            setIsConnected(false);
            console.log("❌ Socket desconectado:", reason);
            
            // Tenta reconectar automaticamente em alguns casos
            if (reason === "io server disconnect") {
                // O servidor forçou a desconexão, tentar reconectar
                console.log("🔄 Tentando reconectar...");
                setTimeout(() => {
                    const currentToken = localStorage.getItem("access_token");
                    if (currentToken && !socket.connected) {
                        connectWithToken(currentToken);
                    }
                }, 1000);
            }
        });

        // Erro de conexão do servidor
        socket.on("connect_error", (err) => {
            console.error("❌ Erro ao conectar socket:", err.message || err);
            setIsConnected(false);
        });

        // Erro de autenticação
        socket.on("auth_error", async (payload) => {
            console.warn("⚠️ Erro de autenticação via socket:", payload);

            if (payload?.code === "TOKEN_EXPIRED") {
                // Evita múltiplas tentativas simultâneas de refresh
                if (isRefreshing.current) {
                    console.log("⏳ Refresh já em andamento...");
                    return;
                }
                
                isRefreshing.current = true;
                console.log("🔄 Tentando renovar token...");

                try {
                    const res = await api.post("/auth/refresh");
                    if (!res || !res.data?.access_token) {
                        throw new Error("Token não recebido no refresh");
                    }
                    
                    const newToken = res.data.access_token;
                    localStorage.setItem("access_token", newToken);
                    console.log("✅ Token renovado com sucesso");

                    // Reconecta com o novo access token
                    socket.disconnect();
                    socket.auth = { token: newToken };
                    socket.connect();
                } catch (err) {
                    console.error("❌ Falha ao renovar token:", err);
                    console.warn("🚪 Encerrando sessão...");
                    logout();
                } finally {
                    isRefreshing.current = false;
                }
            } else {
                // Outro tipo de erro de autenticação
                console.error("❌ Erro de autenticação não recuperável");
                logout();
            }
        });

        // Conectar se ainda não estiver conectado
        if (!socket.connected) {
            console.log("🔌 Iniciando conexão do socket...");
            connectWithToken(token);
        }

        // Cleanup ao desmontar
        return () => {
            console.log("🧹 Limpando listeners do socket...");
            socket.off("connect");
            socket.off("disconnect");
            socket.off("auth_error");
            socket.off("connect_error");
            hasInitialized.current = false;
        };
    }, []);

    // Helper para criar chat via socket
    function createChat(payload) {
        return new Promise((resolve, reject) => {
            if (!socket.connected) {
                console.error("❌ Socket não conectado");
                reject(new Error("Socket não conectado"));
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error("Timeout ao criar chat"));
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
