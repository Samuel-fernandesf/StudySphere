import React, { useState } from 'react';
import './auth.css'; // Lembre-se de importar o CSS!

// --- SUB-COMPONENTES DE ETAPAS DO CADASTRO ---

// Step 1: Informações Pessoais
const Step1 = ({ formData, handleChange, nextStep }) => (
  <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
    <div className="form-group">
      <label htmlFor="reg-name">Nome</label>
      <input
        type="text"
        id="reg-name"
        placeholder="Nome Completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="reg-username">Username</label>
      <input
        type="text"
        id="reg-username"
        placeholder="seu_usuario"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="reg-dob">Nascimento</label>
      <input
        type="date"
        id="reg-dob"
        name="dob"
        value={formData.dob}
        onChange={handleChange}
        required
      />
    </div>
    <button type="submit" className="btn submit-btn">Próximo</button>
  </form>
);

// Step 2: Dados de Acesso
const Step2 = ({ formData, handleChange, nextStep, prevStep }) => {
  // Validação simples de Senhas (apenas visual)
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordsMatch && formData.password.length >= 6) {
      nextStep();
    } else {
      alert('As senhas não coincidem ou são muito curtas (mínimo 6 caracteres).');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="reg-email">E-mail</label>
        <input
          type="email"
          id="reg-email"
          placeholder="seu@email.com"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="reg-password">Senha</label>
        <input
          type="password"
          id="reg-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="reg-confirm-password">Confirmar Senha</label>
        <input
          type="password"
          id="reg-confirm-password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {!passwordsMatch && formData.confirmPassword.length > 0 && (
          <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>As senhas não coincidem.</p>
        )}
      </div>
      <div className="button-group" style={{ marginTop: '25px' }}>
        <button type="button" className="btn secondary" onClick={prevStep}>Voltar</button>
        <button type="submit" className="btn primary">Próximo</button>
      </div>
    </form>
  );
};

// Step 3: Confirmação e Submissão
const Step3 = ({ formData, prevStep, handleFinalSubmit }) => (
  <div className="confirmation-step">
    <p className="subtitle" style={{ textAlign: 'center', marginBottom: '20px' }}>
      Revise seus dados e finalize o cadastro:
    </p>
    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
      <li><strong>Nome:</strong> {formData.name}</li>
      <li><strong>Username:</strong> {formData.username}</li>
      <li><strong>E-mail:</strong> {formData.email}</li>
    </ul>
    <div className="button-group">
      <button type="button" className="btn secondary" onClick={prevStep}>Voltar</button>
      <button type="button" className="btn submit-btn" onClick={handleFinalSubmit}>
        Criar Conta
      </button>
    </div>
  </div>
);


/**
 * Componente principal do Formulário Multi-Etapas de Cadastro.
 */
const RegisterForm = ({ setView }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const handleFinalSubmit = () => {
    // Aqui você pode enviar para a API com fetch/axios
    console.log("Dados finais do cadastro:", formData);
    alert(`Cadastro de ${formData.username} finalizado! Retornando para o Login.`);
    setView('login'); // Volta para a tela de Login
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} handleChange={handleChange} nextStep={nextStep} />;
      case 2:
        return <Step2 formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <Step3 formData={formData} prevStep={prevStep} handleFinalSubmit={handleFinalSubmit} />;
      default:
        return null;
    }
  };

  // Você pode exibir a etapa atual aqui se quiser
  return (
    <div className="register-wizard">
      <div className="progress-bar-container" style={{ marginBottom: '25px', display: 'flex', gap: '5px' }}>
        <div
          style={{
            flex: 1,
            height: '5px',
            backgroundColor: currentStep >= 1 ? 'var(--primary-color)' : 'var(--secondary-color)',
            borderRadius: '2px'
          }}
        />
        <div
          style={{
            flex: 1,
            height: '5px',
            backgroundColor: currentStep >= 2 ? 'var(--primary-color)' : 'var(--secondary-color)',
            borderRadius: '2px'
          }}
        />
        <div
          style={{
            flex: 1,
            height: '5px',
            backgroundColor: currentStep >= 3 ? 'var(--primary-color)' : 'var(--secondary-color)',
            borderRadius: '2px'
          }}
        />
      </div>

      {renderStep()}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL (AuthScreen) ---

const LoginForm = ({ handleLogin }) => (
  <form onSubmit={handleLogin}>
    <div className="form-group">
      <label htmlFor="login-email">E-mail</label>
      <input type="email" id="login-email" placeholder="seu@email.com" required />
    </div>
    <div className="form-group">
      <label htmlFor="login-senha">Senha</label>
      <input type="password" id="login-senha" placeholder="********" required />
    </div>
    <button type="submit" className="btn submit-btn">Entrar</button>
  </form>
);


const AuthScreen = () => {
  const [view, setView] = useState('login');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Tentativa de Login...");
    // Adicione aqui a lógica de autenticação
  };

  return (
    <div className="container">
      {/* Lado Esquerdo - Branding */}
      <div className="left-panel">
        <div className="logo-area">
          <div className="icon-circle">
            <div className="icon-main">📚</div>
            <div className="icon-globe">🌐</div>
            <div className="icon-user">🧑‍🤝‍🧑</div>
          </div>
        </div>
        <h1>StudySphere</h1>
        <p>Organize seus estudos, colabore com colegas e gamifique seu aprendizado</p>
        <div className="dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Lado Direito - Formulário Dinâmico */}
      <div className="right-panel">
        <div className="card">
          <h2>Bem-vindo ao StudySphere</h2>
          <p className="subtitle">
            {view === 'login'
              ? 'Entre na sua conta ou crie uma nova para começar'
              : 'Cadastre-se em 3 passos'}
          </p>

          <div className="button-group">
            <button
              className={`btn ${view === 'login' ? 'primary' : 'secondary'}`}
              onClick={() => setView('login')}
            >
              Entrar
            </button>
            <button
              className={`btn ${view === 'cadastro' ? 'primary' : 'secondary'}`}
              onClick={() => setView('cadastro')}
            >
              Criar conta
            </button>
          </div>

          {/* Renderização condicional do Formulário */}
          {view === 'login'
            ? <LoginForm handleLogin={handleLogin} />
            : <RegisterForm setView={setView} />
          }
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;