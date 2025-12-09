import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

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
import QuizCreate from "../pages/Quiz/QuizCreate";
import NotFound from "../pages/NotFound";
import ProgressView from "../pages/Progress/Progress";
import Chats from "../pages/Chats/Chats";
import ChatRoom from "../pages/Chats/ChatRoom";
import UserConfig from "../pages/Config/UserConfig";
import SubjectsPage from "../pages/Subjects/SubjectsPage";
import AssistantPage from "../pages/Assistant/AssistantPage";

export default function AppRoutes() {
  const { usuario } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/"
        element={!usuario ? <Login /> : <Navigate to="/dashboard" replace />}
      />

      <Route path="/confirmar-email/:token" element={<ConfirmEmailScreen />} />

      <Route
        path="/esqueci-a-senha"
        element={
          !usuario ? <ForgotPasswordScreen /> : <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="/redefinir-senha/:token"
        element={
          !usuario ? <ResetPasswordScreen /> : <Navigate to="/dashboard" replace />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/files" element={<FilesList />} />
                <Route path="/files/:id" element={<FileView />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/quiz" element={<QuizList />} />
                <Route path="/quiz/create" element={<QuizCreate />} />
                <Route path="/quiz/:id" element={<QuizPlay />} />
                <Route path="/progress" element={<ProgressView />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/config" element={<UserConfig />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
