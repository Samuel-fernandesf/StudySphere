import React from "react";
import Header from "../../components/layout/Header";
import CalendarView from "../../components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <>
      <Header />
      <main className="container">
        <h2>Calendário</h2>
        <CalendarView />
      </main>
    </>
  );
}
