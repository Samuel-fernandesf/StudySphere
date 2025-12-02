import { useState, useRef, useEffect, createContext, useContext } from "react";
import socket, {connectWithToken} from "../sockets/socket";
import api from "../api/api";
import { logout } from "../services/authService";

//Cria o objeto contexto
const SocketContext = createContext()

export function SocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const isRefreshing = useRef(false);

    useEffect(() => {

        const token = localStorage.getItem("access_token");
        if (!token) {
            return;
        }

        //Remove listeners antes de registrar novamente
        socket.off("connect");
        socket.off("disconnect");
        socket.off("auth_error");
        socket.off("connect_error")

        //evento quando conectar
        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Socket conectado:", socket.id);
        });

        //evento quando desconectar
        //Reason str do Socketio que explica o motivo da desconexão
        socket.on("disconnect", (reason) => {
            setIsConnected(false);
            console.log("Socket desconectado", reason);
        });

         //servidor rejeita a conexão
        socket.on("connect_error", (err) => {
            console.error("Erro ao conectar socket:", err.message || err);
        });

        //erro de autenticação
        socket.on("auth_error", async (payload) => {
            console.warn("Auth error via socket:", payload);

            if (payload.code === 'TOKEN_EXPIRED'){

                if (isRefreshing.current) return;
                isRefreshing.current = true;

                try{
                    const res = await api.post('/auth/refresh')
                    if (!res || !res.data?.access_token) throw new Error("No token");
                    
                    const newToken = res.data.access_token;
                    localStorage.setItem("access_token", newToken);

                    //Reconecta com o novo access token
                    socket.disconnect();
                    socket.auth = { token: newToken };
                    socket.connect();

                }catch (err) {
                    console.warn("Refresh falhou, sessão encerrada");
                    logout();

                }finally{
                    isRefreshing.current = false;
                }
            }else{
                logout();
            }
        });

        //conectar
        if (!socket.connected) connectWithToken(token)

        //remove listeners ao desmontar o componente
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("auth_error");
            socket.off("connect_error");
        };
    }, []);

    //Helper para criar chat via socket
    function createChat(payload) {
        return new Promise((resolve) => {
            socket.emit("create_chat", payload, resolve);
        })
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, createChat }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}