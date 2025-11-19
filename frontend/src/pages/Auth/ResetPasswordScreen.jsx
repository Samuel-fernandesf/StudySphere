import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import PasswordInput from '../../components/Auth/PasswordInput'; 
import logo from '../../assets/logo.png'; 
import '../Auth/AuthScreen.css'; 

function ResetPasswordScreen() {
    const { token } = useParams(); 
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setMessage('');
        setIsError(false);

        if (newPassword && newPassword.length < 6) {
            setMessage('A senha deve ter pelo menos 6 caracteres.');
            setIsError(true);
            return;
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            setMessage('As senhas não coincidem!');
            setIsError(true);
        }
    }, [newPassword, confirmPassword]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isError || !newPassword || !confirmPassword) {
            if (!message) {
                setMessage('Preencha todos os campos.');
                setIsError(true);
            }
            return;
        }

        setIsLoading(true);

        try {
            const data = await resetPassword(token, newPassword);
            
            const successMsg = data?.message || 'Senha redefinida com sucesso! Faça login.';
            localStorage.setItem('reset_password_success', successMsg); 
            
            navigate('/');

        } catch (error) {
            const errorMsg = error.message || "Erro ao redefinir a senha. O link pode ter expirado ou ser inválido.";
            setMessage(errorMsg);
            setIsError(true);
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
                    <h2>Definir Nova Senha</h2>
                    <p className="subtitle">Por favor, digite sua nova senha.</p>

                    <form onSubmit={handleSubmit}>
                        
                        {message && (
                            <div className={isError ? 'error-message' : 'success-message'} role="status">
                                {message}
                            </div>
                        )}
                        
                        <PasswordInput 
                            label='Nova Senha:' 
                            name='new_password' 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="********" 
                            required
                        />

                        <PasswordInput 
                            label='Confirme a Senha:' 
                            name='confirm_password' 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="********" 
                            required
                        />

                        <div className="button-group">
                            <button 
                                type="submit" 
                                className="btn submit-btn" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordScreen;