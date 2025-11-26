import React, { useState } from 'react';
import LogoutButton from '../Auth/LogoutButton';
import './Sidebar.css';
// Importa todos os ícones necessários (do App e do Sidebar)
import {
    Menu,
    LayoutDashboard,
    BookOpen,
    Calendar,
    TrendingUp,
    MessageSquare,
    FileQuestion,
    Settings,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';

// Componente Sidebar
export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
    return (
        <>
            <div
                className={`sidebarOverlay ${isOpen ? 'sidebarOverlayOpen' : ''}`}
                onClick={onClose}
            ></div>
            
            <nav
                className={`sidebar ${isOpen ? 'sidebarOpen' : ''} ${
                    isCollapsed ? 'sidebarCollapsed' : ''
                }`}
            >
                <div className="sidebar__header">
                    <div className="sidebar__logoPlaceholder"></div>
                    <span className="sidebar__title">StudySphere</span>
                </div>

                <div className="sidebar__content">
                    <ul className="sidebar__nav">
                        <li>
                            <a href="/dashboard" className="navLink navLinkActive">
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="/subjects" className="navLink">
                                <BookOpen size={20} />
                                <span>Matérias</span>
                            </a>
                        </li>
                        <li>
                            <a href="/calendar" className="navLink">
                                <Calendar size={20} />
                                <span>Calendário</span>
                            </a>
                        </li>
                        <li>
                            <a href="/progress" className="navLink">
                                <TrendingUp size={20} />
                                <span>Progresso</span>
                            </a>
                        </li>
                        <li>
                            <a href="/chats" className="navLink">
                                <MessageSquare size={20} />
                                <span>Chats</span>
                            </a>
                        </li>
                        <li>
                            <a href="/quiz" className="navLink">
                                <FileQuestion size={20} />
                                <span>Questionários</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="sidebar__footer">
                    <ul className="sidebar__nav">
                        <li className="collapseToggle">
                            {/* Usando <a> mas agindo como <button> */}
                            <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); onToggleCollapse(); }}>
                                {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                                <span>Recolher</span>
                            </a>
                        </li>
                        <li>
                            <a href="/config" className="navLink">
                                <Settings size={20} />
                                <span>Configurações</span>
                            </a>
                        </li>
                        <li>
                            <LogoutButton/>
                        </li>
                    </ul>
                    <div className="sidebar__version">
                        <span>StudySphere v1.0</span>
                    </div>
                </div>
            </nav>
        </>
    );
}

// --- FIM DO CÓDIGO DO SIDEBAR ---


// --- INÍCIO DOS ESTILOS DO APP (EMBUTIDOS) ---
// (Isso corrige o erro "Could not resolve ./App.module.css")
const appStyles = `
    body {
        font-family: 'Inter', sans-serif;
        background-color: #f0f2f5;
        margin: 0;
        color: #333;
    }
    .mainContent {
        padding: 24px;
        margin-left: 260px; /* Espaço para o sidebar */
        transition: margin-left 0.3s ease;
    }
    .mainContentCollapsed {
        margin-left: 80px; /* Espaço para o sidebar recolhido */
    }
    .menuToggle {
        display: none; /* Escondido no desktop */
        background: #fff;
        border: 1px solid #dfe4ea;
        border-radius: 8px;
        padding: 8px;
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 1001;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    @media (max-width: 768px) {
        .menuToggle {
            display: block; /* Visível no mobile */
        }
        .mainContent,
        .mainContentCollapsed {
            margin-left: 0; /* Conteúdo ocupa a tela toda */
        }
    }
`;
// --- FIM DOS ESTILOS DO APP ---


function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleDesktopCollapse = () => {
        setIsDesktopCollapsed(!isDesktopCollapsed);
    };

    return (
        // Remove 'styles.appLayout'
        <div className="appLayout">
            {/* Adiciona os estilos do App */}
            <style>{appStyles}</style>
            
            {/* Sidebar agora está definida neste arquivo */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={toggleSidebar}
                isCollapsed={isDesktopCollapsed}
                onToggleCollapse={toggleDesktopCollapse}
            />

            {/* Remove 'styles.' das classes */}
            <main
                className={`mainContent ${
                    isDesktopCollapsed ? 'mainContentCollapsed' : ''
                }`}
            >
                {/* Remove 'styles.' das classes */}
                <button className="menuToggle" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
            </main>
        </div>
    );
}
