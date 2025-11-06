import { useState, useEffect } from "react";

// Hook simples para estado de autenticação (baseado em localStorage)
export default function useAuth() {
  const [usuarioId, setUsuarioId] = useState(() => {
    return localStorage.getItem("user_id") || null;
  });

  useEffect(() => {
    // exemplo: escutar mudanças externas
    const handler = () => setUsuarioId(localStorage.getItem("user_id"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  function salvarSessao(id, token) {
    localStorage.setItem("user_id", id);
    localStorage.setItem("access_token", token);
    setUsuarioId(id);
  }

  function logout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("access_token");
    setUsuarioId(null);
  }

  return { usuarioId, salvarSessao, logout };
}
