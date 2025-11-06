import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => localStorage.getItem("user_id"));

  function entrar(id, token) {
    localStorage.setItem("user_id", id);
    localStorage.setItem("access_token", token);
    setUsuario(id);
  }

  function sair() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("access_token");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
