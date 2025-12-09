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

export async function deletarQuiz(id) {
  const res = await api.delete(`/quizzes/${id}`);
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

export async function obterEstatisticas() {
  const res = await api.get("/quizzes/estatisticas");
  return res.data;
}

export async function obterRanking(quizId) {
  const res = await api.get(`/quizzes/${quizId}/ranking`);
  return res.data;
}
