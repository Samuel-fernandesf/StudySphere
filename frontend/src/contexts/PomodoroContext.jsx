import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const PomodoroContext = createContext();

const TIMER_MODES = {
    WORK: { name: 'Foco', duration: 25 * 60, color: '#2c3e50' },
    SHORT_BREAK: { name: 'Pausa Curta', duration: 5 * 60, color: '#27ae60' },
    LONG_BREAK: { name: 'Pausa Longa', duration: 15 * 60, color: '#3498db' }
};

export function PomodoroProvider({ children }) {
    const [mode, setMode] = useState('WORK');
    const [timeLeft, setTimeLeft] = useState(TIMER_MODES.WORK.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [customDurations, setCustomDurations] = useState({
        WORK: 25,
        SHORT_BREAK: 5,
        LONG_BREAK: 15
    });
    const [pendingSession, setPendingSession] = useState(null);

    const intervalRef = useRef(null);
    const sessionStartTimeRef = useRef(null);

    // Carrega configurações do localStorage
    useEffect(() => {
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            setSessionsCompleted(stats.sessionsCompleted || 0);
            setTotalFocusTime(stats.totalFocusTime || 0);
        }

        const savedDurations = localStorage.getItem('pomodoroDurations');
        if (savedDurations) {
            const durations = JSON.parse(savedDurations);
            setCustomDurations(durations);
            setTimeLeft(durations.WORK * 60);
        }

        const savedState = localStorage.getItem('pomodoroState');
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.isRunning && state.endTime) {
                const remaining = Math.max(0, Math.floor((state.endTime - Date.now()) / 1000));
                if (remaining > 0) {
                    setMode(state.mode);
                    setTimeLeft(remaining);
                    setIsRunning(true);
                    setSelectedSubject(state.selectedSubject);
                    sessionStartTimeRef.current = state.sessionStartTime;
                }
            }
        }
    }, []);

    // Salva estatísticas no localStorage
    useEffect(() => {
        localStorage.setItem('pomodoroStats', JSON.stringify({
            sessionsCompleted,
            totalFocusTime
        }));
    }, [sessionsCompleted, totalFocusTime]);

    // Salva estado de execução no localStorage
    useEffect(() => {
        if (isRunning) {
            const endTime = Date.now() + (timeLeft * 1000);
            localStorage.setItem('pomodoroState', JSON.stringify({
                isRunning: true,
                endTime,
                mode,
                selectedSubject,
                sessionStartTime: sessionStartTimeRef.current
            }));
        } else {
            localStorage.removeItem('pomodoroState');
        }
    }, [isRunning, timeLeft, mode, selectedSubject]);

    const playSound = useCallback(() => {
        if (soundEnabled) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;

                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    audioContext.close();
                }, 500);
            } catch (e) {
                console.warn('Audio not available');
            }
        }
    }, [soundEnabled]);

    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);
        playSound();

        if (mode === 'WORK') {
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);

            // Calcula a duração real da sessão
            const actualDuration = sessionStartTimeRef.current
                ? Math.floor((Date.now() - sessionStartTimeRef.current) / 60000)
                : customDurations.WORK;

            // Define sessão pendente para ser salva
            if (selectedSubject) {
                setPendingSession({
                    subjectId: selectedSubject.id,
                    durationMinutes: Math.max(actualDuration, 1),
                    notes: `Pomodoro #${newSessions}`
                });
            }

            // A cada 4 sessões, faz uma pausa longa
            if (newSessions % 4 === 0) {
                setMode('LONG_BREAK');
                setTimeLeft(customDurations.LONG_BREAK * 60);
            } else {
                setMode('SHORT_BREAK');
                setTimeLeft(customDurations.SHORT_BREAK * 60);
            }
        } else {
            setMode('WORK');
            setTimeLeft(customDurations.WORK * 60);
        }

        sessionStartTimeRef.current = null;
    }, [mode, sessionsCompleted, customDurations, selectedSubject, playSound]);

    // Lógica do temporizador
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
                if (mode === 'WORK') {
                    setTotalFocusTime(prev => prev + 1);
                }
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, mode, handleTimerComplete]);

    const startTimer = () => {
        if (!isRunning) {
            sessionStartTimeRef.current = Date.now();
        }
        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const toggleTimer = () => {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(customDurations[mode] * 60);
        sessionStartTimeRef.current = null;
    };

    const switchMode = (newMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(customDurations[newMode] * 60);
        sessionStartTimeRef.current = null;
    };

    const updateDurations = (newDurations) => {
        setCustomDurations(newDurations);
        localStorage.setItem('pomodoroDurations', JSON.stringify(newDurations));
        if (!isRunning) {
            setTimeLeft(newDurations[mode] * 60);
        }
    };

    const clearPendingSession = () => {
        setPendingSession(null);
    };

    const resetStats = () => {
        setSessionsCompleted(0);
        setTotalFocusTime(0);
        localStorage.removeItem('pomodoroStats');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const totalDuration = customDurations[mode] * 60;
        return ((totalDuration - timeLeft) / totalDuration) * 100;
    };

    const value = {
        // Estado
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

        // Ações
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        switchMode,
        setSoundEnabled,
        setSelectedSubject,
        updateDurations,
        clearPendingSession,
        resetStats,

        // Auxiliares
        formatTime,
        getProgress
    };

    return (
        <PomodoroContext.Provider value={value}>
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
}

export default PomodoroContext;
