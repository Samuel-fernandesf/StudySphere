import React, { useState, useEffect } from "react";
import { Clock, TrendingUp, Target, Award, Plus, Pencil } from "lucide-react";
import { obterResumoProgresso, obterMetaSemanal } from "../../services/progressService";
import {
  getActiveScheduleStudyGoals,
  subscribeToScheduleChanges,
  updateActiveScheduleWeeklyHours,
} from "../../services/scheduleStorage";
import StudySessionModal from "../../components/progress/StudySessionModal";
import EditWeeklyGoalModal from "../../components/progress/EditWeeklyGoalModal";
import { useModal } from "../../contexts/ModalContext"; // Importando o contexto
import "./Progress.css";

export default function ProgressView() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [activeScheduleGoal, setActiveScheduleGoal] = useState(() => getActiveScheduleStudyGoals());
  const [todayStudiedHours, setTodayStudiedHours] = useState(0);
  
  // Hook do modal global (caso precise usar showAlert no futuro)
  const { showAlert } = useModal();

  useEffect(() => {
    loadProgressData();
    return subscribeToScheduleChanges(() => {
      loadProgressData();
    });
  }, []);

  async function loadProgressData() {
    try {
      setLoading(true);
      const data = await obterResumoProgresso();
      const scheduleGoal = getActiveScheduleStudyGoals();
      setActiveScheduleGoal(scheduleGoal);

      const savedGoal = localStorage.getItem("study_weekly_goal_hours");
      const targetWeeklyHours = scheduleGoal
        ? scheduleGoal.weeklyHours
        : (savedGoal ? parseFloat(savedGoal) : 20);

      if (data) {
        try {
          const customGoalData = await obterMetaSemanal(targetWeeklyHours);
          data.weekly_goal = customGoalData;
        } catch (e) {
          const total = data.weekly_goal?.total_hours || 0;
          data.weekly_goal = {
            total_hours: total,
            goal_hours: targetWeeklyHours,
            progress_percentage: Math.min(100, (total / targetWeeklyHours) * 100),
            remaining_hours: Math.max(0, targetWeeklyHours - total)
          };
        }

        const todayStr = new Date().toISOString().split("T")[0];
        const todayMatch = (data.time_by_day || []).find((item) => item.date === todayStr);
        setTodayStudiedHours(todayMatch ? Number(todayMatch.total_hours) : 0);
      }
      setProgressData(data);
    } catch (error) {
      console.error("Erro ao carregar dados de progresso:", error);
      // Opcional: showAlert("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    loadProgressData();
  }

  async function handleSaveGoal(newHours) {
    const hoursNum = parseFloat(newHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      await showAlert("Por favor, insira um número válido de horas (maior que zero).", "warning");
      return;
    }

    try {
      localStorage.setItem("study_weekly_goal_hours", hoursNum.toString());
      updateActiveScheduleWeeklyHours(hoursNum);
      const updatedWeeklyGoal = await obterMetaSemanal(hoursNum);
      setProgressData((prev) => ({
        ...prev,
        weekly_goal: updatedWeeklyGoal,
      }));
      setIsGoalModalOpen(false);
      await showAlert(`Meta semanal alterada para ${hoursNum} horas!`, "success", "Meta Atualizada");
    } catch (error) {
      console.error("Erro ao atualizar meta semanal:", error);
      setProgressData((prev) => {
        const total = prev?.weekly_goal?.total_hours || 0;
        return {
          ...prev,
          weekly_goal: {
            total_hours: total,
            goal_hours: hoursNum,
            progress_percentage: Math.min(100, (total / hoursNum) * 100),
            remaining_hours: Math.max(0, hoursNum - total),
          },
        };
      });
      setIsGoalModalOpen(false);
      await showAlert(`Meta semanal alterada para ${hoursNum}h!`, "success", "Meta Atualizada");
    }
  }

  if (loading) {
    return (
      <main className="progress-page">
        <div className="progress-loading">Carregando dados de progresso...</div>
      </main>
    );
  }

  const weeklyGoal = progressData?.weekly_goal || { total_hours: 0, goal_hours: 20, progress_percentage: 0 };
  const isCompleted = weeklyGoal.progress_percentage >= 100;
  const isNear = weeklyGoal.progress_percentage >= 75 && !isCompleted;
  const timeByDay = progressData?.time_by_day || [];
  const timeBySubject = progressData?.time_by_subject || [];

  // --- CORREÇÃO DO GRÁFICO DE BARRAS ---
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const chartData = timeByDay.map((day) => {
    // Corrige problema de fuso horário criando a data com "T00:00:00" localmente
    // ou apenas pegando o dia da string se ela for "YYYY-MM-DD"
    const [year, month, dayNum] = day.date.split('-');
    const date = new Date(year, month - 1, dayNum); 
    
    const dayName = daysOfWeek[date.getDay()];
    
    return {
      day: dayName,
      hours: parseFloat(day.total_hours), // Garante que é número
      date: day.date
    };
  });

  const maxHours = Math.max(...chartData.map(d => d.hours), 1); 

  // --- PREPARAÇÃO DO GRÁFICO DE PIZZA (DONUT) ---
  const totalSubjectHours = timeBySubject.reduce((sum, s) => sum + Number(s.total_hours), 0);

  const defaultColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  const timeBySubjectWithColors = timeBySubject.map((subject, index) => ({
    ...subject,
    total_hours: Number(subject.total_hours),
    color: subject.color || defaultColors[index % defaultColors.length]
  }));

  // Função auxiliar para criar path do arco
  const createArc = (x, y, radius, startAngle, endAngle) => {
    // Se for círculo completo (muito próximo de 360)
    if (endAngle - startAngle >= 359.9) {
        endAngle = startAngle + 359.99;
    }

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const x1 = x + radius * Math.cos(endRad);
    const y1 = y + radius * Math.sin(endRad);
    const x2 = x + radius * Math.cos(startRad);
    const y2 = y + radius * Math.sin(startRad);

    return [
        "M", x, y,
        "L", x1, y1,
        "A", radius, radius, 0, largeArcFlag, 0, x2, y2,
        "Z"
    ].join(" ");
  };

  // Função para criar o path do Donut (com buraco no meio)
  const createDonutSlice = (centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) => {
    // Ajuste para círculo completo
    if (endAngle - startAngle >= 359.9) {
      // Desenha dois arcos de 180 para evitar falhas de renderização em alguns browsers
      const halfAngle = startAngle + 180;
      return createDonutSlice(centerX, centerY, innerRadius, outerRadius, startAngle, halfAngle) + " " +
             createDonutSlice(centerX, centerY, innerRadius, outerRadius, halfAngle, endAngle);
    }

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    // Pontos externos
    const x1_out = centerX + outerRadius * Math.cos(startRad);
    const y1_out = centerY + outerRadius * Math.sin(startRad);
    const x2_out = centerX + outerRadius * Math.cos(endRad);
    const y2_out = centerY + outerRadius * Math.sin(endRad);

    // Pontos internos
    const x1_in = centerX + innerRadius * Math.cos(endRad);
    const y1_in = centerY + innerRadius * Math.sin(endRad);
    const x2_in = centerX + innerRadius * Math.cos(startRad);
    const y2_in = centerY + innerRadius * Math.sin(startRad);

    return [
      `M ${x1_out} ${y1_out}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2_out} ${y2_out}`,
      `L ${x1_in} ${y1_in}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2_in} ${y2_in}`,
      `Z`
    ].join(" ");
  };

  return (
    <main className="progress-page">
      <div className="progress-header">
        <div>
          <h2 className="progress-title">Progresso dos Estudos</h2>
          <p className="progress-subtitle">Acompanhe seu desempenho e conquistas</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="register-study-button">
          <Plus size={18} />
          Registrar Estudo
        </button>
      </div>

      {/* KPIs */}
      <div className="progress-kpis">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <Clock size={24} color="#4f46e5" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total de Horas</div>
            <div className="kpi-value">{progressData?.total_hours || 0}h</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7' }}>
            <TrendingUp size={24} color="#f59e0b" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Sequência Atual</div>
            <div className="kpi-value">{progressData?.current_streak || 0} dias</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5' }}>
            <Target size={24} color="#10b981" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Tarefas Concluídas</div>
            <div className="kpi-value">{progressData?.completed_tasks || 0}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dbeafe' }}>
            <Award size={24} color="#3b82f6" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">{activeScheduleGoal ? "Média (Meta Diária)" : "Média Diária"}</div>
            <div className="kpi-value">
              {progressData?.daily_average?.average_hours || 0}h
              {activeScheduleGoal && (
                <span className="kpi-sub-target"> / {activeScheduleGoal.dailyHours}h meta</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meta da Semana */}
      <div className="weekly-goal-section">
        <div className="weekly-goal-header">
          <div className="weekly-goal-title-group">
            <div className="weekly-goal-icon">
              <Target size={22} />
            </div>
            <div>
              <div className="weekly-goal-title-row">
                <h3 className="weekly-goal-title">Meta da Semana</h3>
                {activeScheduleGoal && (
                  <span className="weekly-goal-schedule-tag">
                    Cronograma: {activeScheduleGoal.title} ({activeScheduleGoal.weeklyHours}h/sem • {activeScheduleGoal.dailyHours}h/dia)
                  </span>
                )}
                <span className={`weekly-goal-badge ${isCompleted ? 'completed' : isNear ? 'near' : 'active'}`}>
                  {isCompleted ? '🎉 Meta Atingida!' : isNear ? '🔥 Quase Lá!' : '🎯 Em Andamento'}
                </span>
              </div>
              <p className="weekly-goal-subtitle">
                {isCompleted 
                  ? `Parabéns! Você atingiu sua meta de ${weeklyGoal.goal_hours} horas desta semana!`
                  : `Progresso para sua meta semanal de ${weeklyGoal.goal_hours} horas de dedicação`
                }
              </p>
            </div>
          </div>
          
          <button 
            type="button" 
            className="edit-goal-button"
            onClick={() => setIsGoalModalOpen(true)}
            title="Alterar meta semanal de horas"
          >
            <Pencil size={15} />
            <span>Alterar Meta</span>
          </button>
        </div>

        {/* Estatísticas resumidas da meta */}
        <div className={`weekly-goal-stats-grid ${activeScheduleGoal ? "with-daily" : ""}`}>
          {activeScheduleGoal && (
            <div className="goal-stat-item daily-stat">
              <span className="goal-stat-label">Hoje (Meta Diária)</span>
              <span className="goal-stat-value primary">
                {todayStudiedHours}h <small>/ {activeScheduleGoal.dailyHours}h</small>
              </span>
            </div>
          )}
          <div className="goal-stat-item">
            <span className="goal-stat-label">Concluído Semana</span>
            <span className="goal-stat-value primary">{weeklyGoal.total_hours}h</span>
          </div>
          <div className="goal-stat-item">
            <span className="goal-stat-label">Meta Semanal</span>
            <span className="goal-stat-value">{weeklyGoal.goal_hours}h</span>
          </div>
          <div className="goal-stat-item">
            <span className="goal-stat-label">Restante</span>
            <span className="goal-stat-value highlight">
              {weeklyGoal.remaining_hours != null 
                ? `${weeklyGoal.remaining_hours}h` 
                : `${Math.max(0, (weeklyGoal.goal_hours - weeklyGoal.total_hours).toFixed(1))}h`}
            </span>
          </div>
          <div className="goal-stat-item">
            <span className="goal-stat-label">Progresso</span>
            <span className="goal-stat-value accent">
              {Math.round(weeklyGoal.progress_percentage)}%
            </span>
          </div>
        </div>

        {/* Barra de Progresso estilizada */}
        <div className="goal-progress-wrapper">
          <div className="goal-progress-bar-track">
            <div 
              className={`goal-progress-bar-fill ${isCompleted ? 'completed' : ''}`}
              style={{ width: `${Math.min(weeklyGoal.progress_percentage, 100)}%` }}
            >
              {weeklyGoal.progress_percentage >= 12 && (
                <span className="progress-bar-label-inner">
                  {Math.round(weeklyGoal.progress_percentage)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Horas da Semana</h3>
          <p className="chart-subtitle">Distribuição de estudos nos últimos 7 dias</p>
      
  <div className="bar-chart-container">
      {/* Eixo Y (Fundo) */}
      <div className="chart-y-axis-bg">
          <div className="y-line"><span>{Math.round(maxHours)}h</span></div>
          <div className="y-line"><span>{Math.round(maxHours / 2)}h</span></div>
          <div className="y-line"><span>0h</span></div>
      </div>

      {/* Barras */}
      <div className="bar-chart">
        {chartData.map((item, index) => {
          const heightPercent = (item.hours / maxHours) * 100;
          return (
            <div key={index} className="bar-column">
                <div className="bar-area">
                    <div 
                        className="bar" 
                        style={{ 
                          height: `${heightPercent}%`,
                          opacity: item.hours > 0 ? 1 : 0.1
                        }}
                        title={`${item.hours}h`}
                    ></div>
                </div>
                <div className="bar-label">{item.day}</div>
            </div>
          );
        })}
      </div>
  </div>
</div>

        {/* Distribuição por Matéria - CORRIGIDO (Donut Chart) */}
        <div className="chart-card">
          <h3 className="chart-title">Distribuição por Matéria</h3>
          <p className="chart-subtitle">Tempo dedicado a cada disciplina este mês</p>
          
          {timeBySubjectWithColors.length === 0 || totalSubjectHours === 0 ? (
            <div className="chart-empty">
              <p>Nenhum dado de estudo registrado ainda.</p>
              <button onClick={() => setIsModalOpen(true)} className="empty-action-button">
                Registrar primeira sessão
              </button>
            </div>
          ) : (
            <div className="chart-content-row">
              <div className="donut-chart-wrapper">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  {timeBySubjectWithColors.map((subject, index) => {
                    const percentage = (subject.total_hours / totalSubjectHours) * 100;
                    const angle = (percentage / 100) * 360;
                    
                    // Calcular ângulo inicial acumulado
                    let startAngle = 0;
                    for (let i = 0; i < index; i++) {
                      const prevPerc = (timeBySubjectWithColors[i].total_hours / totalSubjectHours) * 100;
                      startAngle += (prevPerc / 100) * 360;
                    }
                    
                    const endAngle = startAngle + angle;
                    
                    // Se a fatia for muito pequena, não renderiza ou renderiza mínimo
                    if (angle <= 0) return null;

                    const pathData = createDonutSlice(100, 100, 60, 90, startAngle, endAngle);
                    
                    return (
                      <path
                        key={`donut-segment-${index}`}
                        d={pathData}
                        fill={subject.color}
                        stroke="#fff"
                        strokeWidth="2"
                        className="donut-segment"
                      >
                        <title>{`${subject.subject_name}: ${subject.total_hours}h (${percentage.toFixed(1)}%)`}</title>
                      </path>
                    );
                  })}
                  
                  {/* Texto central opcional */}
                  <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b">
                    {totalSubjectHours}h
                  </text>
                  <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#64748b">
                    Total
                  </text>
                </svg>
              </div>
              
              <div className="subject-legend">
                {timeBySubjectWithColors.map((subject, index) => {
                  const percentage = ((subject.total_hours / totalSubjectHours) * 100).toFixed(1);
                  if (subject.total_hours === 0) return null; // Oculta legenda de quem tem 0h

                  return (
                    <div key={`legend-${index}`} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <div className="legend-content">
                        <span className="legend-name">{subject.subject_name}</span>
                        <span className="legend-value">{subject.total_hours}h ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <StudySessionModal onClose={handleModalClose} />
      )}

      {isGoalModalOpen && (
        <EditWeeklyGoalModal
          isOpen={isGoalModalOpen}
          currentGoal={weeklyGoal.goal_hours}
          onClose={() => setIsGoalModalOpen(false)}
          onSave={handleSaveGoal}
        />
      )}
    </main>
  );
}