import React, { useState, useEffect, useRef } from 'react';
import { fazerPergunta, pesquisarConteudo, limparHistorico } from '../../services/assistantService';
import './EducationalAssistant.css';

const EducationalAssistant = ({ materia = 'Geral' }) => {
  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handlePergunta = async (e) => {
  e.preventDefault();
  
  if (!pergunta.trim()) {
    setErro('Digite uma pergunta');
    return;
  }

  setCarregando(true);
  setErro(null);
  
  const novaPergunta = {
    id: Date.now(),
    tipo: 'usuario',
    conteudo: pergunta,
    timestamp: new Date()
  };
  
  setMensagens(prev => [...prev, novaPergunta]);

  try {
    const resultado = await fazerPergunta(pergunta, materia);
    
    const novaResposta = {
      id: Date.now() + 1,
      tipo: 'assistente',
      conteudo: resultado.answer,
      citacoes: resultado.citations || [],
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaResposta]);
    
    // 🆕 Chamar callback com a conversa
    if (props.onNovaConversa) {
      props.onNovaConversa(pergunta);
    }
    
    setPergunta('');
  } catch (error) {
    console.error('Erro completo:', error);
    // ... resto do código
  } finally {
    setCarregando(false);
  }
};
  const handlePesquisa = async (topico) => {
    if (!topico.trim()) {
      setErro('Digite um tópico para pesquisar');
      return;
    }

    setCarregando(true);
    setErro(null);
    
    const novaPesquisa = {
      id: Date.now(),
      tipo: 'usuario',
      conteudo: `🔍 Pesquisando: ${topico}`,
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaPesquisa]);

    try {
      const resultado = await pesquisarConteudo(topico);
      
      const novaResposta = {
        id: Date.now() + 1,
        tipo: 'assistente',
        conteudo: resultado.research,
        citacoes: resultado.citations || [],
        tipo_msg: 'pesquisa',
        timestamp: new Date()
      };
      
      setMensagens(prev => [...prev, novaResposta]);
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      
      const mensagemErro = error.response?.data?.error || 
                          'Erro ao realizar a pesquisa.';
      
      const erroMensagem = {
        id: Date.now() + 1,
        tipo: 'erro',
        conteudo: mensagemErro,
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, erroMensagem]);
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparHistorico = async () => {
    if (window.confirm('Tem certeza que deseja limpar o histórico?')) {
      try {
        await limparHistorico();
        setMensagens([]);
        setErro(null);
      } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        setErro('Erro ao limpar histórico');
      }
    }
  };

  return (
    <div className="assistant-container">
      <div className="assistant-header">
        <h2>📚 Assistente de Estudos</h2>
        {materia && <span className="materia-badge">{materia}</span>}
        <button 
          className="btn-limpar"
          onClick={handleLimparHistorico}
          title="Limpar histórico de conversa"
        >
          🗑️
        </button>
      </div>

      {erro && (
        <div className="error-banner">
          ⚠️ {erro}
        </div>
      )}

      <div className="messages-container">
        {mensagens.length === 0 && (
          <div className="welcome-message">
            <h3>👋 Bem-vindo ao Assistente de Estudos!</h3>
            <p>Faça uma pergunta sobre <strong>{materia || 'qualquer assunto'}</strong> e receba respostas com fontes acadêmicas.</p>
            <p style={{fontSize: '12px', marginTop: '10px', color: '#999'}}>
              💡 Dica: Quanto mais específica sua pergunta, melhor será a resposta!
            </p>
          </div>
        )}
        
        {mensagens.map((msg) => (
          <div key={msg.id} className={`message message-${msg.tipo}`}>
            <div className="message-content">
              {msg.conteudo}
              {msg.citacoes && msg.citacoes.length > 0 && (
                <div className="citations">
                  <strong>📖 Fontes:</strong>
                  <ul>
                    {msg.citacoes.map((cit, idx) => (
                      <li key={idx}>{cit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <small className="message-time">
              {msg.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </small>
          </div>
        ))}
        
        {carregando && (
          <div className="message message-assistente">
            <div className="loading-spinner">
              <span>⏳</span> Pensando...
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
          placeholder="Digite sua dúvida..."
          disabled={carregando}
          rows="3"
        />
        <div className="button-group">
          <button 
            type="submit" 
            disabled={carregando || !pergunta.trim()}
            className="btn-enviar"
          >
            ✉️ Enviar
          </button>
          <button
            type="button"
            onClick={() => handlePesquisa(pergunta || 'conteúdo educacional')}
            disabled={carregando}
            className="btn-pesquisa"
          >
            🔍 Pesquisar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationalAssistant;
