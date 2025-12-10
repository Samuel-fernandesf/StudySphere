// src/components/GoogleLoginButton.js
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '../../contexts/AuthContext';

const GoogleLoginButton = () => {
    const { googleLogin } = useAuthContext();

    const login = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: ({ code }) => googleLogin(code),
        onError: (error) => console.log('Login Google falhou:', error),
    });

    return (
    <button onClick={login} className="google-btn">
        <div className="google-icon-wrapper">
            <img className="google-icon" src="https://developers.google.com/identity/images/g-logo.png" alt="Google"/>
        </div>
      <p className="btn-text"><b>Entrar com Google</b></p>
    </button>
    );
};

export default GoogleLoginButton;