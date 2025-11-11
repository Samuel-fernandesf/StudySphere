import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Auth";
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files" element={<FilesList />} />
      <Route path="/files/:id" element={<FileView />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/quiz" element={<QuizList />} />
      <Route path="/quiz/:id" element={<QuizPlay />} />
      <Route path="/progress" element={<ProgressView />} />
      <Route path="/chats" element={<Chats />} />
      <Route path="/config" element={<UserConfig />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

