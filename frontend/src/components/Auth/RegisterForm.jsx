import { useState } from 'react';
import PasswordInput from './PasswordInput';
import { checkEmail, checkUsername } from "../../services/authService";

function RegisterForm({ handleRegister, isLoading }){

    const [currentStep, setCurrentStep] = useState(1);
    const [validationError, setValidationError] = useState('');
    const [formData, setFormData] = useState({
        'email': '',
        'senha': '',
        'confirm_senha': '',
        'username': '',
        'nome_completo': '',
        'data_nascimento': ''
    });

    const handleChange = (e) =>{
        setFormData({
            ...formData, // Serve para manter os dados antigos salvos
            [e.target.name]: e.target.value //  Altera somente os campos que mudaram
        });

        if (validationError) setValidationError('');
    }

    const validateStep1 = () => {
        const { email, senha, confirm_senha } = formData;

        if (!email || !senha || !confirm_senha) {
            setValidationError('Preencha todos os campos.');
            return false;
        }

        if (senha.length < 6) {
            setValidationError('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        if (senha !== confirm_senha) {
            setValidationError('As senhas não coincidem!');
            return false;
        }

        setValidationError('');
        return true;
    };

    const validateStep2 = () => {
        const { nome_completo, username, data_nascimento } = formData;

        if (!nome_completo || !username || !data_nascimento) {
            setValidationError('Por favor preencha todos os campos.');
            return false;
        }

        if (nome_completo.length > 100) {
            setValidationError('O Nome Completo deve ter no máximo 100 caracteres.');
            return false;
        }

        if (username.length > 100) {
            setValidationError('O Username deve ter no máximo 100 caracteres.');
            return false;
        }

        const today = new Date();
        const data_nasc = new Date(data_nascimento); //Converte a string do input para Date

        if (data_nasc > today){
            setValidationError('A data de nascimento não pode ser no futuro.');
            return false;
        }
        if (data_nasc.getFullYear() < 1900){
            setValidationError('Data de nascimento inválida. Use uma data após 1900.');
            return false;
        }

        let idade = today.getFullYear() - data_nasc.getFullYear();
        let diferenca_mes = today.getMonth() - data_nasc.getMonth();

        if (diferenca_mes < 0 || (diferenca_mes === 0 && today.getDate() < data_nasc.getDate())) {
            idade--;
        }

        if (idade < 12){
            setValidationError('Você deve ter pelo menos 12 anos para se cadastrar.');
            return false;
        }

        setValidationError('');
        return true;
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        setValidationError('');
    };

    const nextStep = async(step) => {
        if (step === 1) {
            if (!validateStep1()) {
                return;
            }
            const emailExists = await checkEmail(formData.email);
            if (emailExists) {
                setValidationError("Este e-mail já está cadastrado.");
                return;
            }
        }
        if (step === 2) {
            if (!validateStep2()) {
                return;
            }
            const usernameExists = await checkUsername(formData.username);
            if (usernameExists) {
                setValidationError("Este nome de usuário já está em uso.");
                return;
            }
        }
        setCurrentStep(currentStep + 1);
    };

    const handleSubmit = async(e) =>{
        e.preventDefault();

        const user_data = {
            'email': formData.email,
            'senha': formData.senha,
            'nome_completo': formData.nome_completo,
            'username': formData.username,
            'nascimento': formData.data_nascimento 
        };
        try {
            await handleRegister(user_data);
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

    return(
        <div>
             {validationError && (
                <div className='error-message'>
                    {validationError}
                </div>
            )}
            {currentStep === 1 && (
                <form>
                    <div className="form-group">
                        <div>
                            <label>Email:</label>
                            <input type="email" name='email' value={formData.email} onChange={handleChange} placeholder="seu@email.com" required/>
                        </div>

                        <PasswordInput label='Senha:' name='senha' value={formData.senha} onChange={handleChange}placeholder="********" required/>
                        
                        <PasswordInput label='Confirme a Senha::' name='confirm_senha' value={formData.confirm_senha} onChange={handleChange}placeholder="********" required/>

                        <button type="button" className="btn submit-btn" onClick={() => nextStep(1)} disabled={isLoading}>{isLoading ? '...' : 'Próximo'}</button>
                    </div>
                </form>
            )}

            {currentStep === 2 && (
                <form>
                    <div className='form-group'>
                        <div>
                            <label>Nome Completo:</label>
                            <input type="text" name='nome_completo' value={formData.nome_completo} onChange={handleChange} required/>
                        </div>
                        <div>
                            <label>Nome de Usuário:</label>
                            <input type="text" name='username' value={formData.username} onChange={handleChange} required/>
                        </div>
                        <div>
                            <label>Data de Nascimento:</label>
                            <input type="date" name='data_nascimento' value={formData.data_nascimento} onChange={handleChange} required/>
                        </div>

                        <div className="button-group">
                            <button type="button" className="btn secondary" onClick={prevStep}>Voltar</button>

                            <button type="button" className="btn primary" onClick={() => nextStep(2)} disabled={isLoading}>{isLoading ? '...' : 'Próximo'}</button>
                        </div>
                    </div>
                </form>
            )}

            {currentStep === 3 && (
                <div className="confirmation-step">
                    <p className="subtitle">Revise seus dados e finalize o cadastro:</p>
                    <ul>
                        <li><strong>Email:</strong> {formData.email}</li>
                        <li><strong>Nome:</strong> {formData.nome_completo}</li>
                        <li><strong>Username:</strong> {formData.username}</li>
                        <li><strong>Nascimento:</strong> {formData.data_nascimento}</li>
                    </ul>

                    <div className="button-group">
                        <button type="button" className="btn secondary" onClick={prevStep}>Voltar</button>
                        
                        <button type="button" className="btn primary" onClick={handleSubmit} disabled={isLoading}>{isLoading ? '...' : 'Criar Conta'}</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RegisterForm;
