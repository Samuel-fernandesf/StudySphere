import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Trophy, Volume2, VolumeX, Settings, BookOpen } from 'lucide-react';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { listarMaterias } from '../../services/subjectService';
import { criarSessaoEstudo } from '../../services/pomodoroService';
import { useModal } from '../../contexts/ModalContext';
import './PomodoroPage.css';

const PomodoroPage = () => {
    const {
        mode,
        timeLeft,
        isRunning,
        sessionsCompleted,
        totalFocusTime,
        soundEnabled,
        selectedSubject,
        customDurations,
        pendingSession,
        TIMER_MODES,
        toggleTimer,
        resetTimer,
        switchMode,
        setSoundEnabled,
        setSelectedSubject,
        updateDurations,
        clearPendingSession,
        resetStats,
        formatTime,
        getProgress
    } = usePomodoro();

    const [showSettings, setShowSettings] = useState(false);
    const [materias, setMaterias] = useState([]);
    const [carregandoMaterias, setCarregandoMaterias] = useState(true);
    const [localDurations, setLocalDurations] = useState(customDurations);

    const { showAlert } = useModal();

    // Load subjects
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
    }, []);

    // Sync local durations with context
    useEffect(() => {
        setLocalDurations(customDurations);
    }, [customDurations]);

    // Save pending session to backend
    useEffect(() => {
        const savePendingSession = async () => {
            if (pendingSession) {
                try {
                    await criarSessaoEstudo(
                        pendingSession.subjectId,
                        pendingSession.durationMinutes,
                        pendingSession.notes
                    );
                    showAlert(
                        `Pomodoro de ${pendingSession.durationMinutes} minutos registrado!`,
                        'success',
                        'Sessão Salva'
                    );
                } catch (error) {
                    console.error('Erro ao salvar sessão:', error);
                } finally {
                    clearPendingSession();
                }
            }
        };
        savePendingSession();
    }, [pendingSession, clearPendingSession, showAlert]);

    const handleSubjectChange = (e) => {
        const subjectId = e.target.value;
        if (subjectId === '') {
            setSelectedSubject(null);
        } else {
            const subject = materias.find(m => m.id === parseInt(subjectId));
            setSelectedSubject(subject);
        }
    };

    const handleDurationChange = (timerMode, value) => {
        const newValue = Math.max(1, Math.min(60, parseInt(value) || 1));
        setLocalDurations(prev => ({ ...prev, [timerMode]: newValue }));
    };

    const saveDurations = () => {
        updateDurations(localDurations);
        setShowSettings(false);
    };

    const formatTotalTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const circumference = 2 * Math.PI * 140;
    const strokeDashoffset = circumference - (getProgress() / 100) * circumference;

    return (
        <div className="pomodoro-page">
            {/* Header */}
            <div className="pomodoro-header">
                <div>
                    <h1>Pomodoro Timer</h1>
                    <p>Mantenha o foco e aumente sua produtividade</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Som ativado' : 'Som desativado'}
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button
                        className="settings-toggle"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Configurações"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Subject Selector */}
            <div className="subject-selector">
                <BookOpen size={20} />
                <label>Estudando:</label>
                <select
                    value={selectedSubject?.id || ''}
                    onChange={handleSubjectChange}
                    disabled={carregandoMaterias || isRunning}
                    className="subject-select"
                >
                    <option value="">Selecione uma matéria (opcional)</option>
                    {materias.map((mat) => (
                        <option key={mat.id} value={mat.id}>{mat.name}</option>
                    ))}
                </select>
                {selectedSubject && (
                    <span className="selected-subject-badge">{selectedSubject.name}</span>
                )}
            </div>

            <div className="pomodoro-content">
                {/* Timer Section */}
                <div className="timer-section">
                    {/* Mode Selector */}
                    <div className="mode-selector">
                        <button
                            className={`mode-btn ${mode === 'WORK' ? 'active' : ''}`}
                            onClick={() => switchMode('WORK')}
                            disabled={isRunning}
                        >
                            <Brain size={18} />
                            Foco
                        </button>
                        <button
                            className={`mode-btn ${mode === 'SHORT_BREAK' ? 'active' : ''}`}
                            onClick={() => switchMode('SHORT_BREAK')}
                            disabled={isRunning}
                        >
                            <Coffee size={18} />
                            Pausa Curta
                        </button>
                        <button
                            className={`mode-btn ${mode === 'LONG_BREAK' ? 'active' : ''}`}
                            onClick={() => switchMode('LONG_BREAK')}
                            disabled={isRunning}
                        >
                            <Coffee size={18} />
                            Pausa Longa
                        </button>
                    </div>

                    {/* Circular Timer */}
                    <div className="timer-container">
                        <svg className="timer-svg" viewBox="0 0 320 320">
                            <circle
                                cx="160"
                                cy="160"
                                r="140"
                                fill="none"
                                stroke="#e0e0e0"
                                strokeWidth="12"
                            />
                            <circle
                                cx="160"
                                cy="160"
                                r="140"
                                fill="none"
                                stroke={TIMER_MODES[mode].color}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 160 160)"
                                className="progress-circle"
                            />
                        </svg>
                        <div className="timer-display">
                            <span className="timer-mode-label">{TIMER_MODES[mode].name}</span>
                            <span className="timer-time">{formatTime(timeLeft)}</span>
                            <span className="timer-session">Sessão {sessionsCompleted + 1}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="timer-controls">
                        <button
                            className="control-btn reset-btn"
                            onClick={resetTimer}
                            title="Reiniciar"
                        >
                            <RotateCcw size={24} />
                        </button>
                        <button
                            className={`control-btn play-btn ${isRunning ? 'running' : ''}`}
                            onClick={toggleTimer}
                        >
                            {isRunning ? <Pause size={32} /> : <Play size={32} />}
                        </button>
                        <div className="control-spacer"></div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="stats-sidebar">
                    {/* Today's Stats */}
                    <div className="stats-card">
                        <div className="stats-header">
                            <Trophy size={20} />
                            <h3>Suas Estatísticas</h3>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{sessionsCompleted}</span>
                                <span className="stat-label">Pomodoros</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{formatTotalTime(totalFocusTime)}</span>
                                <span className="stat-label">Tempo de Foco</span>
                            </div>
                        </div>
                        <button className="reset-stats-btn" onClick={resetStats}>
                            Resetar Estatísticas
                        </button>
                    </div>

                    {/* Current Subject */}
                    {selectedSubject && (
                        <div className="current-subject-card">
                            <h3>Matéria Atual</h3>
                            <span className="subject-name">{selectedSubject.name}</span>
                            <p className="subject-info">
                                Os pomodoros completados serão registrados no seu progresso de estudos.
                            </p>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="tips-card">
                        <h3>Dica do Pomodoro</h3>
                        <p>
                            Selecione uma matéria antes de iniciar para registrar seu tempo de estudo automaticamente!
                        </p>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="settings-card">
                            <h3>    Configurações</h3>
                            <div className="duration-settings">
                                <div className="duration-item">
                                    <label>Foco (min)</label>
                                    <input
                                        type="number"
                                        value={localDurations.WORK}
                                        onChange={(e) => handleDurationChange('WORK', e.target.value)}
                                        min="1"
                                        max="60"
                                    />
                                </div>
                                <div className="duration-item">
                                    <label>Pausa Curta (min)</label>
                                    <input
                                        type="number"
                                        value={localDurations.SHORT_BREAK}
                                        onChange={(e) => handleDurationChange('SHORT_BREAK', e.target.value)}
                                        min="1"
                                        max="30"
                                    />
                                </div>
                                <div className="duration-item">
                                    <label>Pausa Longa (min)</label>
                                    <input
                                        type="number"
                                        value={localDurations.LONG_BREAK}
                                        onChange={(e) => handleDurationChange('LONG_BREAK', e.target.value)}
                                        min="1"
                                        max="60"
                                    />
                                </div>
                            </div>
                            <button className="save-settings-btn" onClick={saveDurations}>
                                Salvar Configurações
                            </button>
                        </div>
                    )}

                    {/* Progress Indicator */}
                    <div className="progress-card">
                        <h3> Progresso da Meta</h3>
                        <div className="daily-goal">
                            <div className="goal-bar">
                                <div
                                    className="goal-progress"
                                    style={{ width: `${Math.min((sessionsCompleted / 8) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="goal-text">{sessionsCompleted}/8 pomodoros hoje</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;
