import React, { useState, useEffect } from 'react';
import EducationalAssistant from '../../components/Assistant/EducationalAssistant'; // Ajuste o caminho conforme necessário
import { listarMaterias } from '../../services/subjectService';
import './AssistantPage.css';
import {
  MessageCircle,
  Clock,
  NotebookPen,
  Hand 
} from "lucide-react";

const AssistantPage = () => {
  const [materia, setMateria] = useState('Geral');
  const [materias, setMaterias] = useState([]);
  const [carregandoMaterias, setCarregandoMaterias] = useState(true);
  
  // Estado para passar o texto da ação rápida para o chat
  const [sugestaoChat, setSugestaoChat] = useState(''); 

  // Estado para tempo de sessão (fixo para não ficar mudando)
  const [tempoSessao, setTempoSessao] = useState(0);

  const [estatisticas, setEstatisticas] = useState({
    totalConversas: 0,
    topicosAprendidos: [],
    acoesSugeridas: [
      { emoji: '📖', titulo: 'Explicar conceito', prompt: 'Poderia explicar o conceito de ' },
      { emoji: '✏️', titulo: 'Resolver exercício', prompt: 'Crie um exercício prático sobre ' },
      { emoji: '📝', titulo: 'Resumir conteúdo', prompt: 'Faça um resumo detalhado sobre ' },
      { emoji: '📊', titulo: 'Plano de estudos', prompt: 'Crie um plano de estudos para ' }
    ]
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const data = await listarMaterias();
        setMaterias(data);
      } catch (error) {
        console.error('Erro ao carregar matérias:', error);
      } finally {
        setCarregandoMaterias(false);
      }
    };
    
    carregarDados();
    carregarEstatisticas();
    
    // Define um tempo aleatório apenas UMA vez ao montar o componente
    setTempoSessao(Math.floor(Math.random() * 60) + 5);
  }, []);

  const carregarEstatisticas = () => {
    const dados = localStorage.getItem('assistantStats');
    if (dados) {
      const parsed = JSON.parse(dados);
      // Mantém as ações sugeridas originais, pois elas não mudam
      setEstatisticas(prev => ({
        ...prev,
        ...parsed,
        acoesSugeridas: prev.acoesSugeridas 
      }));
    }
  };

  const atualizarEstatisticas = (novaConversa) => {
    const novosStats = {
      ...estatisticas,
      totalConversas: estatisticas.totalConversas + 1,
      topicosAprendidos: [...new Set([...estatisticas.topicosAprendidos, materia])]
    };
    
    // Removemos acoesSugeridas antes de salvar para não duplicar/sujar o localStorage
    const statsToSave = { ...novosStats };
    delete statsToSave.acoesSugeridas;

    setEstatisticas(novosStats);
    localStorage.setItem('assistantStats', JSON.stringify(statsToSave));
  };

  // ✅ Forma correta de passar dados: Atualizando o estado que é passado como prop
  const handleAcaoRapida = (promptBase) => {
    const textoFinal = `${promptBase}${materia !== 'Geral' ? materia : ''}`;
    setSugestaoChat(textoFinal);
  };

  return (
    <div className="assistant-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Assistente de Estudos</h1>
          <p>Seu mentor educacional inteligente</p>
        </div>
        <div className="header-actions">
           <span className="online-badge">🟢 Online</span>
        </div>
      </div>

      {/* Seletor de Matéria */}
      <div className="selector-container">
        <label htmlFor="materia-select">Estou estudando:</label>
        <select
          id="materia-select"
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          disabled={carregandoMaterias}
          className="materia-select"
        >
          <option value="Geral">Assuntos Gerais</option>
          {materias.map((mat) => (
            <option key={mat.id} value={mat.name}>{mat.name}</option>
          ))}
        </select>
      </div>

      {/* Layout Principal */}
      <div className="assistant-layout">
        
        {/* Coluna Esquerda - Chat */}
        <div className="assistant-main">
          <EducationalAssistant 
            materia={materia}
            onNovaConversa={atualizarEstatisticas}
            sugestao={sugestaoChat} 
          />
        </div>

        {/* Coluna Direita - Sidebar */}
        <div className="assistant-sidebar">

          {/* Tópicos Aprendidos */}
          <section className="sidebar-section">
            <div className="section-header">
              <h3>Tópicos Recentes</h3>
            </div>
            <div className="topics-list">
              {estatisticas.topicosAprendidos.length > 0 ? (
                estatisticas.topicosAprendidos.slice(-5).reverse().map((topico, idx) => (
                  <span key={idx} className="topic-tag">{topico}</span>
                ))
              ) : (
                <p className="empty-state">Inicie uma conversa para registrar tópicos.</p>
              )}
            </div>
          </section>

          {/* Estatísticas */}
          <section className="sidebar-section">
            <div className="section-header">
              <h3>Estatísticas</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><MessageCircle /></div>
                <div className="stat-content">
                  <small>Conversas</small>
                  <strong>{estatisticas.totalConversas}</strong>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Clock /></div>
                <div className="stat-content">
                  <small>Minutos</small>
                  <strong>{tempoSessao}</strong>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
