import React, { useState, useEffect } from "react";
import { Clock, TrendingUp, Target, Award, Plus } from "lucide-react";
import { obterResumoProgresso } from "../../services/progressService";
import StudySessionModal from "../../components/progress/StudySessionModal";
import { useModal } from "../../contexts/ModalContext"; // Importando o contexto
import "./Progress.css";

export default function ProgressView() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Hook do modal global (caso precise usar showAlert no futuro)
  const { showAlert } = useModal();

  useEffect(() => {
    loadProgressData();
  }, []);

  async function loadProgressData() {
    try {
      setLoading(true);
      const data = await obterResumoProgresso();
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

  if (loading) {
    return (
      <main className="progress-page">
        <div className="progress-loading">Carregando dados de progresso...</div>
      </main>
    );
  }

  const weeklyGoal = progressData?.weekly_goal || { total_hours: 0, goal_hours: 20, progress_percentage: 0 };
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
            <div className="kpi-label">Média Diária</div>
            <div className="kpi-value">{progressData?.daily_average?.average_hours || 0}h</div>
          </div>
        </div>
      </div>

      {/* Meta da Semana */}
      <div className="weekly-goal-section">
        <div className="section-header-inline">
          <div className="section-icon">
            <Target size={20} />
          </div>
          <div>
            <h3 className="section-title">Meta da Semana</h3>
            <p className="section-subtitle">Progresso para sua meta semanal de {weeklyGoal.goal_hours} horas</p>
          </div>
        </div>
        <div className="goal-progress">
          <div className="goal-stats">
            <span className="goal-current">{weeklyGoal.total_hours}h de {weeklyGoal.goal_hours}h</span>
            <span className="goal-percentage">{Math.round(weeklyGoal.progress_percentage)}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min(weeklyGoal.progress_percentage, 100)}%` }}
            ></div>
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
    </main>
  );
}