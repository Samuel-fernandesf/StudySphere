import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useModal } from "../../contexts/ModalContext";
import { fazerPergunta } from "../../services/assistantservice";
import "./EducationalAssistant.css";
import { NotebookPen, Trash2 } from "lucide-react";

const EducationalAssistant = ({
  materia = "Geral",
  onNovaConversa,
  sugestao,
  conversationId,
  initialMessages = [],
  onConversationCreated
}) => {
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const messagesEndRef = useRef(null);

  const { showAlert, showConfirm } = useModal();

  // Load initial messages when conversation changes
  useEffect(() => {
    setCurrentConversationId(conversationId);

    if (initialMessages && initialMessages.length > 0) {
      const formattedMessages = initialMessages.map((msg, idx) => ({
        id: msg.id || idx,
        tipo: msg.role === 'user' ? 'usuario' : 'assistente',
        conteudo: msg.content,
        citacoes: msg.citations?.map((url, cidx) => ({
          name: `Fonte ${cidx + 1}`,
          url
        })) || [],
        timestamp: new Date(msg.created_at || Date.now())
      }));
      setMensagens(formattedMessages);
    } else {
      setMensagens([]);
    }
  }, [conversationId, initialMessages]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Aplicar sugestão inicial
  useEffect(() => {
    if (sugestao) setPergunta(sugestao);
  }, [sugestao]);

  const handlePergunta = async (e) => {
    if (e) e.preventDefault();

    if (!pergunta.trim()) {
      setErro("Por favor, digite uma pergunta.");
      return;
    }

    setCarregando(true);
    setErro(null);

    const novaPergunta = {
      id: Date.now(),
      tipo: "usuario",
      conteudo: pergunta,
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, novaPergunta]);

    try {
      const resultado = await fazerPergunta(pergunta, materia, currentConversationId);

      // Update conversation ID if new conversation was created
      if (resultado.conversation_id && !currentConversationId) {
        setCurrentConversationId(resultado.conversation_id);
        if (onConversationCreated) {
          onConversationCreated(resultado.conversation_id);
        }
      }

      const citacoes = (resultado.citations || []).map((url, idx) => ({
        name: `Fonte ${idx + 1}`,
        url,
      }));

      const novaResposta = {
        id: Date.now() + 1,
        tipo: "assistente",
        conteudo: resultado.answer || "",
        citacoes,
        timestamp: new Date(),
      };

      setMensagens((prev) => [...prev, novaResposta]);

      if (onNovaConversa) onNovaConversa(pergunta);
      setPergunta("");
    } catch (error) {
      console.error("Erro completo:", error);
      const msgErro =
        error.response?.data?.error || "Não foi possível obter a resposta.";

      showAlert(msgErro, "error", "Erro na Comunicação");
      setErro(msgErro);
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparHistorico = async () => {
    const confirmado = await showConfirm(
      "Tem certeza que deseja limpar as mensagens desta conversa?",
      "Limpar Mensagens",
      "warning"
    );

    if (!confirmado) return;

    setMensagens([]);
    setErro(null);
    await showAlert("Mensagens limpas com sucesso!", "success", "Pronto");
  };

  return (
    <div className="assistant-container">
      <div className="assistant-header">
        <h2>
          <NotebookPen size={20} /> Assistente de {materia}
        </h2>
        <button
          className="btn-limpar"
          onClick={handleLimparHistorico}
          title="Limpar histórico"
          disabled={mensagens.length === 0}
        >
          <Trash2 />
        </button>
      </div>

      {erro && <div className="error-banner">⚠️ {erro}</div>}

      <div className="messages-container">
        {mensagens.length === 0 && (
          <div className="welcome-message">
            <h3>Olá!</h3>
            <p>
              Pergunte-me qualquer coisa sobre <strong>{materia}</strong>.
            </p>
          </div>
        )}

        {mensagens.map((msg) => (
          <div key={msg.id} className={`message message-${msg.tipo}`}>
            <div className="message-content markdown-body">
              {msg.tipo === "assistente" ? (
                <ReactMarkdown
                  children={msg.conteudo}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                />
              ) : (
                <p>{msg.conteudo}</p>
              )}

              {msg.citacoes && msg.citacoes.length > 0 && (
                <div className="citations">
                  <strong>📖 Fontes:</strong>
                  <ul>
                    {msg.citacoes.map((cit, idx) => (
                      <li key={idx}>
                        <a
                          href={cit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cit.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <small className="message-time">
              {msg.timestamp.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
        ))}

        {carregando && (
          <div className="message message-assistente">
            <div className="typing-indicator">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handlePergunta} className="input-form">
        <textarea
          value={pergunta}
          onChange={(e) => {
            setPergunta(e.target.value);
            setErro(null);
          }}
          placeholder="Digite sua dúvida aqui..."
          disabled={carregando}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePergunta(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={carregando || !pergunta.trim()}
          className="btn-enviar"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default EducationalAssistant;