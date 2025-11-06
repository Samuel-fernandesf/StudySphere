import api from "../api/api";

export async function listarQuizzes() {
  const res = await api.get("/quizzes");
  return res.data;
}

export async function buscarQuiz(id) {
  const res = await api.get(`/quizzes/${id}`);
  return res.data;
}
