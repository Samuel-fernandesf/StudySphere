import api from "../api/api";

// Adicionar subject_id no upload e listar
export async function enviarArquivo(file, subjectId = null) {
  const fd = new FormData();
  fd.append("file", file);
  if (subjectId) {
    fd.append("subject_id", subjectId);
  }
  const res = await api.post("/files/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function listarArquivos(subjectId = null) {
  const params = subjectId ? `?subject_id=${subjectId}` : '';
  const res = await api.get(`/files${params}`);
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
    
    const contentDisposition = res.headers['content-disposition'];
    let fileName = 'arquivo';
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=(?:(['"]).*?\1|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[0]) {
        fileName = fileNameMatch[0].split('=')[1].replace(/['"]/g, '');
      }
    }
    
    const blob = new Blob([res.data], { type: res.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    throw error;
  }
}
