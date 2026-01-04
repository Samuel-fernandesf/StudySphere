import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import MiniPomodoro from "./components/Pomodoro/MiniPomodoro";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <PomodoroProvider>
            <AppRoutes />
            <MiniPomodoro />
          </PomodoroProvider>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}