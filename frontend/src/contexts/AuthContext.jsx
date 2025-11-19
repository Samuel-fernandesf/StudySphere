import React, { createContext, useContext, useEffect, useState } from "react";
import { logout, getMe } from "../services/authService";
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
    setToken(token);
    }

  async function sair() {
    setLoading(true);

    try{
      await logout();
    }catch (error) {
        console.error("Erro durante o logout:", error);
    }finally {
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
      setUsuario(null);
      setLoading(false);
      window.location.href = "/";
    }
  }

  useEffect(() => {
    const verificarSessao = async () => {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");

      if (!token || !userId) {
        setUsuario(null);
        setToken(null);
        setLoading(false);
        // Não faz a chamada de /me. O interceptor NÃO será acionado.
        return;
      }

      try {
          const data = await getMe();
          setUsuario(data.user_id);
          // Se chegou aqui, o token foi renovado ou ainda é válido
      } catch (error) {
          // Se falhou tudo, limpa o estado
          setUsuario(null);
          setToken(null);
          localStorage.removeItem("user_id");
          localStorage.removeItem("access_token");
      } finally {
          setLoading(false);
      }
      return;
    }

    verificarSessao();
  }, []);

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
