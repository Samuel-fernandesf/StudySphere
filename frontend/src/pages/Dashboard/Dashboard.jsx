// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import "./dashboard.css";
import { useAuthContext } from "../../contexts/AuthContext";
import { listarMaterias } from "../../services/subjectService";
import { listarEventos } from "../../services/eventService";
import * as Icons from "lucide-react";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const SubjectItem = ({ subject }) => {
  const IconComponent = Icons[subject.icon] || Icons.BookOpen;
  
  return (
    <div className="subject-item" style={{ borderLeftColor: subject.color }}>
      <div 
        className="subject-icon" 
        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
      >
        <IconComponent size={20} />
      </div>
      <div className="subject-info">
        <div className="subject-name">{subject.name}</div>
        {subject.description && (
          <div className="subject-description">{subject.description}</div>
        )}
      </div>
    </div>
  );
};

const TaskItem = ({ event }) => {
  const startDate = parseISO(event.start_date);
  const formattedDate = format(startDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  
  return (
    <div className="task-item">
      <div 
        className="task-indicator" 
        style={{ backgroundColor: event.color || '#3b82f6' }}
      />
      <div className="task-content">
        <div className="task-title">{event.title}</div>
        <div className="task-date">{formattedDate}</div>
      </div>
    </div>
  );
};

/* --- Componente principal do Dashboard --- */
export default function Dashboard() {
  // Busca dados do usuário do contexto de autenticação
  const { userDetails } = useAuthContext();
  
  // Estados para dados
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extrai o primeiro nome do nome completo
  const primeiroNome = userDetails?.nome_completo 
    ? userDetails.nome_completo.split(" ")[0] 
    : userDetails?.username || "";

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Carregar matérias
      const subjectsData = await listarMaterias();
      setSubjects(subjectsData);
      
      // Carregar eventos (próximos 30 dias)
      const today = new Date();
      const futureDate = addDays(today, 30);
      const eventsData = await listarEventos(
        today.toISOString(),
        futureDate.toISOString()
      );
      setEvents(eventsData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar eventos futuros e ordenar por data
  const upcomingEvents = events
    .filter(event => isAfter(parseISO(event.start_date), new Date()))
    .sort((a, b) => parseISO(a.start_date) - parseISO(b.start_date))
    .slice(0, 5); // Mostrar apenas os 5 próximos

  // Calcular KPIs
  const totalSubjects = subjects.length;
  const totalEvents = events.length;
  const completedToday = 0; // Placeholder - implementar quando houver sistema de conclusão
  const weeklyProgress = "0%"; // Placeholder - implementar quando houver sistema de progresso

  // Ação do botão "Nova Tarefa"
  function handleNovaTarefa() {
    window.location.href = "/calendar";
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
          <button className="btn" onClick={handleNovaTarefa}>+ Novo Evento</button>
        </div>
      </header>

      
      {/* Coluna direita (conteúdo principal) */}
      <main className="dashboard-right">
        {/* KPIs */}
        <section className="kpi-row" aria-label="Indicadores">
          <KpiCard titulo="Matérias" valor={totalSubjects} />
          <KpiCard titulo="Eventos" valor={totalEvents} />
          <KpiCard titulo="Concluídas Hoje" valor={completedToday} />
          <KpiCard titulo="Meta Semanal" valor={weeklyProgress} descricao="Progresso semanal" />
        </section>

        {loading ? (
          <div className="dashboard-loading">Carregando dados...</div>
        ) : (
          <section className="grid-main" aria-label="Conteúdo principal">
            <SectionCard titulo="Suas Matérias">
              {subjects.length === 0 ? (
                <div className="empty-message">
                  Nenhuma matéria cadastrada. <a href="/subjects">Criar matéria</a>
                </div>
              ) : (
                <div className="subjects-list">
                  {subjects.slice(0, 5).map(subject => (
                    <SubjectItem key={subject.id} subject={subject} />
                  ))}
                  {subjects.length > 5 && (
                    <div className="view-more">
                      <a href="/subjects">Ver todas ({subjects.length})</a>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard titulo="Todos os Eventos">
              {events.length === 0 ? (
                <div className="empty-message">
                  Nenhum evento criado. <a href="/calendar">Criar evento</a>
                </div>
              ) : (
                <div className="tasks-list">
                  {events.slice(0, 5).map(event => (
                    <TaskItem key={event.id} event={event} />
                  ))}
                  {events.length > 5 && (
                    <div className="view-more">
                      <a href="/calendar">Ver todos ({events.length})</a>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard titulo="Próximas Tarefas">
              {upcomingEvents.length === 0 ? (
                <div className="empty-message">
                  Nenhuma tarefa próxima agendada.
                </div>
              ) : (
                <div className="tasks-list">
                  {upcomingEvents.map(event => (
                    <TaskItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </SectionCard>
          </section>
        )}
      </main>
    </div>
  );
}
