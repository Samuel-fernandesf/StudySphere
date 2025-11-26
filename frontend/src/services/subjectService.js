import api from "../api/api";

export async function listarMaterias() {
  try {
    const response = await api.get("/subjects");
    return response.data.subjects || [];
  } catch (error) {
    console.error("Erro ao listar matérias:", error);
    throw error;
  }
}

export async function criarMateria(subjectData) {
  try {
    const response = await api.post("/subjects", subjectData);
    return response.data.subject;
  } catch (error) {
    console.error("Erro ao criar matéria:", error);
    throw error;
  }
}

export async function atualizarMateria(subjectId, subjectData) {
  try {
    const response = await api.put(`/subjects/${subjectId}`, subjectData);
    return response.data.subject;
  } catch (error) {
    console.error("Erro ao atualizar matéria:", error);
    throw error;
  }
}

export async function deletarMateria(subjectId) {
  try {
    await api.delete(`/subjects/${subjectId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar matéria:", error);
    throw error;
  }
}
