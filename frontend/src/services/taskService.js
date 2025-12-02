import api from "../api/api";

export async function listarTarefas(subjectId = null, completed = null) {
  try {
    const params = {};
    if (subjectId !== null) params.subject_id = subjectId;
    // Garantir que subject_id seja tratado como string na URL, se for o caso
    if (typeof subjectId === 'number') params.subject_id = String(subjectId);
    if (completed !== null) params.completed = completed;
    
    const response = await api.get("/tasks", { params });
    return response.data.tasks;
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    throw error;
  }
}

export async function buscarTarefa(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.task;
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    throw error;
  }
}

export async function criarTarefa(taskData) {
  try {
    const response = await api.post("/tasks", taskData);
    return response.data.task;
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    throw error;
  }
}

export async function atualizarTarefa(taskId, taskData) {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data.task;
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw error;
  }
}

export async function deletarTarefa(taskId) {
  try {
    await api.delete(`/tasks/${taskId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    throw error;
  }
}

export async function alternarConclusaoTarefa(taskId) {
  try {
    const response = await api.post(`/tasks/${taskId}/toggle`);
    return response.data.task;
  } catch (error) {
    console.error("Erro ao alternar conclusão da tarefa:", error);
    throw error;
  }
}

export async function obterTarefasPorMateria() {
  try {
    const response = await api.get("/tasks/by-subject");
    return response.data.tasks_by_subject;
  } catch (error) {
    console.error("Erro ao obter tarefas por matéria:", error);
    throw error;
  }
}
