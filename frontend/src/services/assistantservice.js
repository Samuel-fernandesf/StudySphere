import api from "../api/api";

export async function fazerPergunta(pergunta, materia = "", conversationId = null) {
  try {
    const payload = {
      question: pergunta,
      subject: materia
    };

    if (conversationId) {
      payload.conversation_id = conversationId;
    }

    const response = await api.post("/assistant/ask", payload);
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer pergunta:", error);
    throw error;
  }
}

export async function listarConversas() {
  try {
    const response = await api.get("/assistant/conversations");
    return response.data.conversations || [];
  } catch (error) {
    console.error("Erro ao listar conversas:", error);
    throw error;
  }
}

export async function criarConversa(materia = null) {
  try {
    const payload = { title: "Nova Conversa" };
    if (materia) {
      payload.subject = materia;
    }
    const response = await api.post("/assistant/conversations", payload);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar conversa:", error);
    throw error;
  }
}

export async function carregarConversa(conversationId) {
  try {
    const response = await api.get(`/assistant/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar conversa:", error);
    throw error;
  }
}

export async function deletarConversa(conversationId) {
  try {
    await api.delete(`/assistant/conversations/${conversationId}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar conversa:", error);
    throw error;
  }
}

export async function atualizarTituloConversa(conversationId, titulo) {
  try {
    const response = await api.patch(`/assistant/conversations/${conversationId}/title`, {
      title: titulo
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar título:", error);
    throw error;
  }
}

export async function pesquisarConteudo(topico) {
  try {
    const response = await api.post("/assistant/research", {
      topic: topico
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao pesquisar conteúdo:", error);
    throw error;
  }
}

export async function limparHistorico() {
  try {
    await api.delete("/assistant/clear-history");
    return true;
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    throw error;
  }
}
