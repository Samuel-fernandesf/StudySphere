import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import logo from '../../assets/logo.png';
import './AuthScreen.css';

function ForgotPasswordScreen() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (validationError) setValidationError('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');
        setIsLoading(true);

        if (!email) {
            setValidationError('Por favor, digite seu e-mail.');
            setIsLoading(false);
            return;
        }

        try {
            const data = await forgotPassword(email);
            const successMsg = data?.message || 'Um e-mail de redefinição foi enviado para você.';
            localStorage.setItem('reset_password_success', successMsg);

            navigate('/')
        } catch (error) {
            const msg = error.message || "Erro ao solicitar redefinição. Tente novamente.";
            setValidationError(msg);
        } finally {
            setIsLoading(false);
        }
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
                    <h2>Redefinir Senha</h2>

                    <form onSubmit={handleSubmit}>
                        
                        {validationError && (
                            <div className='error-message'>{validationError}</div>
                        )}

                        <p className='subtitle-text'>
                            Digite o e-mail cadastrado para receber o link de redefinição de senha.
                        </p>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={email} 
                                onChange={handleChange}
                                placeholder="seu@email.com" 
                                required
                            />
                        </div>

                        <div className="button-group">
                            <button 
                                type="button" 
                                className="btn secondary" 
                                onClick={() => navigate('/')}
                                disabled={isLoading}
                            >
                                Voltar
                            </button>

                            <button 
                                type="submit" 
                                className="btn primary" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Link'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordScreen;