import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarQuiz, submeterQuiz } from "../../services/quizService";
import Sidebar from "../../components/layout/Sidebar";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import "./QuizPlay.css";

function shuffleArray(array) {
  const copy = [...(array || [])];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [tempoInicio, setTempoInicio] = useState(null);
  const [finalizado, setFinalizado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    carregarQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarQuiz() {
    try {
      setLoading(true);
      const data = await buscarQuiz(id);

      const quizComAlternativasEmbaralhadas = {
        ...data,
        questoes: data.questoes.map((q) => ({
          ...q,
          alternativas: shuffleArray(q.alternativas),
        })),
      };

      setQuiz(quizComAlternativasEmbaralhadas);
      setTempoInicio(Date.now());
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      alert("Erro ao carregar questionário");
      navigate("/quiz");
    } finally {
      setLoading(false);
    }
  }

  function selecionarResposta(questaoId, alternativaId) {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: alternativaId,
    }));
  }

  function proximaQuestao() {
    if (questaoAtual < quiz.questoes.length - 1) {
      setQuestaoAtual((prev) => prev + 1);
    }
  }

  function questaoAnterior() {
    if (questaoAtual > 0) {
      setQuestaoAtual((prev) => prev - 1);
    }
  }

  async function finalizar() {
    if (Object.keys(respostas).length < quiz.questoes.length) {
      if (
        !window.confirm(
          "Você não respondeu todas as questões. Deseja finalizar mesmo assim?"
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000);

      const respostasFormatadas = quiz.questoes.map((q) => ({
        questao_id: q.id,
        alternativa_id: respostas[q.id] || null,
      }));

      const resultadoApi = await submeterQuiz(
        id,
        respostasFormatadas,
        tempoGasto
      );
      setResultado(resultadoApi);
      setFinalizado(true);
    } catch (error) {
      console.error("Erro ao submeter quiz:", error);
      alert("Erro ao submeter questionário");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="quiz-play-root loading-root">
          <div className="loading-text">Carregando questionário...</div>
        </div>
      </>
    );
  }

  if (!quiz) {
    return null;
  }

  if (finalizado && resultado) {
    return (
      <>
        <Sidebar />
        <div className="quiz-play-root">
          <div className="quiz-top-bar">
            <button
              className="btn-outline-dark small"
              onClick={() => navigate("/quiz")}
            >
              <ArrowLeft size={16} />
              Voltar aos Questionários
            </button>
          </div>

          <div className="quiz-result-card">
            <div
              className={
                resultado.percentual >= 70
                  ? "result-icon result-icon-success"
                  : "result-icon result-icon-fail"
              }
            >
              {resultado.percentual >= 70 ? (
                <CheckCircle size={40} color="#16a34a" />
              ) : (
                <XCircle size={40} color="#dc2626" />
              )}
            </div>

            <h1 className="result-title">
              {resultado.percentual >= 70 ? "Parabéns!" : "Continue Tentando!"}
            </h1>

            <p className="result-subtitle">
              Você completou o questionário "{quiz.titulo}"
            </p>

            <div className="result-grid">
              <div>
                <div className="result-label">Pontuação</div>
                <div className="result-value">
                  {resultado.pontuacao}/{resultado.pontuacao_maxima}
                </div>
              </div>

              <div>
                <div className="result-label">Percentual</div>
                <div
                  className={
                    resultado.percentual >= 70
                      ? "result-value result-value-success"
                      : "result-value result-value-fail"
                  }
                >
                  {resultado.percentual}%
                </div>
              </div>

              <div>
                <div className="result-label">Tempo</div>
                <div className="result-value">
                  {Math.floor(
                    (resultado.tentativa?.tempo_gasto || 0) / 60
                  )}
                  :
                  {String(
                    Math.floor(
                      (resultado.tentativa?.tempo_gasto || 0) % 60
                    )
                  ).padStart(2, "0")}
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button
                onClick={() => navigate("/quiz")}
                className="btn-primary-dark"
              >
                Voltar aos Questionários
              </button>

              <button
                onClick={() => window.location.reload()}
                className="btn-outline-dark"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const questao = quiz.questoes[questaoAtual];
  const progresso = ((questaoAtual + 1) / quiz.questoes.length) * 100;

  return (
    <>
      <Sidebar />
      <div className="quiz-play-root">
        <div className="quiz-play-container">
          {/* Top bar com voltar */}
          <div className="quiz-top-bar">
            <button
              className="btn-outline-dark small"
              onClick={() => navigate("/quiz")}
            >
              <ArrowLeft size={16} />
              Voltar aos Questionários
            </button>
          </div>

          {/* Header */}
          <div className="quiz-header-card">
            <div className="quiz-header-top">
              <h2>{quiz.titulo}</h2>
              <div className="quiz-timer">
                <Clock size={18} />
                <span>
                  {Math.floor((Date.now() - tempoInicio) / 60000)}:
                  {String(
                    Math.floor(
                      ((Date.now() - tempoInicio) % 60000) / 1000
                    )
                  ).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <div className="quiz-progress-text">
              Questão {questaoAtual + 1} de {quiz.questoes.length}
            </div>
          </div>

          {/* Questão */}
          <div className="quiz-question-card">
            <div className="quiz-question-text">{questao.enunciado}</div>

            <div className="quiz-alternatives">
              {questao.alternativas &&
                questao.alternativas.map((alternativa) => {
                  const selecionada =
                    respostas[questao.id] === alternativa.id;
                  return (
                    <button
                      key={alternativa.id}
                      onClick={() =>
                        selecionarResposta(questao.id, alternativa.id)
                      }
                      className={
                        selecionada ? "alt-button selected" : "alt-button"
                      }
                    >
                      {alternativa.texto}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Navegação */}
          <div className="quiz-nav-row">
            <button
              onClick={questaoAnterior}
              disabled={questaoAtual === 0}
              className={
                questaoAtual === 0 ? "btn-nav disabled" : "btn-nav"
              }
            >
              <ArrowLeft size={18} />
              Anterior
            </button>

            {questaoAtual === quiz.questoes.length - 1 ? (
              <button
                onClick={finalizar}
                disabled={submitting}
                className={
                  submitting ? "btn-finish disabled" : "btn-finish"
                }
              >
                {submitting ? "Finalizando..." : "Finalizar"}
              </button>
            ) : (
              <button onClick={proximaQuestao} className="btn-next">
                Próxima
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          {/* Mapa de Questões */}
          <div className="quiz-map-card">
            <div className="quiz-map-title">Navegação Rápida</div>
            <div className="quiz-map-grid">
              {quiz.questoes.map((q, idx) => {
                const respondida = !!respostas[q.id];
                const ativa = idx === questaoAtual;
                return (
                  <button
                    key={q.id}
                    onClick={() => setQuestaoAtual(idx)}
                    className={[
                      "quiz-map-item",
                      respondida ? "answered" : "",
                      ativa ? "active" : "",
                    ].join(" ")}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
