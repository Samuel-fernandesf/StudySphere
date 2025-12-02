import api from "../api/api";

export async function obterResumoProgresso() {
  try {
    const response = await api.get("/progress/summary");
    return response.data;
  } catch (error) {
    console.error("Erro ao obter resumo de progresso:", error);
    throw error;
  }
}

export async function obterSessoesEstudo(startDate = null, endDate = null) {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get("/progress/study-sessions", { params });
    return response.data.sessions;
  } catch (error) {
    console.error("Erro ao obter sessões de estudo:", error);
    throw error;
  }
}

export async function criarSessaoEstudo(sessionData) {
  try {
    const response = await api.post("/progress/study-sessions", sessionData);
    return response.data.session;
  } catch (error) {
    console.error("Erro ao criar sessão de estudo:", error);
    throw error;
  }
}

export async function obterTempoPorMateria(startDate = null, endDate = null) {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get("/progress/time-by-subject", { params });
    return response.data.time_by_subject;
  } catch (error) {
    console.error("Erro ao obter tempo por matéria:", error);
    throw error;
  }
}

export async function obterTempoPorDia(days = 7) {
  try {
    const response = await api.get("/progress/time-by-day", { params: { days } });
    return response.data.time_by_day;
  } catch (error) {
    console.error("Erro ao obter tempo por dia:", error);
    throw error;
  }
}

export async function obterSequenciaAtual() {
  try {
    const response = await api.get("/progress/streak");
    return response.data.current_streak;
  } catch (error) {
    console.error("Erro ao obter sequência:", error);
    throw error;
  }
}

export async function obterMetaSemanal(goalHours = 20) {
  try {
    const response = await api.get("/progress/weekly-goal", { params: { goal_hours: goalHours } });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter meta semanal:", error);
    throw error;
  }
}
