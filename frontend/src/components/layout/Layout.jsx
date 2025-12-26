import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  // Verifica se está em rota de autenticação
  const isAuthRoute =
    location.pathname === '/' ||
    location.pathname.startsWith('/esqueci-a-senha') ||
    location.pathname.startsWith('/redefinir-senha') ||
    location.pathname.startsWith('/confirmar-email');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  return (
    <div
      className={`app-layout ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        paddingLeft: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Overlay Mobile */}
      <div
        className={`sidebarOverlay ${isMobileSidebarOpen ? 'sidebarOverlayOpen' : ''}`}
        onClick={handleCloseMobileSidebar}
      />

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={handleOpenMobileSidebar}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
