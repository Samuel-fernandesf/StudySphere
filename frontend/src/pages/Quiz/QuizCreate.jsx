import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../services/quizService";
import Sidebar from "../../components/layout/Sidebar";
import { FileQuestion, Plus, X, Check } from "lucide-react";

const DIFICULDADES = [
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Médio' },
  { value: 'dificil', label: 'Difícil' },
];

const NUM_QUESTOES = 5;

export default function QuizCreate() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    titulo: '',
    descricao: '',
    materia: '',
    dificuldade: 'medio',
    tempo_estimado: 25,
    questoes: Array(NUM_QUESTOES).fill(null).map((_, qIndex) => ({
      enunciado: '',
      pontos: 1,
      alternativas: Array(4).fill(null).map((_, aIndex) => ({
        texto: '',
        is_correta: false,
        ordem: aIndex + 1,
      })),
    })),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestaoChange = (qIndex, e) => {
    const { name, value } = e.target;
    const newQuestoes = [...quizData.questoes];
    newQuestoes[qIndex] = { ...newQuestoes[qIndex], [name]: value };
    setQuizData(prev => ({ ...prev, questoes: newQuestoes }));
  };

  const handleAlternativaChange = (qIndex, aIndex, e) => {
    const { value } = e.target;
    const newQuestoes = [...quizData.questoes];
    newQuestoes[qIndex].alternativas[aIndex] = { ...newQuestoes[qIndex].alternativas[aIndex], texto: value };
    setQuizData(prev => ({ ...prev, questoes: newQuestoes }));
  };

  const handleCorretaChange = (qIndex, aIndex) => {
    const newQuestoes = [...quizData.questoes];
    const newAlternativas = newQuestoes[qIndex].alternativas.map((alt, index) => ({
      ...alt,
      is_correta: index === aIndex,
    }));
    newQuestoes[qIndex] = { ...newQuestoes[qIndex], alternativas: newAlternativas };
    setQuizData(prev => ({ ...prev, questoes: newQuestoes }));
  };

  const validateForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const newQuiz = await createQuiz(quizData);
      alert(`Quiz "${newQuiz.titulo}" criado com sucesso!`);
      navigate('/quiz');
    } catch (err) {
      console.error("Erro ao criar quiz:", err);
      setError("Erro ao criar quiz. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: '260px',
        padding: '32px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileQuestion size={32} color="#232946" />
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#232946' }}>
                Criar Novo Questionário
              </h1>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e2e8f0',
                color: '#232946',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Voltar
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Informações Básicas */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#232946', marginBottom: '20px' }}>
                1. Informações do Quiz
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Título do Quiz</label>
                <input
                  type="text"
                  name="titulo"
                  value={quizData.titulo}
                  onChange={handleQuizChange}
                  style={inputStyle}
                  placeholder="Ex: Quiz de Cálculo I - Derivadas"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Descrição</label>
                <textarea
                  name="descricao"
                  value={quizData.descricao}
                  onChange={handleQuizChange}
                  style={{ ...inputStyle, minHeight: '80px' }}
                  placeholder="Breve descrição do conteúdo do quiz"
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, marginBottom: '16px' }}>
                  <label style={labelStyle}>Matéria</label>
                  <input
                    type="text"
                    name="materia"
                    value={quizData.materia}
                    onChange={handleQuizChange}
                    style={inputStyle}
                    placeholder="Ex: Matemática"
                  />
                </div>

                <div style={{ flex: 1, marginBottom: '16px' }}>
                  <label style={labelStyle}>Dificuldade</label>
                  <select
                    name="dificuldade"
                    value={quizData.dificuldade}
                    onChange={handleQuizChange}
                    style={inputStyle}
                  >
                    {DIFICULDADES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, marginBottom: '16px' }}>
                  <label style={labelStyle}>Tempo Estimado (min)</label>
                  <input
                    type="number"
                    name="tempo_estimado"
                    value={quizData.tempo_estimado}
                    onChange={handleQuizChange}
                    style={inputStyle}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Questões */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#232946', marginBottom: '20px' }}>
                2. Questões ({NUM_QUESTOES} Perguntas)
              </h2>

              {quizData.questoes.map((questao, qIndex) => (
                <div key={qIndex} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', marginBottom: '16px' }}>
                    Questão {qIndex + 1}
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Enunciado</label>
                    <textarea
                      name="enunciado"
                      value={questao.enunciado}
                      onChange={(e) => handleQuestaoChange(qIndex, e)}
                      style={{ ...inputStyle, minHeight: '60px' }}
                      placeholder="Digite o enunciado da questão"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Alternativas (Selecione a correta)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {questao.alternativas.map((alternativa, aIndex) => (
                        <div key={aIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleCorretaChange(qIndex, aIndex)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: `2px solid ${alternativa.is_correta ? '#10b981' : '#cbd5e1'}`,
                              backgroundColor: alternativa.is_correta ? '#10b981' : 'white',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              flexShrink: 0
                            }}
                          >
                            {alternativa.is_correta && <Check size={14} />}
                          </button>
                          <input
                            type="text"
                            value={alternativa.texto}
                            onChange={(e) => handleAlternativaChange(qIndex, aIndex, e)}
                            style={{ ...inputStyle, margin: 0, border: 'none', padding: '4px 0' }}
                            placeholder={`Alternativa ${aIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de Submissão */}
            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loading ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Criando Quiz...' : 'Criar Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#232946',
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
};
