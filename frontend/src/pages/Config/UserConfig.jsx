import React, { useState } from 'react';
import { 
  User, Bell, Moon, Shield, Camera, ChevronDown, 
  Download, HelpCircle, LogOut, Trash2, Check, Globe 
} from 'lucide-react';
import './UserConfig.css';
import Sidebar from "../../components/layout/Sidebar";

// Componentes auxiliares
const InputGroup = ({ label, defaultValue, type = "text" }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <input type={type} className="form-input" defaultValue={defaultValue} />
  </div>
);

const ToggleSwitch = ({ label, description, defaultChecked }) => (
  <div className="toggle-item">
    <div>
      <h4 className="section-title" style={{ fontSize: '0.85rem' }}>{label}</h4>
      <p className="section-desc" style={{ fontSize: '0.75rem', marginTop: 0 }}>{description}</p>
    </div>
    <label className="switch" style={{ position: 'relative', width: 40, height: 22 }}>
      <input type="checkbox" defaultChecked={defaultChecked} style={{opacity: 0, width: 0, height: 0}} />
      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: '#cbd5e1', borderRadius: 34, transition: '.4s' }} className="slider-bg"></span>
      <span style={{ position: 'absolute', content: "", height: 18, width: 18, left: 2, bottom: 2, background: 'white', borderRadius: '50%', transition: '.4s' }} className="slider-circle"></span>
    </label>
    {/* Nota: Adicionei estilo inline no switch pra simplificar, mas o ideal é o CSS da resposta anterior */}
  </div>
);

// --- ABAS ---

const ProfileTab = () => (
  <div className="tab-content">
    <div className="card">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title">Perfil</h3>
          <p className="section-desc">Dados da conta</p>
        </div>
        {/* Avatar movido para o topo direito ou mantido aqui compacto */}
      </div>

      <div className="profile-header">
        <div className="avatar-container">
          <div className="avatar-circle">JS</div>
          <button className="camera-btn"><Camera size={12} /></button>
        </div>
        <div>
           <div className="section-title">João Silva</div>
           <div className="section-desc">Aluno • Engenharia de Software</div>
        </div>
      </div>

      {/* Grid para Nome e Email na mesma linha */}
      <div className="form-grid">
        <InputGroup label="Nome Completo" defaultValue="João Silva" />
        <InputGroup label="Email" defaultValue="joao.silva@studysphere.com" />
      </div>

      {/* Grid para Curso e Semestre */}
      <div className="form-grid">
        <InputGroup label="Curso" defaultValue="Engenharia de Software" />
        <InputGroup label="Semestre" defaultValue="5º Semestre" />
      </div>

      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label className="input-label">Biografia</label>
        <textarea className="form-textarea" defaultValue="Estudante apaixonado por tecnologia..."></textarea>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary">Cancelar</button>
        <button className="btn btn-primary"><Check size={14} /> Salvar</button>
      </div>
    </div>
    
    {/* Seção de Segurança movida para dentro da visualização se sobrar espaço ou mantida separada */}
    <div className="card">
        <h3 className="section-title mb-2">Segurança Rápida</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'center'}}>Alterar Senha</button>
            <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'center'}}>Ativar 2FA</button>
        </div>
    </div>
  </div>
);

const NotificationsTab = () => (
  <div className="card">
    <h3 className="section-title mb-4">Preferências de Notificação</h3>
    <ToggleSwitch label="Push" description="Notificações no navegador" defaultChecked={true} />
    <ToggleSwitch label="Email" description="Resumos semanais" defaultChecked={true} />
    <ToggleSwitch label="Metas" description="Lembretes diários" defaultChecked={true} />
    <ToggleSwitch label="Relatórios" description="Progresso semanal" defaultChecked={true} />
    <div className="action-buttons">
      <button className="btn btn-primary">Salvar</button>
    </div>
  </div>
);

const AppearanceTab = () => (
  <div className="card">
    <h3 className="section-title mb-4">Aparência</h3>
    <div className="form-grid">
        <div className="input-group">
            <label className="input-label">Tema</label>
            <select className="form-select"><option>Claro</option><option>Escuro</option></select>
        </div>
        <div className="input-group">
            <label className="input-label">Idioma</label>
            <select className="form-select"><option>Português (BR)</option><option>English</option></select>
        </div>
    </div>
    <div className="input-group mb-4">
        <label className="input-label">Meta Diária: 4h</label>
        <input type="range" style={{width: '100%'}} />
    </div>
    <div className="action-buttons">
      <button className="btn btn-primary">Aplicar</button>
    </div>
  </div>
);

const PrivacyTab = () => (
  <div className="tab-content">
      <div className="card">
        <h3 className="section-title">Dados</h3>
        <div className="form-grid" style={{marginTop: '1rem'}}>
             <button className="btn btn-secondary" style={{justifyContent: 'center'}}><Download size={14}/> Exportar Dados</button>
             <button className="btn btn-secondary" style={{justifyContent: 'center'}}><HelpCircle size={14}/> Termos de Uso</button>
        </div>
      </div>
      <div className="card" style={{borderColor: '#fecaca'}}>
        <h3 className="section-title text-red-600">Zona de Perigo</h3>
        <div className="form-grid" style={{marginTop: '1rem'}}>
            <button className="btn btn-secondary" style={{color: '#dc2626', borderColor: '#fecaca', justifyContent: 'center'}}><LogOut size={14}/> Sair</button>
            <button className="btn btn-secondary" style={{color: '#dc2626', borderColor: '#fecaca', justifyContent: 'center'}}><Trash2 size={14}/> Deletar</button>
        </div>
      </div>
  </div>
);

// --- Componente Principal ---

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Moon },
    { id: 'privacidade', label: 'Privacidade', icon: Shield },
  ];

  const renderContent = () => {
      switch(activeTab) {
          case 'perfil': return <ProfileTab />;
          case 'notificacoes': return <NotificationsTab />;
          case 'aparencia': return <AppearanceTab />;
          case 'privacidade': return <PrivacyTab />;
          default: return <ProfileTab />;
      }
  }

  return (
    <>
    <Sidebar />
    <div className="settings-container">
      <div className="settings-wrapper">
        
        <div className="header-top">
          <div>
            <h1 className="page-title">Configurações</h1>
          </div>
          <div className="version-badge">v1.0.0</div>
        </div>

        <div className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="content-area">
          {renderContent()}
        </div>

      </div>
    </div>
    </>
  );
};

export default SettingsPage;