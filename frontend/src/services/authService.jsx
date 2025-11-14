import api from "../api/api";

function extractMessageFromAxiosError(err) {
  if (!err) return 'Erro desconhecido.';
  if (err.message && typeof err.message === 'string' && !err.response) {
    return err.message;
  }

  const data = err.response?.data;

  return data?.message
    || data?.mensagem
    || data?.erro
    || data?.error
    || data?.msg
    || (typeof data === 'string' ? data : null)
    || err.message
    || 'Erro no servidor';
}

// Serviços relacionados à autenticação
export async function login(email, senha) {
  try {
    const res = await api.post("/auth/login", { email, senha });
    return res.data;
  } catch (err) {
    const msg = extractMessageFromAxiosError(err);
    throw new Error(msg);
  }
}

export async function logout() {
  try {
    const res = await api.post('/auth/logout');
    return res.data;
  } catch (err) {
    const msg = extractMessageFromAxiosError(err);
    throw new Error(msg);
  }
}

export async function checkEmail(email) {
    const { data } = await api.get("/auth/check-email", {
        params: { email }
    });
    return data.exists;
}

export async function checkUsername(username) {
    const { data } = await api.get("/auth/check-username", {
        params: { username }
    });
    return data.exists;
}

export async function register(dados) {
  try {
    const res = await api.post("/auth/register", dados);
    return res.data;
  } catch (err) {
    const msg = extractMessageFromAxiosError(err);
    throw new Error(msg);
  }
}
