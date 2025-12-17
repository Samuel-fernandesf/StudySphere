import api from "../api/api";

// Upload de arquivo com subject_id e folder_id
export async function enviarArquivo(file, subjectId = null, folderId = null) {
  const fd = new FormData();
  fd.append("file", file);
  if (subjectId) {
    fd.append("subject_id", subjectId);
  }
  if (folderId) {
    fd.append("folder_id", folderId);
  }
  const res = await api.post("/files/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

// Listar arquivos com filtro por matéria e pasta
export async function listarArquivos(subjectId = null, folderId = null) {
  let params = [];
  if (subjectId) params.push(`subject_id=${subjectId}`);
  if (folderId) params.push(`folder_id=${folderId}`);
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  const res = await api.get(`/files${queryString}`);
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

// Mover arquivo para outra pasta/matéria
export async function moverArquivo(fileId, subjectId = null, folderId = null) {
  try {
    const res = await api.put(`/files/${fileId}/move`, {
      subject_id: subjectId,
      folder_id: folderId
    });
    return res.data;
  } catch (error) {
    console.error("Erro ao mover arquivo:", error);
    throw error;
  }
}

// Copiar arquivo para outra pasta/matéria
export async function copiarArquivo(fileId, subjectId = null, folderId = null) {
  try {
    const res = await api.post(`/files/${fileId}/copy`, {
      subject_id: subjectId,
      folder_id: folderId
    });
    return res.data;
  } catch (error) {
    console.error("Erro ao copiar arquivo:", error);
    throw error;
  }
}
