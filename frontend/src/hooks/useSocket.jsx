import { useEffect } from "react";
import { socket } from "../sockets/socket";

// Hook para conectar/desconectar socket por componente
export default function useSocket(onConnect) {
  useEffect(() => {
    socket.connect();
    if (onConnect) onConnect(socket);

    return () => {
      socket.disconnect();
    };
  }, []);
}
