import { useAuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute(){
    const {usuario} = useAuthContext();

    if(!usuario){
        // Se o usuário não estiver logado, redireciona para o login
        // replace impede o usuário de voltar para a página protegida com o botão "voltar"
        return <Navigate to='/' replace />;
    }

    // Se o usuário está logado, redireciona para o componente filho
    return <Outlet/>;
}
export default ProtectedRoute;
