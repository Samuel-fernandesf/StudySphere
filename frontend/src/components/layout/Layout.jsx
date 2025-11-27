import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/' || location.pathname.startsWith('/esqueci-a-senha') || location.pathname.startsWith('/redefinir-senha') || location.pathname.startsWith('/confirmar-email');

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
    <div className='layout-container'>
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <button
          className="mobile-menu-toggle"
          onClick={handleOpenMobileSidebar}
          aria-label="Abrir menu"
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}
