import ChatList from "../../components/Chats/ChatList";
import { SocketProvider } from '../../contexts/SocketContext';
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";

export default function Chats() {
    const navigate = useNavigate();

    const handleOpenChat = (chatId) => {
        navigate(`/chats/${chatId}`);
    };

    return (
        <div className="chats-page" style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <ChatList onOpenChat={handleOpenChat} />
        </div>
    );
}
