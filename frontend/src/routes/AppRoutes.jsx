import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import FilesList from "../pages/Files/FilesList";
import FileView from "../pages/Files/FileView";
import CalendarPage from "../pages/Calendar/CalendarPage";
import QuizList from "../pages/Quiz/QuizList";
import QuizPlay from "../pages/Quiz/QuizPlay";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files" element={<FilesList />} />
      <Route path="/files/:id" element={<FileView />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/quiz" element={<QuizList />} />
      <Route path="/quiz/:id" element={<QuizPlay />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
