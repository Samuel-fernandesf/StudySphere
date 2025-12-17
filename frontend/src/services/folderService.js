import api from "../api/api";


export async function listarPastas(subjectId, parentId = null) {
  try {
    let url = `/folders?subject_id=${subjectId}`;
    if (parentId !== null) {
      url += `&parent_id=${parentId}`;
    }
    const response = await api.get(url);
    return response.data.folders || [];
  } catch (error) {
    console.error("Erro ao listar pastas:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}


export async function obterCaminhoPasta(folderId) {
  try {
    const response = await api.get(`/folders/${folderId}/path`);
    return response.data.path || [];
  } catch (error) {
    console.error("Erro ao obter caminho da pasta:", error);
    throw error;
  }
}


export async function criarPasta(subjectId, name, parentId = null, color = '#6366f1') {
  try {
    const response = await api.post("/folders", {
      subject_id: subjectId,
      name,
      parent_id: parentId,
      color
    });
    return response.data.folder;
  } catch (error) {
    console.error("Erro ao criar pasta:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}


export async function atualizarPasta(folderId, data) {
  try {
    const response = await api.put(`/folders/${folderId}`, data);
    return response.data.folder;
  } catch (error) {
    console.error("Erro ao atualizar pasta:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}


export async function deletarPasta(folderId) {
  try {
    await api.delete(`/folders/${folderId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar pasta:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}


export async function obterPasta(folderId) {
  try {
    const response = await api.get(`/folders/${folderId}`);
    return response.data.folder;
  } catch (error) {
    console.error("Erro ao obter pasta:", error);
    throw error;
  }
}
