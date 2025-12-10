import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarQuizzes,
  obterEstatisticas,
  deletarQuiz,
} from "../../services/quizService";
import Sidebar from "../../components/layout/Sidebar";
import {
  FileQuestion,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  Trash2,
} from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import "./QuizList.css";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("questionarios");
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [quizzesData, statsData] = await Promise.all([
        listarQuizzes(),
        obterEstatisticas(),
      ]);
      setQuizzes(quizzesData || []);
      setEstatisticas(statsData || null);
    } catch (error) {
      console.error("Erro ao carregar dados:", error.response?.data || error);
      await showAlert(
        "Erro ao carregar questionários. Tente novamente.",
        "error",
        "Erro"
      );
    } finally {
      setLoading(false);
    }
  }

  const materias = ["Todas", ...new Set(quizzes.map((q) => q.materia))];
  const quizzesFiltrados =
    filtroMateria === "Todas"
      ? quizzes
      : quizzes.filter((q) => q.materia === filtroMateria);

  const getDificuldadeColor = (dificuldade) => {
    const colors = {
      Fácil: "#4ade80",
      Médio: "#fbbf24",
      Difícil: "#ef4444",
    };
    return colors[dificuldade] || "#94a3b8";
  };

  const getDificuldadeLabel = (dificuldade) => {
    const labels = {
      facil: "Fácil",
      medio: "Médio",
      dificil: "Difícil",
    };
    return labels[dificuldade] || dificuldade;
  };

  async function handleDeleteQuiz(id, titulo) {
    const confirmado = await showConfirm(
      `Tem certeza que deseja excluir o quiz "${titulo}"? Esta ação não pode ser desfeita.`,
      "Excluir quiz",
      "warning"
    );

    if (!confirmado) return;

    try {
      await deletarQuiz(id);
      await showAlert("Quiz excluído com sucesso.", "success", "Excluído");
      carregarDados();
    } catch (error) {
      console.error("Erro ao deletar quiz:", error.response?.data || error);
      await showAlert(
        error.response?.data?.message ||
          "Erro ao deletar quiz. Tente novamente.",
        "error",
        "Erro"
      );
    }
  }

  return (

      <div className="quiz-list-root">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-header-left">
            <div>
              <h1>Questionários e Ranking</h1>
              <p>Teste seus conhecimentos e compare com seus colegas</p>
            </div>
          </div>
        </div>

        {/* Estatísticas do Usuário */}
        {estatisticas && (
          <div className="quiz-stats">
            <div className="quiz-stat-card stat-yellow">
              <Trophy size={20} />
              <span>
                {(estatisticas.total_tentativas || 0) + " pontos"}
              </span>
            </div>
            <div className="quiz-stat-card stat-purple">
              <Award size={20} />
              <span>
                Nível {Math.floor((estatisticas.total_tentativas || 0) / 5) + 1}
              </span>
            </div>
            <div className="quiz-stat-card stat-blue">
              <Target size={20} />
              <span>{quizzesFiltrados.length} completos</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="quiz-tabs">
          <button
            onClick={() => setActiveTab("questionarios")}
            className={
              activeTab === "questionarios"
                ? "quiz-tab active"
                : "quiz-tab"
            }
          >
            <FileQuestion size={18} />
            Questionários
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={activeTab === "ranking" ? "quiz-tab active" : "quiz-tab"}
          >
            <Trophy size={18} />
            Ranking
          </button>
          <button
            onClick={() => setActiveTab("conquistas")}
            className={
              activeTab === "conquistas" ? "quiz-tab active" : "quiz-tab"
            }
          >
            <Award size={18} />
            Conquistas
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === "questionarios" && (
          <>
            {/* Filtros */}
            <div className="quiz-filters">
              <span>Filtros:</span>
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
              >
                {materias.map((materia) => (
                  <option key={materia} value={materia}>
                    {materia}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de Questionários */}
            <div className="quiz-list-section">
              <div className="quiz-list-header">
                <h2>Questionários Disponíveis</h2>
                <button
                  onClick={() => navigate("/quiz/create")}
                  className="btn-primary-dark"
                >
                  + Criar Quiz
                </button>
              </div>

              {loading ? (
                <div className="quiz-list-empty">
                  Carregando questionários...
                </div>
              ) : quizzesFiltrados.length === 0 ? (
                <div className="quiz-list-empty">
                  Nenhum questionário encontrado
                </div>
              ) : (
                <div className="quiz-card-grid">
                  {quizzesFiltrados.map((quiz) => {
                    const dificuldadeLabel = getDificuldadeLabel(
                      quiz.dificuldade
                    );
                    const difColor =
                      getDificuldadeColor(dificuldadeLabel);

                    return (
                      <div
                        key={quiz.id}
                        className="quiz-card"
                      >
                        <div
                          className="quiz-card-clickable"
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                        >
                          <div className="quiz-card-main">
                            <div className="quiz-card-title-row">
                              <h3>{quiz.titulo}</h3>
                              <span className="quiz-badge-materia">
                                {quiz.materia}
                              </span>
                            </div>

                            {quiz.descricao && (
                              <p className="quiz-card-description">
                                {quiz.descricao}
                              </p>
                            )}

                            <div className="quiz-card-meta">
                              <div className="meta-item">
                                <FileQuestion size={16} />
                                <span>
                                  {quiz.total_questoes || 0} questões
                                </span>
                              </div>
                              <div className="meta-item">
                                <Clock size={16} />
                                <span>
                                  {quiz.tempo_estimado || 25} min
                                </span>
                              </div>
                              <div className="meta-item">
                                <TrendingUp size={16} />
                                <span>
                                  {quiz.total_tentativas || 0} tentativas
                                </span>
                              </div>
                            </div>

                            <div className="quiz-card-tags">
                              <span
                                className="quiz-badge-dificuldade"
                                style={{
                                  backgroundColor: difColor + "20",
                                  color: difColor,
                                }}
                              >
                                {dificuldadeLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="quiz-card-actions">
                          <button
                            className="btn-outline-dark small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quiz/${quiz.id}`);
                            }}
                          >
                            ▶ Iniciar
                          </button>

                          <button
                            className="quiz-delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuiz(quiz.id, quiz.titulo);
                            }}
                            title="Excluir quiz"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "ranking" && (
          <div className="quiz-placeholder-card">
            <h2>Ranking Global</h2>
            <p>Funcionalidade em desenvolvimento</p>
          </div>
        )}

        {activeTab === "conquistas" && (
          <div className="quiz-placeholder-card">
            <h2>Conquistas</h2>
            <p>Funcionalidade em desenvolvimento</p>
          </div>
        )}
      </div>
  );
}
