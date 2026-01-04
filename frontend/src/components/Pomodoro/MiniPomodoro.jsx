import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import './MiniPomodoro.css';

const MiniPomodoro = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        isRunning,
        timeLeft,
        mode,
        toggleTimer,
        formatTime,
        getProgress,
        TIMER_MODES
    } = usePomodoro();

    // Don't show on pomodoro page
    if (location.pathname === '/pomodoro') {
        return null;
    }

    // Only show if timer is actively running
    if (!isRunning) {
        return null;
    }

    const circumference = 2 * Math.PI * 22;
    const strokeDashoffset = circumference - (getProgress() / 100) * circumference;

    const goToPomodoro = () => {
        navigate('/pomodoro');
    };

    return (
        <div className={`mini-pomodoro ${isRunning ? 'running' : 'paused'}`}>
            <div className="mini-timer-ring">
                <svg viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="22"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                    />
                    <circle
                        cx="25"
                        cy="25"
                        r="22"
                        fill="none"
                        stroke={TIMER_MODES[mode].color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 25 25)"
                        className="progress-ring"
                    />
                </svg>
                <span className="mini-time">{formatTime(timeLeft)}</span>
            </div>

            <div className="mini-controls">
                <button
                    className="mini-btn play-pause"
                    onClick={toggleTimer}
                    title={isRunning ? 'Pausar' : 'Continuar'}
                >
                    {isRunning ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                    className="mini-btn expand"
                    onClick={goToPomodoro}
                    title="Expandir"
                >
                    <Maximize2 size={14} />
                </button>
            </div>
        </div>
    );
};

export default MiniPomodoro;
