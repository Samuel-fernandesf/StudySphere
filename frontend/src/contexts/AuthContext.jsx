import React, { createContext, useContext, useEffect, useState } from "react";
import { logout, getMe, loginWithGoogle } from "../services/authService";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(() => localStorage.getItem("user_id"));
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchUserDetails() {
    try {
      const data = await getMe();
      setUserDetails(data.user_details);
      return data.user_details;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setUserDetails(null);
      return null;
    }
  }

  async function entrar(id, token, user_name) {
    localStorage.setItem("user_id", id);
    localStorage.setItem("access_token", token);
    localStorage.setItem('user_name', user_name)

    setUsuario(id);
    setToken(token);

    await fetchUserDetails();
  }

  async function googleLogin(authCode) {
    try {
      const data = await loginWithGoogle(authCode);

      const userId = data.user_id || data.user?.id || null;
      const access = data.access_token || data.raw?.access_token || null;
      const userName = data.user_name || data.user?.username || data.user?.name || null;

      if (!access) {
        throw new Error("Access token não retornado pelo backend.");
      }

      entrar(userId, access, userName);
      navigate("/dashboard");
      return data;

    } catch (err) {
      console.error("Erro no login Google:", err);
      throw err;
    }
  }

  async function sair() {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Erro durante o logout:", error);
    } finally {
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
      setUsuario(null);
      setUserDetails(null);
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
        setUserDetails(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getMe();
        setUsuario(data.user_id);
        setUserDetails(data.user_details);
      } catch (error) {
        setUsuario(null);
        setToken(null);
        setUserDetails(null);
        localStorage.removeItem("user_id");
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    }

    verificarSessao();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, userDetails, loading, entrar, googleLogin, sair, fetchUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}