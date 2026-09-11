// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { useAuthContext } from "../../contexts/AuthContext";
import { listarMaterias } from "../../services/subjectService";
import { listarEventos } from "../../services/eventService";
import { listarTarefas } from "../../services/taskService";
import { obterMetaSemanal } from "../../services/progressService";
import { listarQuizzes } from "../../services/quizService";
import * as Icons from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
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

const isScheduleGeneratedEvent = (event) => {
  const description = event.description || "";
  return (
    description.includes("[STUDYSPHERE_SCHEDULE]") ||
    description.includes("Gerado pelo criador de cronograma personalizado.")
  );
};

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

// Componente genérico para listar Tarefa ou Evento
const ListItem = ({ item, isTask }) => {
  // Tenta parsear a data, fallback para data atual se falhar
  let dateObj = new Date();
  try {
    if (item.date) dateObj = parseISO(item.date);
  } catch (e) {
    console.error("Data inválida", e);
  }

  const formattedDate = format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <div className="task-item">
      <div
        className="task-indicator"
        style={{ backgroundColor: item.color || '#3b82f6' }}
      />
      <div className="task-content">
        <div className="task-title">{item.title}</div>
        <div className="task-date">
          {isTask ? "Prazo: " : ""}{formattedDate}
        </div>
      </div>
    </div>
  );
};

