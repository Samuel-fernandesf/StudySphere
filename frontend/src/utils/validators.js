export function emailValido(email) {
  return /\S+@\S+\.\S+/.test(email);
}
