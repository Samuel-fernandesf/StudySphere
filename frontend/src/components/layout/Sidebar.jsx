import React, { useState } from 'react';
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

// --- INÍCIO DO CÓDIGO DO SIDEBAR (EMBUTIDO) ---
// (Isso corrige o erro "Could not resolve ./ui/Sidebar")

/*
  Estilos do Sidebar. No seu projeto Vite real,
  isso ficaria no arquivo "Sidebar.module.css".
*/
const sidebarStyles = `
    :root {
        --sidebar-bg: #232946;
        --sidebar-bg-active: #121629;
        --sidebar-text: #ffffff;
        --sidebar-text-muted: #b4b7c0;
    }

    .sidebar {
        width: 260px;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: var(--sidebar-bg);
        color: var(--sidebar-text);
        display: flex;
        flex-direction: column;
        padding: 24px;
        transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
        z-index: 1000;
        box-sizing: border-box; /* Garante que o padding não aumente a largura */
    }
    .sidebar__header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 40px;
    }
    .sidebar__logoPlaceholder {
        width: 32px;
        height: 32px;
        background-color: #3b5998; /* Cor placeholder */
        border-radius: 50%;
        flex-shrink: 0;
    }
    .sidebar__title {
        font-size: 1.25rem;
        font-weight: 700;
    }
    .sidebar__content {
        flex-grow: 1;
        overflow-y: auto;
    }
    .sidebar__nav {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .navLink {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        color: var(--sidebar-text);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        transition: background-color 0.2s ease;
    }
    .navLink svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }
    .navLink:hover {
        background-color: var(--sidebar-bg-active);
    }
    .navLinkActive {
        background-color: var(--sidebar-bg-active);
    }
    .sidebar__footer {
        margin-top: 24px;
    }
    .sidebar__footer .navLink {
        font-size: 0.9rem;
    }
    .sidebar__version {
        font-size: 0.75rem;
        color: var(--sidebar-text-muted);
        text-align: left;
        padding: 12px;
        margin-top: 8px;
    }
    
    /* Estilos para Menu Recolhido */
    .sidebarCollapsed {
        width: 80px; /* Largura do menu recolhido */
    }
    .sidebarCollapsed .sidebar__title,
    .sidebarCollapsed .navLink span,
    .sidebarCollapsed .sidebar__version {
        display: none;
    }
    .sidebarCollapsed .sidebar__header,
    .sidebarCollapsed .navLink {
        justify-content: center;
    }
    .sidebarCollapsed .sidebar__logoPlaceholder {
        margin-right: 0;
    }
    .collapseToggle {
        background: transparent;
        border: none;
        width: 100%;
        color: var(--sidebar-text-muted);
        margin-bottom: 8px;
        padding: 0;
        cursor: pointer;
    }
    .collapseToggle .navLink:hover {
        color: var(--sidebar-text);
    }
    
    /* Overlay (Fundo escuro) */
    .sidebarOverlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
    .sidebarOverlayOpen {
        display: block;
    }
    
    /* Responsividade (Mobile) */
    @media (max-width: 768px) {
        .sidebar {
            transform: translateX(-100%);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
        .sidebarOpen {
            transform: translateX(0);
        }
        /* No mobile, o botão de recolher não faz sentido */
        .collapseToggle {
            display: none;
        }
        .sidebarCollapsed {
            width: 260px; /* Volta ao normal */
        }
        .sidebarCollapsed .sidebar__title,
        .sidebarCollapsed .navLink span,
        .sidebarCollapsed .sidebar__version {
            display: block; /* Mostra o texto */
        }
        .sidebarCollapsed .sidebar__header,
        .sidebarCollapsed .navLink {
            justify-content: flex-start; /* Alinha normal */
        }
    }
`;

// Componente Sidebar (agora local)
function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
    return (
        <>
            {/* Adiciona os estilos do sidebar */}
            <style>{sidebarStyles}</style>
            
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
                            <a href="/files" className="navLink">
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

export default App;