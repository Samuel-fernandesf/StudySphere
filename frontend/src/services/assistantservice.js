import api from "../api/api";

export async function fazerPergunta(pergunta, materia = "") {
  try {
    const response = await api.post("/assistant/ask", {
      question: pergunta,
      subject: materia
    });
    
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer pergunta:", error);
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
