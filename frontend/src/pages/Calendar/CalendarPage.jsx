import React from "react";
import Header from "../../components/layout/Header";
import CalendarView from "../../components/calendar/CalendarView";
import Sidebar from "../../components/layout/Sidebar";

export default function CalendarPage() {
  return (
    <>
      <Sidebar />
      <main className="container">
        <h2>Calendário</h2>
        <CalendarView />
      </main>
    </>
  );
}
