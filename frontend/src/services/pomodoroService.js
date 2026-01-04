import api from "../api/api";

export async function criarSessaoEstudo(subjectId, durationMinutes, notes = null) {
    try {
        const response = await api.post("/progress/study-sessions", {
            subject_id: subjectId,
            duration_minutes: durationMinutes,
            notes: notes
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao criar sessão de estudo:", error);
        throw error;
    }
}

export async function listarSessoesEstudo(startDate = null, endDate = null) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await api.get(`/progress/study-sessions?${params.toString()}`);
        return response.data.sessions || [];
    } catch (error) {
        console.error("Erro ao listar sessões de estudo:", error);
        throw error;
    }
}

export async function obterTempoPorMateria(startDate = null, endDate = null) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await api.get(`/progress/time-by-subject?${params.toString()}`);
        return response.data.time_by_subject || [];
    } catch (error) {
        console.error("Erro ao obter tempo por matéria:", error);
        throw error;
    }
}

export async function obterResumoProgresso() {
    try {
        const response = await api.get("/progress/summary");
        return response.data;
    } catch (error) {
        console.error("Erro ao obter resumo de progresso:", error);
        throw error;
    }
}
