import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';

function LoginForm({ handleLogin, isLoading, successMessage = '', clearSuccess = () => {} }) {
    const navigate = useNavigate();
    const [validationError, setValidationError] = useState('');
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
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (!formData.email || !formData.senha) {
            setValidationError('Por favor, preencha todos os campos.');
            return;
        }

         try {
            await handleLogin(formData);
            } catch (err) {
                const msg =
                    err?.message
                    || err?.response?.data?.message
                    || err?.response?.data?.mensagem
                    || err?.response?.data?.erro
                    || "Erro desconhecido.";

                setValidationError(msg);
                console.log(err);

            }
    };

    return (
        <form onSubmit={handleSubmit}>

            {successMessage && (
                <div className='success-message' role="status">
                    {successMessage}
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
            </div>

            <button type="submit" className="btn submit-btn" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    );
}

export default LoginForm;