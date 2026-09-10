import React, { useState, useEffect } from "react";
import { X, Target, Check, Info } from "lucide-react";

export default function EditWeeklyGoalModal({ isOpen, currentGoal = 20, onClose, onSave }) {
  const [hours, setHours] = useState(currentGoal);
  const presets = [10, 15, 20, 25, 30, 40];

  useEffect(() => {
    if (isOpen) {
      setHours(currentGoal);
    }
  }, [isOpen, currentGoal]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const val = parseFloat(hours);
    if (isNaN(val) || val <= 0) return;
    onSave(val);
  }

  const numericHours = parseFloat(hours) || 0;
  const dailyAvg = (numericHours / 7).toFixed(1);
  const workdaysAvg = (numericHours / 5).toFixed(1);

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div className="goal-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="goal-modal-header">
          <div className="goal-modal-title-group">
            <div className="goal-modal-icon">
              <Target size={22} />
            </div>
            <div>
              <h3 className="goal-modal-title">Alterar Meta Semanal</h3>
              <p className="goal-modal-subtitle">Defina quantas horas pretende estudar por semana</p>
            </div>
          </div>
          <button type="button" className="goal-modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="goal-modal-body">
          <div>
            <div className="goal-presets-label">Metas Rápidas</div>
            <div className="goal-presets-grid">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className={`goal-preset-btn ${parseFloat(hours) === preset ? "selected" : ""}`}
                  onClick={() => setHours(preset)}
                >
                  {preset}h / semana
                </button>
              ))}
            </div>
          </div>

          <div className="goal-input-container">
            <label className="goal-presets-label" htmlFor="goal-hours-input">
              Horas Personalizadas
            </label>
            <div className="goal-input-row">
              <input
                id="goal-hours-input"
                type="number"
                className="goal-number-input"
                min="1"
                max="100"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
              <span className="goal-input-unit">horas / semana</span>
            </div>
            <input
              type="range"
              className="goal-slider"
              min="1"
              max="60"
              step="1"
              value={Math.min(numericHours || 1, 60)}
              onChange={(e) => setHours(parseFloat(e.target.value))}
            />
          </div>

          <div className="goal-daily-info">
            <Info size={16} color="#6366f1" />
            <span>
              Isso equivale a cerca de <strong>{dailyAvg}h/dia</strong> (7 dias) ou <strong>{workdaysAvg}h/dia</strong> em dias úteis.
            </span>
          </div>

          <div className="goal-modal-footer">
            <button type="button" className="goal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="goal-btn-save">
              <Check size={16} />
              Salvar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
