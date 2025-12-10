import api from "../api/api";

export async function listarMaterias() {
  try {
    const response = await api.get("/subjects");
    return response.data.subjects || [];
  } catch (error) {
    console.error("Erro ao listar matérias:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function criarMateria(subjectData) {
  try {
    const response = await api.post("/subjects", subjectData);
    return response.data.subject;
  } catch (error) {
    console.error("Erro ao criar matéria:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function atualizarMateria(subjectId, subjectData) {
  try {
    const response = await api.put(`/subjects/${subjectId}`, subjectData);
    return response.data.subject;
  } catch (error) {
    console.error("Erro ao atualizar matéria:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function deletarMateria(subjectId) {
  try {
    await api.delete(`/subjects/${subjectId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar matéria:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}
