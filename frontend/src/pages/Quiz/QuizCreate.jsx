import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz, gerarQuizAutomatico } from "../../services/quizService";
import Sidebar from "../../components/layout/Sidebar";
import { FileQuestion, Sparkles } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import "./QuizCreate.css";

const DIFICULDADES = [
  { value: "facil", label: "Fácil" },
  { value: "medio", label: "Médio" },
  { value: "dificil", label: "Difícil" }
];

const NUM_QUESTOES = 5;

export default function QuizCreate() {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();

  const [step, setStep] = useState(1); // 1=Info, 2=Questões, 3=Revisão
  const [quizData, setQuizData] = useState({
    titulo: "",
    descricao: "",
    materia: "",
    dificuldade: "medio",
    tempo_estimado: 25,
    questoes: Array(NUM_QUESTOES)
      .fill(null)
      .map((_, qIndex) => ({
        enunciado: "",
        pontos: 1,
        alternativas: Array(4)
          .fill(null)
          .map((_, aIndex) => ({
            texto: "",
            is_correta: false,
            ordem: aIndex + 1
          }))
      }))
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestaoChange = (qIndex, e) => {
    const { name, value } = e.target;
    const newQuestoes = [...quizData.questoes];
    newQuestoes[qIndex] = { ...newQuestoes[qIndex], [name]: value };
    setQuizData((prev) => ({ ...prev, questoes: newQuestoes }));
  };

  async function handleAutoGenerate() {
  if (!quizData.titulo || !quizData.materia || !quizData.descricao) {
    await showAlert(
      "Preencha o título, a descrição e matéria antes de gerar automaticamente.",
      "warning",
      "Dados incompletos"
    );
    return;
  }

  try {
    setLoading(true);

    const data = await gerarQuizAutomatico({
      titulo: quizData.titulo,
      materia: quizData.materia,
      dificuldade: quizData.dificuldade,
      num_questoes: NUM_QUESTOES,
    });

    setQuizData((prev) => ({
      ...prev,
      questoes: data.questoes,
    }));

    await showAlert(
      "Questões geradas automaticamente. Revise e ajuste se necessário.",
      "success",
      "Quiz gerado"
    );

    setStep(2);
  } catch (e) {
    await showAlert(
      e.response?.data?.message ||
        "Não foi possível gerar o quiz automaticamente. Tente novamente.",
      "error",
      "Erro"
    );
  } finally {
    setLoading(false);
  }
}

  const handleAlternativaChange = (qIndex, aIndex, e) => {
    const { value } = e.target;
    const newQuestoes = [...quizData.questoes];
    newQuestoes[qIndex].alternativas[aIndex] = {
      ...newQuestoes[qIndex].alternativas[aIndex],
      texto: value
    };
    setQuizData((prev) => ({ ...prev, questoes: newQuestoes }));
  };

  const handleCorretaChange = (qIndex, aIndex) => {
    const newQuestoes = [...quizData.questoes];
    const newAlternativas = newQuestoes[qIndex].alternativas.map(
      (alt, index) => ({
        ...alt,
        is_correta: index === aIndex
      })
    );
    newQuestoes[qIndex] = { ...newQuestoes[qIndex], alternativas: newAlternativas };
    setQuizData((prev) => ({ ...prev, questoes: newQuestoes }));
  };

  const validateAll = () => {
    if (!quizData.titulo || !quizData.materia || !quizData.descricao) {
      return "Preencha o título, matéria e descrição do quiz.";
    }

    for (let i = 0; i < NUM_QUESTOES; i++) {
      const questao = quizData.questoes[i];
      if (!questao.enunciado) {
        return `Preencha o enunciado da Questão ${i + 1}.`;
      }

      let corretaEncontrada = false;
      for (let j = 0; j < 4; j++) {
        const alternativa = questao.alternativas[j];
        if (!alternativa.texto) {
          return `Preencha o texto da Alternativa ${j + 1} da Questão ${i + 1}.`;
        }
        if (alternativa.is_correta) {
          corretaEncontrada = true;
        }
      }

      if (!corretaEncontrada) {
        return `Selecione a alternativa correta para a Questão ${i + 1}.`;
      }
    }

    return null;
  };

  const handleNextFromInfo = async () => {
    if (!quizData.titulo || !quizData.materia || !quizData.descricao) {
      await showAlert(
        "Preencha título, matéria e descrição antes de avançar.",
        "warning",
        "Campos obrigatórios"
      );
      return;
    }
    setStep(2);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < NUM_QUESTOES - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleGoToReview = async () => {
    const validationError = validateAll();
    if (validationError) {
      await showAlert(validationError, "warning", "Validação");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    const confirmed = await showConfirm(
      "Deseja criar este quiz com as informações preenchidas?",
      "Confirmar criação",
      "success"
    );
    if (!confirmed) return;

    const validationError = validateAll();
    if (validationError) {
      await showAlert(validationError, "warning", "Validação");
      return;
    }

    try {
      setLoading(true);
      const newQuiz = await createQuiz(quizData);
      await showAlert(
        `Quiz "${newQuiz.titulo}" criado com sucesso.`,
        "success",
        "Quiz criado"
      );
      navigate("/quiz");
    } catch (err) {
      console.error("Erro ao criar quiz:", err);
      await showAlert(
        "Erro ao criar quiz. Verifique sua conexão e tente novamente.",
        "error",
        "Erro"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQuestao = quizData.questoes[currentQuestion];

  return (
    <>
      <Sidebar />
      <div className="quiz-create-root">
        <div className="quiz-create-container">
          {/* Header */}
          <div className="quiz-header">
            <div className="quiz-header-left">
              <FileQuestion size={32} color="#232946" />
              <div>
                <h1>Criar Novo Questionário</h1>
                <p className="quiz-step-indicator">
                  Etapa {step} de 3 ·{" "}
                  {step === 1
                    ? "Informações do Quiz"
                    : step === 2
                    ? "Questões"
                    : "Revisão e Conclusão"}
                </p>
              </div>
            </div>
            <button onClick={() => navigate("/quiz")} className="btn-secondary">
              Voltar
            </button>
          </div>

          {/* Etapa 1 – Informações do Quiz */}
          {step === 1 && (
            <div className="card">
              <h2>1. Informações do Quiz</h2>

              <div className="form-group">
                <label>Título do Quiz</label>
                <input
                  type="text"
                  name="titulo"
                  value={quizData.titulo}
                  onChange={handleQuizChange}
                  placeholder="Ex: Quiz de Cálculo I - Derivadas"
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  value={quizData.descricao}
                  onChange={handleQuizChange}
                  placeholder="Breve descrição do conteúdo do quiz"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Matéria</label>
                  <input
                    type="text"
                    name="materia"
                    value={quizData.materia}
                    onChange={handleQuizChange}
                    placeholder="Ex: Matemática"
                  />
                </div>

                <div className="form-group">
                  <label>Dificuldade</label>
                  <select
                    name="dificuldade"
                    value={quizData.dificuldade}
                    onChange={handleQuizChange}
                  >
                    {DIFICULDADES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tempo Estimado (min)</label>
                  <input
                    type="number"
                    name="tempo_estimado"
                    value={quizData.tempo_estimado}
                    onChange={handleQuizChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="wizard-nav">
                <div />
                {/* Opção 1: gerar com IA */}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAutoGenerate}
                    disabled={loading}
                  >
                    <Sparkles size={20}/> Gerar automaticamente com IA
                  </button>
                  {/* Opção 2: seguir manualmente */}
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleNextFromInfo}
                    disabled={loading}
                  >
                    Próxima etapa: Questões
                  </button>
              </div>
            </div>
          )}

          {/* Etapa 2 – Questões (uma por vez) */}
          {step === 2 && (
            <div className="card">
              <div className="question-header">
                <h2>2. Questões ({NUM_QUESTOES} Perguntas)</h2>
                <span className="question-step">
                  Questão {currentQuestion + 1} de {NUM_QUESTOES}
                </span>
              </div>

              <div className="question-card">
                <h3>Questão {currentQuestion + 1}</h3>

                <div className="form-group">
                  <label>Enunciado</label>
                  <textarea
                    name="enunciado"
                    value={currentQuestao.enunciado}
                    onChange={(e) => handleQuestaoChange(currentQuestion, e)}
                    placeholder="Digite o enunciado da questão"
                  />
                </div>

                <div className="form-group">
                  <label>Alternativas (Selecione a correta)</label>
                  <div className="alternatives-grid">
                    {currentQuestao.alternativas.map((alternativa, aIndex) => (
                      <div key={aIndex} className="alternative-item">
                        <button
                          type="button"
                          className={
                            alternativa.is_correta
                              ? "correct-toggle correct"
                              : "correct-toggle"
                          }
                          onClick={() =>
                            handleCorretaChange(currentQuestion, aIndex)
                          }
                        >
                          {alternativa.is_correta && "✓"}
                        </button>
                        <input
                          type="text"
                          value={alternativa.texto}
                          onChange={(e) =>
                            handleAlternativaChange(
                              currentQuestion,
                              aIndex,
                              e
                            )
                          }
                          placeholder={`Alternativa ${aIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="question-nav">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleNextQuestion}
                    disabled={currentQuestion === NUM_QUESTOES - 1}
                  >
                    Próxima
                  </button>
                </div>
              </div>

              <div className="wizard-nav">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  Voltar para informações
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleGoToReview}
                >
                  Próxima etapa: Revisão
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3 – Revisão e Conclusão */}
          {step === 3 && (
            <div className="card">
              <h2>3. Revisão e Conclusão</h2>

              <div className="review-section">
                <h3>Informações do Quiz</h3>
                <p>
                  <strong>Título:</strong> {quizData.titulo}
                </p>
                <p>
                  <strong>Descrição:</strong> {quizData.descricao}
                </p>
                <p>
                  <strong>Matéria:</strong> {quizData.materia}
                </p>
                <p>
                  <strong>Dificuldade:</strong>{" "}
                  {
                    DIFICULDADES.find(
                      (d) => d.value === quizData.dificuldade
                    )?.label
                  }
                </p>
                <p>
                  <strong>Tempo estimado:</strong>{" "}
                  {quizData.tempo_estimado} min
                </p>
              </div>

              <div className="review-section">
                <h3>Questões</h3>
                {quizData.questoes.map((q, idx) => (
                  <div key={idx} className="review-question">
                    <p>
                      <strong>Questão {idx + 1}:</strong> {q.enunciado}
                    </p>
                    <ul>
                      {q.alternativas.map((alt, aIdx) => (
                        <li
                          key={aIdx}
                          className={
                            alt.is_correta ? "review-alt correct" : "review-alt"
                          }
                        >
                          {String.fromCharCode(65 + aIdx)}) {alt.texto}
                          {alt.is_correta && " (correta)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="wizard-nav">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(2)}
                >
                  Voltar para questões
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Criando Quiz..." : "Confirmar e Criar Quiz"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
