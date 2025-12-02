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

export async function deletarArquivo(fileId) {
  try {
    await api.delete(`/files/${fileId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    throw error;
  }
}

export async function baixarArquivo(fileId) {
  try {
    const res = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return res.data;
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    throw error;
  }
}
