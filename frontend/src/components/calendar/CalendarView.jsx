import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import EventModal from "./EventModal";
import { listarEventos, deletarEvento } from "../../services/eventService";
import "../../pages/Calendar/CalendarPage.css"; // Importa os estilos do calendário

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  async function loadEvents() {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const eventsList = await listarEventos(
        monthStart.toISOString(),
        monthEnd.toISOString()
      );
      setEvents(eventsList);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePrevMonth() {
    setCurrentDate(subMonths(currentDate, 1));
  }

  function handleNextMonth() {
    setCurrentDate(addMonths(currentDate, 1));
  }

  function handleDateClick(day) {
    setSelectedDate(day);
    setSelectedEvent(null);
    setIsModalOpen(true);
  }

  function handleEventClick(event, e) {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  }

  async function handleDeleteEvent(eventId) {
    try {
      await deletarEvento(eventId);
      setIsModalOpen(false);
      loadEvents();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      alert("Erro ao deletar evento");
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setSelectedEvent(null);
    loadEvents();
  }

  function getEventsForDay(day) {
    return events.filter(event => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = parseISO(event.end_date);
      return isSameDay(eventStart, day) || (day >= eventStart && day <= eventEnd);
    });
  }

  function renderHeader() {
    return (
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <h2 className="month-display">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button onClick={handleNextMonth} className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  function renderDaysOfWeek() {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <div className="weekdays">
        {days.map(day => (
          <div key={day} className="weekday-name">
            {day}
          </div>
        ))}
      </div>
    );
  }

  function renderCells() {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = getEventsForDay(cloneDay);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        let cellClasses = "day-cell";
        if (!isCurrentMonth) cellClasses += " other-month";
        if (isToday) cellClasses += " today";
        if (isSelected) cellClasses += " selected";

        days.push(
          <div
            key={day}
            className={cellClasses}
            onClick={() => handleDateClick(cloneDay)}
          >
            <span className="day-number">{format(day, "d")}</span>
            <div className="events-container">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className="event-item"
                  style={{
                    backgroundColor: event.color || 'var(--primary)'
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="more-events">
                  +{dayEvents.length - 2} mais
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="calendar-grid">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-body">{rows}</div>;
  }

  return (
    <div className="calendar-view">
      <div className="calendar-toolbar">
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedEvent(null);
            setIsModalOpen(true);
          }}
          className="add-button"
        >
          <Plus size={18} />
          Novo Evento
        </button>
      </div>
      
      {loading ? (
        <div className="calendar-loading">Carregando eventos...</div>
      ) : (
        <>
          {renderHeader()}
          {renderDaysOfWeek()}
          {renderCells()}
        </>
      )}

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={handleModalClose}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
