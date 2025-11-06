import api from "../api/api";

// Serviço simples de arquivos (upload, listar)
export async function enviarArquivo(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/files/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function listarArquivos() {
  const res = await api.get("/files");
  return res.data;
}
