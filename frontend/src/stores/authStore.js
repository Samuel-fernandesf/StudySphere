// Store simples: apenas helpers para localStorage
export function obterUsuario() {
  return localStorage.getItem("user_id");
}
export function salvarUsuario(id) {
  localStorage.setItem("user_id", id);
}
export function limparSessao() {
  localStorage.removeItem("user_id");
  localStorage.removeItem("access_token");
}
