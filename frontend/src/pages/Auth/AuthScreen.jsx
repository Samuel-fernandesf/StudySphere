import { useState } from 'react';
import LoginForm from '../../components/Auth/LoginForm';
import RegisterForm from '../../components/Auth/RegisterForm';
import { useAuthContext } from '../../contexts/AuthContext';
import { login, register } from '../../services/authService';
import logo from '../../assets/logo.png';
import './AuthScreen.css';

function AuthScreen() {
  // Pega a função de salvar sessão
  const {entrar} = useAuthContext();

  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async ({email, senha}) =>{
    setLoading(true);

    try{
      const data = await login(email, senha);
      entrar(data.user_id, data.access_token);
      return data;
    } catch (error){
      console.log('Erro no HandleLogin', error)
      throw error
    }finally{
      setLoading(false);
    }
  }

  const handleRegister = async (registerData) => {
    setLoading(true);

    try{
      const data = await register(registerData);
      setView('login');

      const msg = data?.message || 'Cadastro realizado com sucesso! Faça login.';
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 6000);

      return data;
    }catch (error){
      console.error("Erro no Cadastro:", error);
      throw error;
    }finally{
      setLoading(false);
    };
  };

  return (
    <div className='container'>
      <div className='left-panel'>
        <div className="logo-area">
          <img className='img-circle' src={logo} alt="" />
        </div>
        
        <h1>StudySphere</h1>
        <p>Organize seus estudos, colabore com colegas e gamifique seu aprendizado</p>
      </div>
      <div className='right-panel'>
        <div className="card">
          <h2>Bem-vindo ao StudySphere</h2>
          <p className="subtitle">
            {view === 'login' ? 'Entre na sua conta ou crie uma nova para começar'
            :
            'Cadastre-se em 3 passos'}
          </p>

          <div className='button-group toggle-button-group' data-view={view}> 
              <button 
                  className={`btn ${view === 'login' ? 'active' : ''}`} // Mudei para 'active'
                  onClick={() => setView('login')} 
              >
                  Fazer Login
              </button>
              <button 
                  className={`btn ${view === 'cadastro' ? 'active' : ''}`} // Mudei para 'active'
                  onClick={() => setView('cadastro')}
              >
                  Registrar-se
              </button>
          </div>

          {/* Renderização Condicional da Tela */}
            {view === 'login' && (
                <LoginForm handleLogin={handleLogin} isLoading={loading} successMessage={successMessage}
              clearSuccess={() => setSuccessMessage('')} />
            )}

            {view === 'cadastro' && (
                <RegisterForm handleRegister={handleRegister} isLoading={loading} />
            )}
        </div>
      </div>
    </div>
    );
}

export default AuthScreen;