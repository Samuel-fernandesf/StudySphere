// src/pages/Dashboard/Dashboard.jsx
import React from "react";
import "./dashboard.css";
import { useAuthContext } from "../../contexts/AuthContext";

/* --- Componentes visuais pequenos --- */
const KpiCard = ({ titulo, valor, descricao }) => (
  <div className="kpi-card" role="article" aria-label={titulo}>
    <div className="kpi-title">{titulo}</div>
    <div className="kpi-value">{valor}</div>
    {descricao && <div className="kpi-desc">{descricao}</div>}
  </div>
);

const SectionCard = ({ titulo, children }) => (
  <div className="section-card card">
    <div className="section-header"><strong>{titulo}</strong></div>
    <div className="section-body">{children}</div>
  </div>
);

const PlaceholderItem = ({ text }) => (
  <div className="placeholder-item" aria-hidden="true">
    <div className="ph-dot" />
    <div className="ph-text">{text}</div>
  </div>
);

/* --- Componente principal do Dashboard --- */
export default function Dashboard() {
  // Busca dados do usuário do contexto de autenticação
  const { userDetails } = useAuthContext();

  // Extrai o primeiro nome do nome completo
  const primeiroNome = userDetails?.nome_completo 
    ? userDetails.nome_completo.split(" ")[0] 
    : userDetails?.username || "";

  // Placeholders até as features estarem prontas
  const tempoHoje = "Nenhum progresso hoje";
  const tarefasConcluidas = "Nenhuma tarefa concluída";
  const sequencia = "Nenhuma sequência";
  const metaSemanal = "0%";

  // placeholders para listas (serão substituídas pelos dados reais)
  const materiasPlaceholders = [
    "Sem dados — aguardando o serviço de matérias",
    "Card pronto para popular quando o backend estiver pronto",
  ];
  const tarefasPlaceholders = [
    "Adicione tarefas ou aguarde o serviço de tasks",
    "Nenhuma tarefa disponível no momento",
    "Componente de listagem pronto para receber dados",
  ];
  const proximasPlaceholders = [
    "Nenhuma tarefa agendada",
    "Aqui aparecerão as próximas tarefas quando o serviço estiver pronto",
  ];

  // Ação do botão "Nova Tarefa" (por enquanto apenas placeholder)
  function handleNovaTarefa() {
    alert("Criar nova tarefa — funcionalidade ainda não implementada.");
  }

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div>
          <h1 className="welcome">
            Olá{primeiroNome ? `, ${primeiroNome}!` : "!"} <span className="wave">👋</span>
          </h1>
          <p className="sub">Vamos continuar estudando hoje?</p>
        </div>

        <div className="header-actions">
          <button className="btn" onClick={handleNovaTarefa}>+ Nova Tarefa</button>
        </div>
      </header>

      
      {/* Coluna direita (conteúdo principal) */}
      <main className="dashboard-right">
        {/* KPIs */}
        <section className="kpi-row" aria-label="Indicadores">
          <KpiCard titulo="Tempo Hoje" valor={tempoHoje} />
          <KpiCard titulo="Tarefas Concluídas" valor={tarefasConcluidas} />
          <KpiCard titulo="Sequência" valor={sequencia} />
          <KpiCard titulo="Meta Semanal" valor={metaSemanal} descricao="Progresso semanal" />
        </section>

        {/* Cards principais */}
        <section className="grid-main" aria-label="Conteúdo principal">
          <SectionCard titulo="Suas Matérias">
            {materiasPlaceholders.map((t, i) => (
              <PlaceholderItem key={i} text={t} />
            ))}
          </SectionCard>

          <SectionCard titulo="Lista de Tarefas">
            <div style={{ color: "var(--muted)", marginBottom: 8, fontSize: 14 }}>
              {tarefasPlaceholders.length === 0 ? "Nenhuma tarefa" : "Adicione tarefas ou aguarde o serviço de tasks"}
            </div>
            <div className="task-list-placeholder">
              {tarefasPlaceholders.map((t, i) => <PlaceholderItem key={i} text={t} />)}
            </div>
          </SectionCard>

          <SectionCard titulo="Próximas Tarefas">
            {proximasPlaceholders.map((t, i) => <PlaceholderItem key={i} text={t} />)}
          </SectionCard>
        </section>
      </main>
    </div>
  );
}
