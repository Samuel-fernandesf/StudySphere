import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import GoogleLoginButton from './GoogleLoginButton';

function LoginForm({ handleLogin, isLoading, successMessage = '', clearSuccess = () => {}, onResendEmail, resendStatus, resendMessage }) {
    const navigate = useNavigate();
    const [validationError, setValidationError] = useState('');
    const [showResendLink, setShowResendLink] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });

    useEffect(() => {
        if (successMessage) {
        const t = setTimeout(() => clearSuccess(), 6000);
        return () => clearTimeout(t);
        }
    }, [successMessage, clearSuccess]);

    const handleChange = (e) => {
        setFormData({
            ...formData, // Serve para manter os dados antigos salvos
            [e.target.name]: e.target.value //  Altera somente os campos que mudaram
        });

        if (validationError) setValidationError('');
        if (successMessage) clearSuccess();
        if (showResendLink) setShowResendLink(false); //Oculta o link ao digitar
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setValidationError('');
        setShowResendLink(false) //Assume que o login está correto

        if (!formData.email || !formData.senha) {
            setValidationError('Por favor, preencha todos os campos.');
            return;
        }

         try {
            await handleLogin(formData);
            } catch (err) {

                const error_code = err?.error_code;
                const msg =
                    err?.message
                    || err?.response?.data?.message
                    || err?.response?.data?.mensagem
                    || err?.response?.data?.erro
                    || "Erro desconhecido.";

                if (error_code === 'EMAIL_NOT_CONFIRMED'){
                    setValidationError(msg);
                    setShowResendLink(true);
                }else{
                    setValidationError(msg);
                }
                console.log(err);
            }
    };

    const handleResend = () =>{
        onResendEmail(formData.email);
        setValidationError('')
    };

    return (
        <>
            <GoogleLoginButton/>
            <form onSubmit={handleSubmit}>

                {successMessage && (
                    <div className='success-message' role="status">
                        {successMessage}
                    </div>
                )}

                {(resendStatus !== 'idle') && (
                    <div className={resendStatus === 'error' ? 'error-message' : 'success-message'}>
                        {resendMessage}
                    </div>
                )}

                {validationError && (
                    <div className='error-message'>
                        {validationError}
                    </div>
                )}

                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" required/>
                </div>

                <PasswordInput label='Senha:' name='senha' value={formData.senha} onChange={handleChange}placeholder="********" required/>
                
                <div className='form-link-group'> 
                    <a onClick={(e) => {navigate('/esqueci-a-senha');}} className="forgot-password-link"
                    >Esqueceu a senha?</a>

                    {showResendLink && resendStatus !== 'success' && (
                        <a onClick={handleResend} className='resend-email-link' disabled={resendStatus === 'sending'}>
                            {resendStatus === 'sending' ? 'Enviando...' : 'Reenviar Confirmação'}
                        </a>
                    )}
                </div>

                <button type="submit" className="btn submit-btn" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </>
    );
}

export default LoginForm;