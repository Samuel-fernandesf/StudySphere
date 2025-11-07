import React from 'react';
// Importa o NavLink para a navegação
// CORREÇÃO: Removi o NavLink temporariamente. O erro "useLocation() may be used only in the context of a <Router>"
// acontece porque o preview não está "envolvido" por um <BrowserRouter> do react-router-dom.
// O seu código com <NavLink> estava correto para o seu projeto real, mas para o preview funcionar,
// vou voltar a usar tags <a>.
// import { NavLink } from 'react-router-dom';
// 1. Importe os ícones que você precisa do lucide-react
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    TrendingUp,
    MessageSquare,
    FileQuestion,
    Settings
} from 'lucide-react';

/*
  Para corrigir o erro de compilação no preview (que não achava o .css),
  eu movi todos os estilos para dentro de uma tag <style> aqui.

  No seu projeto Vite, você ainda pode (e deve) mover este CSS
  para um arquivo "Sidebar.module.css" e importá-lo como antes.
  Esta correção é para o componente funcionar de forma independente.
*/
const sidebarStyles = `
    /* --- INÍCIO: COMPONENTE SIDEBAR --- */
    
    .sidebar {
        width: 260px;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: var(--sidebar-bg, #232946); /* Usa variável global, com fallback */
        color: var(--sidebar-text, #ffffff);
        
        display: flex;
        flex-direction: column;
        padding: 24px;
        
        transition: transform 0.3s ease-in-out;
        z-index: 1000;
    }

    /* Cabeçalho com o logo */
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
    }

    .sidebar__title {
        font-size: 1.25rem;
        font-weight: 700;
    }

    /* Conteúdo principal (links de navegação) */
    .sidebar__content {
        flex-grow: 1; /* Empurra o rodapé para baixo */
        overflow-y: auto; /* Adiciona scroll se os links não couberem */
    }

    .sidebar__nav {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 8px; /* Espaço entre os links */
    }

    .navLink {
        display: flex;
        align-items: center;
        gap: 12px; /* Espaço entre ícone e texto */
        padding: 12px;
        border-radius: 8px;
        
        color: var(--sidebar-text, #ffffff);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        
        transition: background-color 0.2s ease;
    }

    /* Os ícones do lucide-react são SVGs */
    .navLink svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0; /* Impede que o ícone encolha */
    }

    /* Estado Hover (mouse em cima) */
    .navLink:hover {
        background-color: var(--sidebar-bg-active, #121629);
    }

    /* Estado Ativo (página atual) */
    .navLinkActive {
        background-color: var(--sidebar-bg-active, #121629);
    }

    /* Rodapé da Sidebar */
    .sidebar__footer {
        margin-top: 24px; /* Espaço acima do rodapé */
    }

    .sidebar__footer .navLink {
        font-size: 0.9rem;
    }

    .sidebar__version {
        font-size: 0.75rem;
        color: var(--sidebar-text-muted, #b4b7c0);
        text-align: left;
        padding: 12px;
        margin-top: 8px;
    }

    /* --- Overlay (Fundo escuro) --- */
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

    /* Classe para mostrar o overlay */
    .sidebarOverlayOpen {
        display: block;
    }


    /* --- Estilos de Responsividade (Mobile) --- */
    @media (max-width: 768px) {
        .sidebar {
            /* Esconde o menu fora da tela à esquerda */
            transform: translateX(-100%);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }

        /* Classe que o React vai adicionar para mostrar o menu */
        .sidebarOpen {
            transform: translateX(0);
        }
    }
`;


/*
  Este componente recebe duas props:
  - `isOpen`: Um booleano (true/false) que diz se o menu deve estar aberto.
  - `onClose`: Uma função que será chamada quando o usuário clicar fora (no overlay).
*/
// CORREÇÃO: Mudei de "export function" para "export default function"
// Isso corrige o erro "Element type is invalid" se o componente
// estiver sendo importado como um 'default' no arquivo principal (ex: App.jsx).
export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* 3. Adiciona os estilos CSS diretamente no DOM */}
            <style>{sidebarStyles}</style>

            {/* 4. O Overlay (fundo escuro) só aparece se 'isOpen' for true */}
            <div
                className={`sidebarOverlay ${isOpen ? 'sidebarOverlayOpen' : ''}`}
                onClick={onClose}
            ></div>

            {/* 5. O Sidebar usa as classes CSS puras */}
            <nav className={`sidebar ${isOpen ? 'sidebarOpen' : ''}`}>
                <div className="sidebar__header">
                    <div className="sidebar__logoPlaceholder"></div>
                    <span className="sidebar__title">StudySphere</span>
                </div>

                <div className="sidebar__content">
    <ul className="sidebar__nav">
        <li>
            {/* 6. CORREÇÃO: Voltei para a tag <a> para o preview funcionar */}
            <a
                href="/dashboard"
                className="navLink navLinkActive" // Adicionado classe ativa manualmente para o preview
            >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
            </a>
        </li>
        <li>
            <a
                href="/files"
                className="navLink"
            >
                <BookOpen size={20} />
                <span>Matérias</span>
            </a>
        </li>
        <li>
            <a
                href="/calendar"
                className="navLink"
            >
                <Calendar size={20} />
                <span>Calendário</span>
            </a>
        </li>
        <li>
            <a
                href="/progress"
                className="navLink"
            >
                <TrendingUp size={20} />
                <span>Progresso</span>
            </a>
        </li>
        <li>
            <a
                href="/chats"
                className="navLink"
            >
                <MessageSquare size={20} />
                <span>Chats</span>
            </a>
        </li>
        <li>
            <a
                href="/quiz"
                className="navLink"
            >
                <FileQuestion size={20} />
                <span>Questionários</span>
            </a>
        </li>
    </ul>
</div>

<div className="sidebar__footer">
    <ul className="sidebar__nav">
        <li>
            <a
                href="/config"
                className="navLink"
            >
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