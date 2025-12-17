import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, //cookies enviados automaticamente
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/check-email',
  '/auth/check-username',
  '/auth/google-login',
  '/auth/confirm-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-confirmation'
];

// Interceptor de request para adicionar token
api.interceptors.request.use((config) => {
  //Verifica se a URL atual é uma rota de autenticação
  const isAuthRoute = AUTH_ROUTES.some(route => config.url.includes(route));

  //Se for rota de autenticação, o token não deve ser enviado.
  if (isAuthRoute) {
    return config;
  }

  // 3. Para todas as outras rotas, anexa o token se ele existir.
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

let isRefreshing = false; // controla se já tem um refresh token em andamento, evitando mandar várias requisições ao mesmo tempo
let failedQueue = []; // enquanto um refresh acontece, todas as outras requisições que falham são salvas aqui, e chamadas depois.

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Não tenta refresh para rotas de autenticação
    const isAuthRoute = AUTH_ROUTES.some(route => originalRequest.url.includes(route));
    if (isAuthRoute && error.response?.status === 401) {
      return Promise.reject(error);
    }

    // Ignora erros que não são 401 (Não Autorizado)
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    };

    // Evita loop infinito de refresh
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    //Se já tem um refresh em andamento, isso evitar chamar um refresh várias vezes ao mesmo tempo.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    //Execução do Refresh Token
    isRefreshing = true;
    try {
      const response = await axios.post(API_BASE + "/auth/refresh", {}, { withCredentials: true });
      const { access_token } = response.data;

      if (!access_token) throw new Error("Token não retornado.");

      localStorage.setItem("access_token", access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      processQueue(null, access_token);

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      // opcional: chamar método de logout global
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
