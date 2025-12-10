import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuthContext } from "../../contexts/AuthContext";
import api from "../../api/api";
import "./UserConfig.css";

export default function UserConfig() {
    const { userDetails, fetchUserDetails } = useAuthContext();
    const [activeTab, setActiveTab] = useState("perfil");
    const [toast, setToast] = useState(null);

    // Estados para o formulário de perfil
    const [profileData, setProfileData] = useState({
        nome_completo: "",
        username: "",
        email: "",
        nascimento: "",
        biografia: "",
        curso: ""
    });

    // Estados para preferências
    const [preferences, setPreferences] = useState({
        // Notificações
        pushNotifications: true,
        emailNotifications: true,
        studyReminders: true,
        weeklyReports: false,
        achievements: true,
        
        // Aparência
        theme: "light",
        language: "pt",
        soundEffects: true,
        dailyGoal: 2,
        
        // Privacidade
        profileVisibility: "public"
    });

    // Avatar
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Carrega dados do usuário ao montar componente
    useEffect(() => {
        if (userDetails) {
            setProfileData({
                nome_completo: userDetails.nome_completo || "",
                username: userDetails.username || "",
                email: userDetails.email || "",
                nascimento: userDetails.nascimento || "",
                biografia: userDetails.biografia || "",
                curso: userDetails.curso || ""
            });
        }
    }, [userDetails]);

    // Função para mostrar toast
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handlers
    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePreferenceToggle = (key) => {
        setPreferences({
            ...preferences,
            [key]: !preferences[key]
        });
    };

    const handlePreferenceChange = (key, value) => {
        setPreferences({
            ...preferences,
            [key]: value
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await api.put('/dashboard/update-profile', profileData);
            showToast("Perfil atualizado com sucesso!");
            await fetchUserDetails(); // Atualiza dados no contexto
        } catch (error) {
            showToast("Erro ao salvar perfil", "error");
            console.error(error);
        }
    };

    const handleSavePreferences = async () => {
        try {
            // TODO: Implementar chamada à API para salvar preferências
            // await api.put('/dashboard/preferences', preferences);
            showToast("Preferências salvas com sucesso!");
        } catch (error) {
            showToast("Erro ao salvar preferências", "error");
            console.error(error);
        }
    };

    const handleExportData = () => {
        showToast("Exportação de dados iniciada. Você receberá um email em breve.");
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) {
            showToast("Funcionalidade em desenvolvimento", "error");
        }
    };

    // Renderiza conteúdo da aba ativa
    const renderTabContent = () => {
        switch (activeTab) {
            case "perfil":
                return (
                    <div className="config-content">
                        <div className="config-section">
                            <h3 className="config-section-header">Informações Pessoais</h3>
                            
                            {/* Avatar */}
                            <div className="avatar-upload">
                                <div className="avatar-preview">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" />
                                    ) : (
                                        userDetails?.nome_completo?.charAt(0).toUpperCase() || "?"
                                    )}
                                </div>
                                <div className="avatar-actions">
                                    <label className="btn-secondary" style={{ cursor: "pointer" }}>
                                        Alterar Foto
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                    {avatarPreview && (
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => setAvatarPreview(null)}
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Formulário */}
                            <div className="config-form-group">
                                <label>Nome Completo</label>
                                <input 
                                    type="text"
                                    name="nome_completo"
                                    value={profileData.nome_completo}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="config-form-group">
                                <label>Nome de Usuário</label>
                                <input 
                                    type="text"
                                    name="username"
                                    value={profileData.username}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="config-form-group">
                                <label>Email</label>
                                <input 
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    disabled
                                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                                />
                                <small style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                                    O email não pode ser alterado
                                </small>
                            </div>

                            <div className="config-form-group">
                                <label>Data de Nascimento</label>
                                <input 
                                    type="date"
                                    name="nascimento"
                                    value={profileData.nascimento}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="config-form-group">
                                <label>Curso</label>
                                <input 
                                    type="text"
                                    name="curso"
                                    value={profileData.curso}
                                    onChange={handleProfileChange}
                                    placeholder="Ex: Engenharia de Software"
                                />
                            </div>

                            <div className="config-form-group">
                                <label>Biografia</label>
                                <textarea 
                                    name="biografia"
                                    value={profileData.biografia}
                                    onChange={handleProfileChange}
                                    placeholder="Conte um pouco sobre você..."
                                />
                            </div>

                            <div className="config-actions">
                                <button className="btn-primary" onClick={handleSaveProfile}>
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>

                        <div className="config-section">
                            <h3 className="config-section-header">Segurança</h3>
                            <p className="config-section-desc">
                                Gerencie suas configurações de segurança e autenticação
                            </p>

                            <div className="config-form-group">
                                <label>Alterar Senha</label>
                                <button className="btn-secondary" style={{ width: "100%" }}>
                                    Redefinir Senha
                                </button>
                            </div>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Autenticação de Dois Fatores (2FA)</strong>
                                    <span>Adicione uma camada extra de segurança à sua conta</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case "notificacoes":
                return (
                    <div className="config-content">
                        <div className="config-section">
                            <h3 className="config-section-header">Preferências de Notificações</h3>
                            <p className="config-section-desc">
                                Controle como e quando você deseja receber notificações
                            </p>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Notificações Push</strong>
                                    <span>Receba alertas no navegador</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.pushNotifications}
                                        onChange={() => handlePreferenceToggle("pushNotifications")}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Notificações por Email</strong>
                                    <span>Receba atualizações importantes por email</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.emailNotifications}
                                        onChange={() => handlePreferenceToggle("emailNotifications")}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Lembretes de Estudo</strong>
                                    <span>Receba lembretes para manter sua rotina de estudos</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.studyReminders}
                                        onChange={() => handlePreferenceToggle("studyReminders")}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Relatórios Semanais</strong>
                                    <span>Receba resumos do seu progresso toda semana</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.weeklyReports}
                                        onChange={() => handlePreferenceToggle("weeklyReports")}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Conquistas e Badges</strong>
                                    <span>Seja notificado quando conquistar novas badges</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.achievements}
                                        onChange={() => handlePreferenceToggle("achievements")}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>

                            <div className="config-actions">
                                <button className="btn-primary" onClick={handleSavePreferences}>
                                    Salvar Preferências
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case "aparencia":
                return (
                    <div className="config-content">
                        <div className="config-section">
                            <h3 className="config-section-header">Personalização Visual</h3>
                            <p className="config-section-desc">
                                Customize a aparência da plataforma de acordo com suas preferências
                            </p>

                            <div className="config-form-group">
                                <label>Tema</label>
                                <select 
                                    value={preferences.theme}
                                    onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                                >
                                    <option value="light">Claro</option>
                                    <option value="dark">Escuro</option>
                                    <option value="auto">Automático (Sistema)</option>
                                </select>
                            </div>

                            <div className="config-form-group">
                                <label>Idioma</label>
                                <select 
                                    value={preferences.language}
                                    onChange={(e) => handlePreferenceChange("language", e.target.value)}
                                >
                                    <option value="pt">Português (BR)</option>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>

                            <div className="config-switch-group">
                                <div className="config-switch-label">
                                    <strong>Efeitos Sonoros</strong>
                                    <span>Reproduzir sons ao completar tarefas e conquistas</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.soundEffects}
                                        onChange={() => handlePreferenceToggle("soundEffects")}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </div>

                            <div className="slider-group">
                                <div className="slider-label">
                                    <span>Meta de Estudo Diária</span>
                                    <span className="slider-value">{preferences.dailyGoal}h</span>
                                </div>
                                <input 
                                    type="range"
                                    className="slider"
                                    min="1"
                                    max="8"
                                    step="0.5"
                                    value={preferences.dailyGoal}
                                    onChange={(e) => handlePreferenceChange("dailyGoal", parseFloat(e.target.value))}
                                />
                            </div>

                            <div className="config-actions">
                                <button className="btn-primary" onClick={handleSavePreferences}>
                                    Salvar Preferências
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case "privacidade":
                return (
                    <div className="config-content">
                        <div className="config-section">
                            <h3 className="config-section-header">Dados e Privacidade</h3>
                            <p className="config-section-desc">
                                Gerencie seus dados pessoais e configurações de privacidade
                            </p>

                            <div className="config-form-group">
                                <label>Visibilidade do Perfil</label>
                                <select 
                                    value={preferences.profileVisibility}
                                    onChange={(e) => handlePreferenceChange("profileVisibility", e.target.value)}
                                >
                                    <option value="public">Público</option>
                                    <option value="friends">Apenas Amigos</option>
                                    <option value="private">Privado</option>
                                </select>
                            </div>
                            {/* Estatísticas da conta */}
                            {/* <div style={{ marginTop: 24 }}>
                                <h4 style={{ marginBottom: 12, fontSize: "1rem" }}>Estatísticas da Conta</h4>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">0h</div>
                                        <div className="stat-label">Horas Estudadas</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">0</div>
                                        <div className="stat-label">Conquistas</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">0</div>
                                        <div className="stat-label">Tarefas Completas</div>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        <div className="config-section">
                            <h3 className="config-section-header">Políticas e Termos</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <a href="#" className="action-link">Política de Privacidade</a>
                                <a href="#" className="action-link">Termos de Uso</a>
                                <a href="#" className="action-link">Política de Cookies</a>
                            </div>
                        </div>

                        <div className="config-section">
                            <h3 className="config-section-header" style={{ color: "#ef4444" }}>Zona de Perigo</h3>
                            <p className="config-section-desc">
                                Ações irreversíveis que afetam permanentemente sua conta
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <button className="btn-danger" onClick={handleDeleteAccount}>
                                    Excluir Conta Permanentemente
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Sidebar />
            <div className="config-root">
                <header className="config-header">
                    <h1>Configurações</h1>
                    <p>Gerencie suas preferências e informações da conta</p>
                </header>

                {/* Tabs */}
                <div className="config-tabs">
                    <button 
                        className={`config-tab ${activeTab === "perfil" ? "active" : ""}`}
                        onClick={() => setActiveTab("perfil")}
                    >
                        Perfil
                    </button>
                    {/* <button 
                        className={`config-tab ${activeTab === "notificacoes" ? "active" : ""}`}
                        onClick={() => setActiveTab("notificacoes")}
                    >
                        Notificações
                    </button> */}
                    {/* <button 
                        className={`config-tab ${activeTab === "aparencia" ? "active" : ""}`}
                        onClick={() => setActiveTab("aparencia")}
                    >
                        Aparência
                    </button> */}
                    <button 
                        className={`config-tab ${activeTab === "privacidade" ? "active" : ""}`}
                        onClick={() => setActiveTab("privacidade")}
                    >
                        Privacidade
                    </button>
                </div>

                {/* Conteúdo da aba ativa */}
                {renderTabContent()}

                {/* Toast notification */}
                {toast && (
                    <div className={`toast ${toast.type}`}>
                        <span>{toast.type === "success" ? "✓" : "✗"}</span>
                        <span>{toast.message}</span>
                    </div>
                )}
            </div>
        </>
    );
}
