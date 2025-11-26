import React from "react";
import CalendarView from "../../components/calendar/CalendarView";
import "./CalendarPage.css";

export default function CalendarPage() {
  return (
    <main className="calendar-page-root">
        <h2>Calendário</h2>
        <CalendarView />
      </main>
  );
}
