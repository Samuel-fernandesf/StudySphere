import React, { useState, useEffect } from "react";
import { Clock, TrendingUp, Target, Award, Plus } from "lucide-react";
import { obterResumoProgresso } from "../../services/progressService";
import StudySessionModal from "../../components/progress/StudySessionModal";
import "./Progress.css";

export default function ProgressView() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Preparar dados para o gráfico de barras (últimos 7 dias)
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const chartData = timeByDay.map((day, index) => {
    const date = new Date(day.date);
    const dayName = daysOfWeek[date.getDay()];
    return {
      day: dayName,
      hours: day.total_hours,
      date: day.date
    };
  });

  // Calcular máximo para escala do gráfico
  const maxHours = Math.max(...chartData.map(d => d.hours), 8);

  // Calcular total de horas para distribuição por matéria
  const totalSubjectHours = timeBySubject.reduce((sum, s) => sum + s.total_hours, 0);

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
            <span className="goal-percentage">{weeklyGoal.progress_percentage}%</span>
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
        {/* Horas da Semana */}
        <div className="chart-card">
          <h3 className="chart-title">Horas da Semana</h3>
          <p className="chart-subtitle">Distribuição de estudos nos últimos 7 dias</p>
          <div className="bar-chart">
            {chartData.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${(item.hours / maxHours) * 100}%`,
                      minHeight: item.hours > 0 ? '10px' : '0'
                    }}
                    title={`${item.hours}h`}
                  ></div>
                </div>
                <div className="bar-label">{item.day}</div>
              </div>
            ))}
          </div>
          <div className="chart-y-axis">
            <span>{maxHours}</span>
            <span>{Math.round(maxHours / 2)}</span>
            <span>0</span>
          </div>
        </div>

        {/* Distribuição por Matéria */}
        <div className="chart-card">
          <h3 className="chart-title">Distribuição por Matéria</h3>
          <p className="chart-subtitle">Tempo dedicado a cada disciplina este mês</p>
          
          {timeBySubject.length === 0 ? (
            <div className="chart-empty">
              <p>Nenhum dado de estudo registrado ainda.</p>
              <button onClick={() => setIsModalOpen(true)} className="empty-action-button">
                Registrar primeira sessão
              </button>
            </div>
          ) : (
            <>
              <div className="donut-chart">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  {timeBySubject.map((subject, index) => {
                    const percentage = (subject.total_hours / totalSubjectHours) * 100;
                    const angle = (percentage / 100) * 360;
                    
                    // Calcular ângulos acumulados
                    let startAngle = 0;
                    for (let i = 0; i < index; i++) {
                      const prevPercentage = (timeBySubject[i].total_hours / totalSubjectHours) * 100;
                      startAngle += (prevPercentage / 100) * 360;
                    }
                    
                    const endAngle = startAngle + angle;
                    
                    // Converter ângulos para coordenadas
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);
                    
                      const innerRadius = 60;
                      const outerRadius = 90;
                      const centerX = 100;
                      const centerY = 100;
                      
                      const x1_outer = centerX + outerRadius * Math.cos(startRad);
                      const y1_outer = centerY + outerRadius * Math.sin(startRad);
                      const x2_outer = centerX + outerRadius * Math.cos(endRad);
                      const y2_outer = centerY + outerRadius * Math.sin(endRad);
                      
                      const x1_inner = centerX + innerRadius * Math.cos(endRad);
                      const y1_inner = centerY + innerRadius * Math.sin(endRad);
                      const x2_inner = centerX + innerRadius * Math.cos(startRad);
                      const y2_inner = centerY + innerRadius * Math.sin(startRad);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M ${x1_outer} ${y1_outer}`,
                        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2_outer} ${y2_outer}`,
                        `L ${x1_inner} ${y1_inner}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2_inner} ${y2_inner}`,
                        `Z`
                      ].join(' ');
                    
                    return (
                      <path
                        key={index}
                        d={pathData}
                        fill={subject.color || '#3b82f6'}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
              </div>
              
              <div className="subject-legend">
                {timeBySubject.map((subject, index) => (
                  <div key={index} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: subject.color || '#3b82f6' }}
                    ></div>
                    <div className="legend-content">
                      <span className="legend-name">{subject.subject_name}</span>
                      <span className="legend-value">{subject.total_hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <StudySessionModal onClose={handleModalClose} />
      )}
    </main>
  );
}
