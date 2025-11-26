import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Trash2 } from "lucide-react";
import { criarEvento, atualizarEvento } from "../../services/eventService";
import "../../pages/Calendar/CalendarPage.css";

export default function EventModal({ event, selectedDate, onClose, onDelete }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    all_day: false,
    color: "#3b82f6"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      // Editar evento existente
      setFormData({
        title: event.title || "",
        description: event.description || "",
        start_date: event.start_date ? event.start_date.slice(0, 16) : "",
        end_date: event.end_date ? event.end_date.slice(0, 16) : "",
        all_day: event.all_day || false,
        color: event.color || "#3b82f6"
      });
    } else if (selectedDate) {
      // Novo evento
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      setFormData({
        title: "",
        description: "",
        start_date: `${dateStr}T09:00`,
        end_date: `${dateStr}T10:00`,
        all_day: false,
        color: "#3b82f6"
      });
    }
  }, [event, selectedDate]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        all_day: formData.all_day,
        color: formData.color
      };

      if (event) {
        await atualizarEvento(event.id, eventData);
      } else {
        await criarEvento(eventData);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento");
    } finally {
      setLoading(false);
    }
  }

  const colors = [
    { name: "Azul", value: "#3b82f6" },
    { name: "Verde", value: "#10b981" },
    { name: "Vermelho", value: "#ef4444" },
    { name: "Amarelo", value: "#f59e0b" },
    { name: "Roxo", value: "#8b5cf6" },
    { name: "Rosa", value: "#ec4899" }
  ];

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {event ? "Editar Evento" : "Novo Evento"}
          </h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label>Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nome do evento"
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes do evento"
              rows="3"
            />
          </div>

          <div className="modal-row">
            <div className="modal-form-group">
              <label>Início *</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="modal-form-group">
              <label>Fim *</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="all_day"
                checked={formData.all_day}
                onChange={handleChange}
              />
              Dia inteiro
            </label>
          </div>

          <div className="modal-form-group">
            <label>Cor</label>
            <div className="color-grid">
              {colors.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`color-button ${formData.color === color.value ? 'selected' : ''}`}
                  style={{
                    backgroundColor: color.value,
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {event && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="btn-danger"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            )}
            <div className="right-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
