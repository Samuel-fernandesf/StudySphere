import { useAuthContext } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

function LogoutButton() {
    const { sair, loading } = useAuthContext();

    return (
        <a 
            href="#"
            className="navLink logout-button" 
            onClick={(e) => {
                e.preventDefault();
                sair();
            }}
            style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                pointerEvents: loading ? 'none' : 'auto'
            }}
        >
            <LogOut size={20} />
            <span>{loading ? 'Saindo...' : 'Sair'}</span>
        </a>
    );
}

export default LogoutButton;
