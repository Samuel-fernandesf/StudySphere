import React from "react";
import CalendarView from "../../components/calendar/CalendarView";
import Sidebar from "../../components/layout/Sidebar";
import "./CalendarPage.css";

export default function CalendarPage() {
  return (
    <>
      <Sidebar/>
      <main className="calendar-page-root">
        <h2>Calendário</h2>
        <CalendarView />
      </main>
    </>
  );
}
