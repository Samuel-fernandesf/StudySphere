import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarQuiz, submeterQuiz } from "../../services/quizService";
import Sidebar from "../../components/layout/Sidebar";
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";

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
  }, [id]);

  async function carregarQuiz() {
    try {
      setLoading(true);
      const data = await buscarQuiz(id);
      setQuiz(data);
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
    setRespostas(prev => ({
      ...prev,
      [questaoId]: alternativaId
    }));
  }

  function proximaQuestao() {
    if (questaoAtual < quiz.questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
    }
  }

  function questaoAnterior() {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1);
    }
  }

  async function finalizar() {
    if (Object.keys(respostas).length < quiz.questoes.length) {
      if (!window.confirm("Você não respondeu todas as questões. Deseja finalizar mesmo assim?")) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000);
      
      const respostasFormatadas = quiz.questoes.map(q => ({
        questao_id: q.id,
        alternativa_id: respostas[q.id] || null
      }));

      const resultado = await submeterQuiz(id, respostasFormatadas, tempoGasto);
      setResultado(resultado);
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
        <div style={{
          marginLeft: '260px',
          padding: '32px',
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            Carregando questionário...
          </div>
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
        <div style={{
          marginLeft: '260px',
          padding: '32px',
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: resultado.percentual >= 70 ? '#dcfce7' : '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              {resultado.percentual >= 70 ? (
                <CheckCircle size={40} color="#16a34a" />
              ) : (
                <XCircle size={40} color="#dc2626" />
              )}
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#232946',
              marginBottom: '12px'
            }}>
              {resultado.percentual >= 70 ? 'Parabéns!' : 'Continue Tentando!'}
            </h1>

            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '32px'
            }}>
              Você completou o questionário "{quiz.titulo}"
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Pontuação
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#232946' }}>
                  {resultado.pontuacao}/{resultado.pontuacao_maxima}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Percentual
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: resultado.percentual >= 70 ? '#16a34a' : '#dc2626'
                }}>
                  {resultado.percentual}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Tempo
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#232946' }}>
                  {Math.floor((resultado.tentativa?.tempo_gasto || 0) / 60)}:{String(Math.floor((resultado.tentativa?.tempo_gasto || 0) % 60)).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/quiz')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#232946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#121629'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232946'}
              >
                Voltar aos Questionários
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#232946',
                  border: '2px solid #232946',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
      <div style={{
        marginLeft: '260px',
        padding: '32px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#232946' }}>
                {quiz.titulo}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                <Clock size={18} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {Math.floor((Date.now() - tempoInicio) / 60000)}:{String(Math.floor(((Date.now() - tempoInicio) % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div style={{
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                height: '100%',
                width: `${progresso}%`,
                backgroundColor: '#232946',
                transition: 'width 0.3s'
              }} />
            </div>

            <div style={{ fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
              Questão {questaoAtual + 1} de {quiz.questoes.length}
            </div>
          </div>

          {/* Questão */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#232946',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              {questao.enunciado}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questao.alternativas && questao.alternativas
                .sort((a, b) => a.ordem - b.ordem)
                .map((alternativa) => {
                  const selecionada = respostas[questao.id] === alternativa.id;
                  return (
                    <button
                      key={alternativa.id}
                      onClick={() => selecionarResposta(questao.id, alternativa.id)}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: selecionada ? '#e0f2fe' : 'white',
                        border: selecionada ? '2px solid #0284c7' : '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        color: '#232946',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontWeight: selecionada ? '600' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (!selecionada) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selecionada) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      {alternativa.texto}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Navegação */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={questaoAnterior}
              disabled={questaoAtual === 0}
              style={{
                padding: '12px 24px',
                backgroundColor: questaoAtual === 0 ? '#e2e8f0' : 'white',
                color: questaoAtual === 0 ? '#94a3b8' : '#232946',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: questaoAtual === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={18} />
              Anterior
            </button>

            {questaoAtual === quiz.questoes.length - 1 ? (
              <button
                onClick={finalizar}
                disabled={submitting}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                {submitting ? 'Finalizando...' : 'Finalizar'}
              </button>
            ) : (
              <button
                onClick={proximaQuestao}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#232946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#121629'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232946'}
              >
                Próxima
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          {/* Mapa de Questões */}
          <div style={{
            marginTop: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
              Navegação Rápida
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quiz.questoes.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setQuestaoAtual(idx)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: idx === questaoAtual ? '2px solid #232946' : '2px solid #e2e8f0',
                    backgroundColor: respostas[q.id] ? '#dcfce7' : (idx === questaoAtual ? '#f8fafc' : 'white'),
                    color: '#232946',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
