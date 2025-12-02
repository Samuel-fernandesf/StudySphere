import api from "../api/api";

export async function listarQuizzes() {
  const res = await api.get("/quizzes");
  return res.data;
}

export async function buscarQuiz(id) {
  const res = await api.get(`/quizzes/${id}`);
  return res.data;
}

export async function criarQuiz(quizData) {
  try {
    const response = await api.post("/quizzes", quizData);
    return response.data.quiz;
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    throw error;
  }
}

export async function atualizarQuiz(quizId, quizData) {
  try {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data.quiz;
  } catch (error) {
    console.error("Erro ao atualizar quiz:", error);
    throw error;
  }
}

export async function deletarQuiz(quizId) {
  try {
    await api.delete(`/quizzes/${quizId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar quiz:", error);
    throw error;
  }
}
