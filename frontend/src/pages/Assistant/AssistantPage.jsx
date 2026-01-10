import React, { useState, useEffect, useCallback } from 'react';
import EducationalAssistant from '../../components/Assistant/EducationalAssistant';
import ConversationSidebar from '../../components/Assistant/ConversationSidebar';
import { listarMaterias } from '../../services/subjectService';
import {
  listarConversas,
  carregarConversa,
  deletarConversa,
  criarConversa
} from '../../services/assistantservice';
import { useModal } from '../../contexts/ModalContext';
import './AssistantPage.css';
import {
  MessageCircle,
  Clock,
} from "lucide-react";

const AssistantPage = () => {
  const [materia, setMateria] = useState('Geral');
  const [materias, setMaterias] = useState([]);
  const [carregandoMaterias, setCarregandoMaterias] = useState(true);

  // Estado das conversas
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Estado para passar o texto da ação rápida para o chat
  const [sugestaoChat, setSugestaoChat] = useState('');

  // Estado para tempo de sessão
  const [tempoSessao, setTempoSessao] = useState(0);

  const [estatisticas, setEstatisticas] = useState({
    totalConversas: 0,
    topicosAprendidos: []
  });

  const { showAlert, showConfirm } = useModal();

  // Carregar conversas
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const convs = await listarConversas();
      setConversations(convs);
      setEstatisticas(prev => ({
        ...prev,
        totalConversas: convs.length
      }));
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

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
    fetchConversations();

    setTempoSessao(Math.floor(Math.random() * 60) + 5);
  }, [fetchConversations]);

  // Manipular seleção de conversa
  const handleSelectConversation = async (conversationId) => {
    try {
      const convData = await carregarConversa(conversationId);
      setActiveConversationId(conversationId);
      setConversationMessages(convData.messages || []);
      if (convData.subject) {
        setMateria(convData.subject);
      }
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      showAlert('Erro ao carregar conversa', 'error');
    }
  };

  // Manipular nova conversa
  const handleNewConversation = async () => {
    setActiveConversationId(null);
    setConversationMessages([]);
    setSugestaoChat('');
  };

  // Manipular conversa criada (do componente de chat)
  const handleConversationCreated = (newConversationId) => {
    setActiveConversationId(newConversationId);
    fetchConversations();
  };

  // Manipular exclusão de conversa
  const handleDeleteConversation = async (conversationId) => {
    const confirmado = await showConfirm(
      'Tem certeza que deseja deletar esta conversa? Esta ação não pode ser desfeita.',
      'Deletar Conversa',
      'warning'
    );

    if (!confirmado) return;

    try {
      await deletarConversa(conversationId);

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setConversationMessages([]);
      }

      fetchConversations();
      showAlert('Conversa deletada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      showAlert('Erro ao deletar conversa', 'error');
    }
  };

  const atualizarEstatisticas = (novaConversa) => {
    setEstatisticas(prev => ({
      ...prev,
      topicosAprendidos: [...new Set([...prev.topicosAprendidos, materia])]
    }));
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

      {/* Layout Principal - 3 colunas */}
      <div className="assistant-layout three-columns">

        {/* Coluna Esquerda - Histórico de Conversas */}
        <div className="assistant-history">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            loading={loadingConversations}
          />
        </div>

        {/* Coluna Central - Chat */}
        <div className="assistant-main">
          <EducationalAssistant
            materia={materia}
            onNovaConversa={atualizarEstatisticas}
            sugestao={sugestaoChat}
            conversationId={activeConversationId}
            initialMessages={conversationMessages}
            onConversationCreated={handleConversationCreated}
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
