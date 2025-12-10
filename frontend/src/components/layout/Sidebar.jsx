import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import LogoutButton from '../Auth/LogoutButton';
import logo from '../../assets/sphere_logo.png';
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
    ChevronsRight,
    Sparkles
} from 'lucide-react';

// Componente Sidebar
export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
    const location = useLocation();
    
    // Função para verificar se o link está ativo
    const isActive = (path) => {
        return location.pathname === path;
    };

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
                    <img className='sidebar__logoPlaceholder' src={logo} alt="" />
                    <span className="sidebar__title">StudySphere</span>
                </div>

                <div className="sidebar__content">
                    <ul className="sidebar__nav">
                        <li>
                            <Link 
                                to="/dashboard" 
                                className={`navLink ${isActive('/dashboard') ? 'navLinkActive' : ''}`}
                            >
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/subjects" 
                                className={`navLink ${isActive('/subjects') ? 'navLinkActive' : ''}`}
                            >
                                <BookOpen size={20} />
                                <span>Matérias</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/calendar" 
                                className={`navLink ${isActive('/calendar') ? 'navLinkActive' : ''}`}
                            >
                                <Calendar size={20} />
                                <span>Calendário</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/progress" 
                                className={`navLink ${isActive('/progress') ? 'navLinkActive' : ''}`}
                            >
                                <TrendingUp size={20} />
                                <span>Progresso</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/chats" 
                                className={`navLink ${isActive('/chats') ? 'navLinkActive' : ''}`}
                            >
                                <MessageSquare size={20} />
                                <span>Chats</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/quiz" 
                                className={`navLink ${isActive('/quiz') ? 'navLinkActive' : ''}`}
                            >
                                <FileQuestion size={20} />
                                <span>Questionários</span>
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/assistant" 
                                className={`navLink ${isActive('/assistant') ? 'navLinkActive' : ''}`}
                            >
                                <Sparkles size={20} />
                                <span>Assistente</span>
                            </Link>
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
                            <Link 
                                to="/config" 
                                className={`navLink ${isActive('/config') ? 'navLinkActive' : ''}`}
                            >
                                <Settings size={20} />
                                <span>Configurações</span>
                            </Link>
                        </li>
                        <li>
                            <LogoutButton/>
                        </li>
                    </ul>
                    <div className="sidebar__version">
                        <span>StudySphere v1.5</span>
                    </div>
                </div>
            </nav>
        </>
    );
}
