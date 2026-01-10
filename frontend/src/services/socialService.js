import api from "../api/api";



export async function listarPosts(page = 1, perPage = 20, subjectId = null) {
    try {
        const params = new URLSearchParams({ page, per_page: perPage });
        if (subjectId) params.append('subject_id', subjectId);

        const response = await api.get(`/community/posts?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao listar posts:", error);
        throw error;
    }
}

export async function criarPost(content, subjectId = null) {
    try {
        const payload = { content };
        if (subjectId) payload.subject_id = subjectId;

        const response = await api.post("/community/posts", payload);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar post:", error);
        throw error;
    }
}

export async function deletarPost(postId) {
    try {
        await api.delete(`/community/posts/${postId}`);
        return true;
    } catch (error) {
        console.error("Erro ao deletar post:", error);
        throw error;
    }
}



export async function curtirPost(postId) {
    try {
        const response = await api.post(`/community/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error("Erro ao curtir post:", error);
        throw error;
    }
}



export async function listarComentarios(postId) {
    try {
        const response = await api.get(`/community/posts/${postId}/comments`);
        return response.data;
    } catch (error) {
        console.error("Erro ao listar comentários:", error);
        throw error;
    }
}

export async function adicionarComentario(postId, content) {
    try {
        const response = await api.post(`/community/posts/${postId}/comments`, { content });
        return response.data;
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        throw error;
    }
}

export async function deletarComentario(commentId) {
    try {
        await api.delete(`/community/comments/${commentId}`);
        return true;
    } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        throw error;
    }
}



export async function obterRanking(limit = 50) {
    try {
        const response = await api.get(`/community/ranking?limit=${limit}`);
        return response.data.ranking || [];
    } catch (error) {
        console.error("Erro ao obter ranking:", error);
        throw error;
    }
}

export async function obterMeuRanking() {
    try {
        const response = await api.get("/community/ranking/me");
        return response.data;
    } catch (error) {
        console.error("Erro ao obter meu ranking:", error);
        throw error;
    }
}
