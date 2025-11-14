import { useAuthContext } from '../../contexts/AuthContext';

function LogoutButton() {
    const { sair, loading } = useAuthContext();

    return (
        <button 
            onClick={sair} 
            disabled={loading}>
            {loading ? 'Saindo...' : 'Sair'}
        </button>
    );
}

export default LogoutButton;