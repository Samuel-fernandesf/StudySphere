import React, { createContext, useContext, useState } from "react";
import { logout } from "../services/authService";
// Guarda a informação de quem está logado e as funções entrar e sair

// Cria o objeto Contexto
const AuthContext = createContext();

// O provedor que irá gerenciar o estado
export function AuthProvider({ children }) {

  // Inicializa o estado lendo o LocalStorage
  const [usuario, setUsuario] = useState(() => localStorage.getItem("user_id"));
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(false);

  function entrar(id, token) {
    // Salva a persistencia da sessão no navegador
    localStorage.setItem("user_id", id);
    localStorage.setItem("access_token", token);

    // Atualiza o estado global do react
    setUsuario(id);
    setToken(token)
  }

  async function sair() {
    setLoading(true);

    try{

      await logout();
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
      setUsuario(null);
      setToken(null);
    }catch (error) {
        console.error("Erro durante o logout:", error);

        localStorage.removeItem("user_id");
        localStorage.removeItem("access_token");
        setUsuario(null);
        setToken(null);
    }finally {
        setLoading(false);
    }
  }

  return (
    // O value é o que todos os componentes terão acesso
    //O children se refere ao que esse contexto engloba no caso o App (Ver app.jsx)
    <AuthContext.Provider value={{ usuario, token, loading, entrar, sair }}>
      {children} 
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
