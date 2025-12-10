import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useModal } from "../../contexts/ModalContext";
import { fazerPergunta, limparHistorico } from "../../services/assistantservice";
import "./EducationalAssistant.css";
import { NotebookPen, Trash2 } from "lucide-react";

const STORAGE_KEY_PREFIX = "assistant_chat_";

const EducationalAssistant = ({ materia = "Geral", onNovaConversa, sugestao }) => {
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const messagesEndRef = useRef(null);

  const { showAlert, showConfirm } = useModal();

  const storageKey = `${STORAGE_KEY_PREFIX}${materia}`;

  // Carrega histórico ao montar / trocar matéria
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const msgs = parsed.map((m) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMensagens(msgs);
      } else {
        setMensagens([]);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico do assistente:", e);
      setMensagens([]);
    }
  }, [storageKey]);

  // Salva histórico sempre que mensagens mudam
  useEffect(() => {
    try {
      const serializable = mensagens.map((m) => ({
        ...m,
        timestamp: m.timestamp?.toISOString?.() || new Date().toISOString(),
      }));
      localStorage.setItem(storageKey, JSON.stringify(serializable));
    } catch (e) {
      console.error("Erro ao salvar histórico do assistente:", e);
    }
  }, [mensagens, storageKey]);

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
      const resultado = await fazerPergunta(pergunta, materia);
      // resultado: { answer, citations: ["url1", "url2", ...], sources: [] }

      // mapeia citações: resultado.citations é um array de strings (URLs)
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
      "Tem certeza que deseja apagar todo o histórico dessa conversa? Isso não pode ser desfeito.",
      "Limpar Histórico",
      "warning"
    );

    if (!confirmado) return;

    try {
      await limparHistorico();
    } catch (error) {
      console.error("Erro ao limpar histórico no backend:", error);
    }

    setMensagens([]);
    setErro(null);
    localStorage.removeItem(storageKey);
    await showAlert("Histórico limpo com sucesso!", "success", "Pronto");
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