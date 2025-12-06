import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listarQuizzes, obterEstatisticas } from "../../services/quizService";
import Sidebar from "../../components/layout/Sidebar";
import { FileQuestion, Trophy, Clock, Target, TrendingUp, Award } from "lucide-react";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questionarios'); // 'questionarios', 'ranking', 'conquistas'
  const [filtroMateria, setFiltroMateria] = useState('Todas');
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [quizzesData, statsData] = await Promise.all([
        listarQuizzes(),
        obterEstatisticas()
      ]);
      setQuizzes(quizzesData);
      setEstatisticas(statsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  const materias = ['Todas', ...new Set(quizzes.map(q => q.materia))];
  const quizzesFiltrados = filtroMateria === 'Todas' 
    ? quizzes 
    : quizzes.filter(q => q.materia === filtroMateria);

  const getDificuldadeColor = (dificuldade) => {
    const colors = {
      'Fácil': '#4ade80',
      'Médio': '#fbbf24',
      'Difícil': '#ef4444'
    };
    return colors[dificuldade] || '#94a3b8';
  };

  const getDificuldadeLabel = (dificuldade) => {
    const labels = {
      'facil': 'Fácil',
      'medio': 'Médio',
      'dificil': 'Difícil'
    };
    return labels[dificuldade] || dificuldade;
  };

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: '0px',
        padding: '32px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileQuestion size={32} color="#232946" />
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#232946' }}>
              Questionários e Ranking
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Teste seus conhecimentos e compare com seus colegas
          </p>
        </div>

        {/* Estatísticas do Usuário */}
        {estatisticas && (
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Trophy size={20} color="#f59e0b" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                {estatisticas.total_tentativas || 0} pontos
              </span>
            </div>
            <div style={{
              backgroundColor: '#ddd6fe',
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Award size={20} color="#7c3aed" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#5b21b6' }}>
                Nível {Math.floor((estatisticas.total_tentativas || 0) / 5) + 1}
              </span>
            </div>
            <div style={{
              backgroundColor: '#e0f2fe',
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Target size={20} color="#0284c7" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#075985' }}>
                {quizzesFiltrados.length} completos
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('questionarios')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'questionarios' ? '#232946' : '#94a3b8',
              borderBottom: activeTab === 'questionarios' ? '3px solid #232946' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <FileQuestion size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Questionários
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'ranking' ? '#232946' : '#94a3b8',
              borderBottom: activeTab === 'ranking' ? '3px solid #232946' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <Trophy size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Ranking
          </button>
          <button
            onClick={() => setActiveTab('conquistas')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'conquistas' ? '#232946' : '#94a3b8',
              borderBottom: activeTab === 'conquistas' ? '3px solid #232946' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <Award size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Conquistas
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'questionarios' && (
          <>
            {/* Filtros */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                  Filtros:
                </span>
                <select
                  value={filtroMateria}
                  onChange={(e) => setFiltroMateria(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                >
                  {materias.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Questionários */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#232946', marginBottom: '16px' }}>
                Questionários Disponíveis
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Escolha um questionário para testar seus conhecimentos
                </p>
                <button
                  onClick={() => navigate('/quiz/create')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  + Criar Quiz
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Carregando questionários...
                </div>
              ) : quizzesFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Nenhum questionário encontrado
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {quizzesFiltrados.map((quiz) => (
                    <div
                      key={quiz.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#232946' }}>
                              {quiz.titulo}
                            </h3>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: '#e0f2fe',
                              color: '#075985'
                            }}>
                              {quiz.materia}
                            </span>
                          </div>
                          
                          {quiz.descricao && (
                            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b' }}>
                              {quiz.descricao}
                            </p>
                          )}

                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileQuestion size={16} />
                              <span>{quiz.total_questoes || 0} questões</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={16} />
                              <span>{quiz.tempo_estimado || 25} min</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <TrendingUp size={16} />
                              <span>{quiz.total_tentativas || 0} tentativas</span>
                            </div>
                          </div>

                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: getDificuldadeColor(getDificuldadeLabel(quiz.dificuldade)) + '20',
                              color: getDificuldadeColor(getDificuldadeLabel(quiz.dificuldade))
                            }}>
                              {getDificuldadeLabel(quiz.dificuldade)}
                            </span>
                          </div>
                        </div>

                        <button
                          style={{
                            padding: '10px 20px',
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quiz/${quiz.id}`);
                          }}
                        >
                          ▶ Iniciar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'ranking' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#232946', marginBottom: '16px' }}>
              Ranking Global
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Funcionalidade em desenvolvimento
            </p>
          </div>
        )}

        {activeTab === 'conquistas' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#232946', marginBottom: '16px' }}>
              Conquistas
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Funcionalidade em desenvolvimento
            </p>
          </div>
        )}
      </div>
    </>
  );
}
