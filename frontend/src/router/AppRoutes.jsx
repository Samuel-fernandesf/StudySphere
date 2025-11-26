import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Auth/AuthScreen";
import ForgotPasswordScreen from "../pages/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../pages/Auth/ResetPasswordScreen";
import ConfirmEmailScreen from "../pages/Auth/ConfirmEmailScreen";

import Dashboard from "../pages/Dashboard/Dashboard";
import FilesList from "../pages/Files/FilesList";
import FileView from "../pages/Files/FileView";
import CalendarPage from "../pages/Calendar/CalendarPage";
import QuizList from "../pages/Quiz/QuizList";
import QuizPlay from "../pages/Quiz/QuizPlay";
import NotFound from "../pages/NotFound";
import ProgressView from "../pages/Progress/Progress";
import Chats from "../pages/Chats/Chats";
import UserConfig from "../pages/Config/UserConfig";
import SubjectsPage from "../pages/Subjects/SubjectsPage";

export default function AppRoutes() {

  //puxa o estado usuário
  const {usuario} = useAuthContext();

  return(

    <Routes>

      {/* Rotas Públicas */}
      <Route 
      path="/" 
      element={!usuario ? (<Login />) : (<Navigate to='/dashboard' replace/>)}>
      </Route>

      <Route
      path="/confirmar-email/:token"
      element={<ConfirmEmailScreen/>}>
      </Route>

      <Route 
      path="/esqueci-a-senha" 
      element={!usuario ? (<ForgotPasswordScreen />) : (<Navigate to='/dashboard' replace/>)}>
      </Route>

      <Route 
      path="/redefinir-senha/:token"
      element={!usuario ? (<ResetPasswordScreen />) : (<Navigate to='/dashboard' replace/>)}>
      </Route>

      {/* <Route 
      path="/confirmar-email/:token" 
      element={<EmailConfirmationScreen />} />
      </Route> */}

      {/* Rotas Protegidas - Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/files" element={<FilesList />} />
        <Route path="/files/:id" element={<FileView />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/quiz" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizPlay />} />
        <Route path="/progress" element={<ProgressView />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/config" element={<UserConfig />} />
      </Route>

      {/* Rota não encontrada */}
      <Route path="*" element={<NotFound />} />


      {/* Tá de brincadeira com a Rota filho? */}
    </Routes>
  );
}

