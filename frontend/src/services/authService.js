import api from "../api/api";

// Serviços relacionados à autenticação
export async function login(email, senha) {
  const res = await api.post("/auth/login", { email, senha });
  return res.data;
}

export async function register(dados) {
  const res = await api.post("/auth/register", dados);
  return res.data;
}
