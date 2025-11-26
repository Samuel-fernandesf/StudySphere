import api from "../api/api";

export async function listarEventos(startDate = null, endDate = null) {
  try {
    let url = "/events";
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.events || [];
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    throw error;
  }
}

export async function criarEvento(eventData) {
  try {
    const response = await api.post("/events", eventData);
    return response.data.event;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
}

export async function atualizarEvento(eventId, eventData) {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data.event;
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
}

export async function deletarEvento(eventId) {
  try {
    await api.delete(`/events/${eventId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    throw error;
  }
}
