import React from "react";
import { MessageSquare, Plus, Trash2, Clock } from "lucide-react";
import "./ConversationSidebar.css";

const ConversationSidebar = ({
    conversations = [],
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    loading = false
}) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Ontem";
        } else if (diffDays < 7) {
            return date.toLocaleDateString("pt-BR", { weekday: "short" });
        } else {
            return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        }
    };

    return (
        <div className="conversation-sidebar">
            <div className="sidebar-header">
                <h3>
                    <MessageSquare size={18} />
                    Conversas
                </h3>
                <button
                    className="btn-new-conversation"
                    onClick={onNewConversation}
                    title="Nova conversa"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="conversations-list">
                {loading ? (
                    <div className="sidebar-loading">
                        <div className="loading-spinner"></div>
                        <span>Carregando...</span>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="empty-conversations">
                        <MessageSquare size={32} strokeWidth={1.5} />
                        <p>Nenhuma conversa ainda</p>
                        <button className="btn-start-conversation" onClick={onNewConversation}>
                            Iniciar conversa
                        </button>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`conversation-item ${activeConversationId === conv.id ? "active" : ""}`}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            <div className="conversation-info">
                                <span className="conversation-title">{conv.title}</span>
                                <div className="conversation-meta">
                                    <Clock size={12} />
                                    <span>{formatDate(conv.updated_at)}</span>
                                    {conv.subject && (
                                        <span className="conversation-subject">{conv.subject}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                className="btn-delete-conversation"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
                                title="Deletar conversa"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConversationSidebar;