/* --- Componente principal do Dashboard --- */
export default function Dashboard() {
  const { userDetails } = useAuthContext();
  const navigate = useNavigate();

  // Estados para dados principais
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Estados para KPIs
  const [completedToday, setCompletedToday] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(null);

  const [loading, setLoading] = useState(true);

  const primeiroNome = userDetails?.nome_completo
    ? userDetails.nome_completo.split(" ")[0]
    : userDetails?.username || "";

  // Carregar dados ao montar o componente
  // Como o registro de estudo é em outra página, ao voltar para cá (mount),
  // os dados serão recarregados e a meta atualizada.
  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // 1. Carregar matérias
      const subjectsData = await listarMaterias();
      setSubjects(subjectsData);

      // 2. Carregar eventos (sem filtro de data para trazer todos, conforme pedido)
      const eventsData = await listarEventos();
      const dashboardEvents = eventsData.filter((event) => !isScheduleGeneratedEvent(event));
      // Ordenar por data (mais recente primeiro ou mais próximo)
      const sortedEvents = dashboardEvents.sort((a, b) =>
        new Date(a.start_date) - new Date(b.start_date)
      );
      setEvents(sortedEvents);

      // 3. Carregar tarefas pendentes para exibir na lista
      const tasksData = await listarTarefas(null, false); // false = não concluídas
      setTasks(tasksData);

      // 4. Calcular KPI: Tarefas concluídas hoje
      // Buscamos as concluídas (true) e filtramos no front pela data de hoje
      const completedTasksData = await listarTarefas(null, true);
      const today = new Date();

      const countToday = completedTasksData.filter(t => {
        if (!t.completed_at) return false;
        return isSameDay(parseISO(t.completed_at), today);
      }).length;

      setCompletedToday(countToday);

      // 5. Carregar Meta Semanal
      const goalData = await obterMetaSemanal();
      setWeeklyGoal(goalData);

      // 6. Carregar Questionários
      try {
        const quizzesData = await listarQuizzes();
        setQuizzes(quizzesData || []);
      } catch (quizErr) {
        console.error("Erro ao carregar questionários:", quizErr);
      }

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  // Helpers para formatar dados para a visualização
  const getSubjectColor = (subjectId) => {
    const subj = subjects.find(s => String(s.id) === String(subjectId));
    return subj ? subj.color : "#94a3b8"; // cinza default se não achar
  };

  // KPIs
  const totalSubjects = subjects.length;
  const totalEvents = events.length;
  const progressPercent = weeklyGoal ? Math.round(weeklyGoal.progress_percentage) : 0;
  const progressDesc = weeklyGoal
    ? `${weeklyGoal.current_hours}h de ${weeklyGoal.goal_hours}h`
    : "Carregando...";

  function handleNovoEvento() {
    window.location.href = "/cronograma/calendario";
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
          <button className="btn" onClick={handleNovoEvento}>+ Novo Evento</button>
        </div>
      </header>

      <main className="dashboard-right">
        {/* KPIs */}
        <section className="kpi-row" aria-label="Indicadores">
          <KpiCard titulo="Matérias" valor={totalSubjects} />
          <KpiCard titulo="Eventos" valor={totalEvents} />
          <KpiCard titulo="Concluídas Hoje" valor={completedToday} />
          <KpiCard
            titulo="Meta Semanal"
            valor={`${progressPercent}%`}
            descricao='de 20h'
          />
        </section>

        {loading ? (
          <div className="dashboard-loading">Carregando dados...</div>
        ) : (
          <section className="grid-main" aria-label="Conteúdo principal">

            {/* 1. Suas Matérias */}
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

            {/* 2. Suas Tarefas (com cor da matéria) */}
            <SectionCard titulo="Suas Tarefas">
              {tasks.length === 0 ? (
                <div className="empty-message">
                  Nenhuma tarefa pendente. <a href="/tasks">Criar tarefa</a>
                </div>
              ) : (
                <div className="tasks-list">
                  {tasks.slice(0, 5).map(task => (
                    <ListItem
                      key={task.id}
                      isTask={true}
                      item={{
                        title: task.title,
                        date: task.due_date || task.created_at, // Usa prazo ou criação
                        color: task.subject?.color || getSubjectColor(task.subject_id)
                      }}
                    />
                  ))}
                  {tasks.length > 5 && (
                    <div className="view-more">
                      <a href="/tasks">Ver todas ({tasks.length})</a>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* 3. Seus Eventos */}
            <SectionCard titulo="Seus Eventos">
              {events.length === 0 ? (
                <div className="empty-message">
                  Nenhum evento criado. <a href="/cronograma/calendario">Criar evento</a>
                </div>
              ) : (
                <div className="tasks-list">
                  {events.slice(0, 5).map(event => (
                    <ListItem
                      key={event.id}
                      isTask={false}
                      item={{
                        title: event.title,
                        date: event.start_date,
                        color: event.color
                      }}
                    />
                  ))}
                  {events.length > 5 && (
                    <div className="view-more">
                      <a href="/cronograma/calendario">Ver todos ({events.length})</a>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* 4. Questionários */}
            <SectionCard titulo="Questionários">
              {quizzes.length === 0 ? (
                <div className="empty-message">
                  Nenhum questionário encontrado. <a href="/quiz/create">Criar questionário</a>
                </div>
              ) : (
                <div className="tasks-list">
                  {quizzes.slice(0, 5).map(quiz => (
                    <div
                      key={quiz.id}
                      className="quiz-dashboard-item"
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                    >
                      <div className="quiz-dashboard-info">
                        <div className="quiz-dashboard-title">{quiz.titulo}</div>
                        <div className="quiz-dashboard-meta">
                          {quiz.materia && (
                            <span className="quiz-tag-materia">
                              <Icons.BookOpen size={12} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
                              {quiz.materia}
                            </span>
                          )}
                          {quiz.dificuldade && (
                            <span className={`quiz-tag-diff ${quiz.dificuldade.toLowerCase()}`}>
                              {quiz.dificuldade}
                            </span>
                          )}
                          {quiz.total_questoes && (
                            <span className="quiz-tag-questions">
                              {quiz.total_questoes} {quiz.total_questoes === 1 ? 'questão' : 'questões'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="quiz-play-btn"
                        title="Responder questionário"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quiz/${quiz.id}`);
                        }}
                      >
                        <Icons.Play size={13} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                  <div className="view-more">
                    <a href="/quiz">Ver todos os questionários ({quizzes.length})</a>
                  </div>
                </div>
              )}
            </SectionCard>

          </section>
        )}
      </main>
    </div>
  );
}
