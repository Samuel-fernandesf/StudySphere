import React, { useState, useEffect } from 'react';
import EducationalAssistant from '../../components/Assistant/EducationalAssistant';
import { listarMaterias } from '../../services/subjectService';
import './AssistantPage.css';

const AssistantPage = () => {
  const [materia, setMateria] = useState('Geral');
  const [materias, setMaterias] = useState([]);
  const [carregandoMaterias, setCarregandoMaterias] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    totalConversas: 0,
    topicosAprendidos: [],
    ultimasConversas: [],
    acoesSugeridas: [
      { emoji: '📖', titulo: 'Explicar conceito', descricao: 'Aprenda novos tópicos' },
      { emoji: '✏️', titulo: 'Resolver exercício', descricao: 'Pratique com problemas' },
      { emoji: '📝', titulo: 'Resumir conteúdo', descricao: 'Organize suas anotações' },
      { emoji: '📊', titulo: 'Plano de estudos', descricao: 'Estruture seu aprendizado' }
    ]
  });

  useEffect(() => {
    const carregarMaterias = async () => {
      try {
        const data = await listarMaterias();
        setMaterias(data);
      } catch (error) {
        console.error('Erro ao carregar matérias:', error);
      } finally {
        setCarregandoMaterias(false);
      }
    };
    
    carregarMaterias();
    
    // Carregar estatísticas do localStorage
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = () => {
    const dados = localStorage.getItem('assistantStats');
    if (dados) {
      setEstatisticas(prev => ({
        ...prev,
        ...JSON.parse(dados)
      }));
    }
  };

  const atualizarEstatisticas = (novaConversa) => {
    const novosStats = {
      totalConversas: estatisticas.totalConversas + 1,
      topicosAprendidos: [...new Set([
        ...estatisticas.topicosAprendidos,
        materia
      ])],
      ultimasConversas: [
        novaConversa,
        ...estatisticas.ultimasConversas.slice(0, 4)
      ]
    };
    
    setEstatisticas(prev => ({
      ...prev,
      ...novosStats
    }));
    
    localStorage.setItem('assistantStats', JSON.stringify(novosStats));
  };

  const handleAcaoRapida = (acao) => {
    const textarea = document.querySelector('.input-form textarea');
    if (textarea) {
      textarea.focus();
      textarea.value = acao;
    }
  };

  return (
    <div className="assistant-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>📚 Assistente de Estudos</h1>
          <p>Seu mentor educacional inteligente</p>
        </div>
        <span className="online-badge">🟢 Online</span>
      </div>

      {/* Seletor de Matéria */}
      <div className="selector-container">
        <label htmlFor="materia-select">Matéria:</label>
        <select
          id="materia-select"
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          disabled={carregandoMaterias}
          className="materia-select"
        >
          <option value="Geral">-- Geral --</option>
          {materias.map((mat) => (
            <option key={mat.id} value={mat.name}>
              {mat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Layout 2 Colunas */}
      <div className="assistant-layout">
        
        {/* Coluna Esquerda - Chat */}
        <div className="assistant-main">
          <EducationalAssistant 
            materia={materia}
            onNovaConversa={atualizarEstatisticas}
          />
        </div>

        {/* Coluna Direita - Sidebar */}
        <div className="assistant-sidebar">
          
          {/* Ações Rápidas */}
          <section className="sidebar-section">
            <div className="section-header">
              <h3>⚡ Ações Rápidas</h3>
              <p>Inicie uma conversa rapidamente</p>
            </div>
            <div className="quick-actions">
              {estatisticas.acoesSugeridas.map((acao, idx) => (
                <button
                  key={idx}
                  className="action-button"
                  onClick={() => handleAcaoRapida(acao.titulo)}
                  title={acao.descricao}
                >
                  <span className="action-emoji">{acao.emoji}</span>
                  <div className="action-text">
                    <strong>{acao.titulo}</strong>
                    <small>{acao.descricao}</small>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Tópicos Aprendidos */}
          <section className="sidebar-section">
            <div className="section-header">
              <h3>📖 Tópicos Aprendidos</h3>
              <p>Temas mais pesquisados hoje</p>
            </div>
            <div className="topics-list">
              {estatisticas.topicosAprendidos.length > 0 ? (
                estatisticas.topicosAprendidos.slice(0, 5).map((topico, idx) => (
                  <div key={idx} className="topic-tag">
                    {topico}
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhum tópico ainda</p>
              )}
            </div>
          </section>

          {/* Estatísticas */}
          <section className="sidebar-section">
            <div className="section-header">
              <h3>📊 Suas Estatísticas</h3>
              <p>Progresso hoje</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <small>Conversas</small>
                  <strong>{estatisticas.totalConversas}</strong>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <small>Tópicos</small>
                  <strong>{estatisticas.topicosAprendidos.length}</strong>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <small>Minutos</small>
                  <strong>{Math.floor(Math.random() * 60) + 5}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Dica do Dia */}
          <section className="sidebar-section tips-section">
            <div className="section-header">
              <h3>💡 Dica do Dia</h3>
            </div>
            <div className="tip-content">
              <p>Faça pausas regulares durante os estudos. A Técnica Pomodoro (25min de foco + 5min de pausa) ajuda a manter a concentração e melhorar a relação de informações!</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default AssistantPage;
