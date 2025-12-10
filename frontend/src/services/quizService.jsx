import api from "../api/api";

export async function listarQuizzes(filtros = {}) {
  const params = {};
  if (filtros.materia) params.materia = filtros.materia;
  if (filtros.dificuldade) params.dificuldade = filtros.dificuldade;
  
  const res = await api.get("/quizzes", { params });
  return res.data;
}

export async function buscarQuiz(id) {
  const res = await api.get(`/quizzes/${id}`);
  return res.data;
}

export async function createQuiz(quizData) {
  const res = await api.post("/quizzes", quizData);
  return res.data;
}

export async function atualizarQuiz(id, quizData) {
  const res = await api.put(`/quizzes/${id}`, quizData);
  return res.data;
}


export async function submeterQuiz(id, respostas, tempoGasto) {
  const res = await api.post(`/quizzes/${id}/submit`, {
    respostas,
    tempo_gasto: tempoGasto
  });
  return res.data;
}

export async function listarTentativas() {
  const res = await api.get("/quizzes/tentativas");
  return res.data;
}


export async function obterRanking(quizId) {
  const res = await api.get(`/quizzes/${quizId}/ranking`);
  return res.data;
}

export async function gerarQuizAutomatico({ titulo, materia, dificuldade, num_questoes }) {
  try {
    const response = await api.post("/quizzes/auto-generate", {
      titulo,
      materia,
      dificuldade,
      num_questoes,
    });
    return response.data; // { questoes: [...] }
  } catch (error) {
    console.error("Erro ao gerar quiz automaticamente:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function obterEstatisticas() {
  const response = await api.get("/quizzes/estatisticas");
  return response.data;
}

export async function deletarQuiz(quizId) {
  try {
    await api.delete(`/quizzes/${quizId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar quiz:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}
