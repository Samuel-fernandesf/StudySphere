import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { confirmEmail } from "../../services/authService";
import logo from '../../assets/logo.png';
import './AuthScreen.css';

function ConfirmEmailScreen(){
    //Hook para pegar o token da url
    const {token} = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('Verificando token de confirmação...');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!token){
        setStatus('Token não encontrado na URL. Verifique o link do e-mail.');
        setIsError(true);
        return;
        }

        const confirmAccount = async () => {
            try{
                //Chamando o serviço para enviar o email ao backend
                const result = await confirmEmail(token);
                
                setStatus(result.message || 'E-mail confirmado com sucesso!');
                setIsError(false);
                
                setTimeout(() => {
                navigate('/', { state: { successMessage: 'Conta ativada. Faça seu login.' } });
                }, 6000);

            }catch (error){
                setStatus(error.message);
                setIsError(true);
            }
        }; 
        confirmAccount();
    }, [token, navigate]);

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
                    <h2 style={{marginBottom:'1rem'}}>Confirmação de E-mail</h2>
                    
                    <p className={isError === true ? 'error-message' : 'success-message'}>
                        {status}
                    </p>
                
                    {isError && (
                        <div className='form-group'>
                            <p>O token pode ter expirado ou foi usado. Por favor, tente:</p>
                            <Link to="/">
                                <button style={{marginTop:'2rem', fontSize:''}} className="btn submit-btn">
                                    Solicitar novo link.
                                </button>
                            </Link>
                        </div>
                    )}
                
                    {!isError && status === 'Verificando token de confirmação...' && (
                        <p>Validando o token...</p>
                    )}
                </div>
            </div>
        </div>
      );    
}
export default ConfirmEmailScreen;