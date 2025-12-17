import React, { useState, useEffect } from "react";
import SubjectCard from "../../components/subjects/SubjectCard";
import SubjectModal from "../../components/subjects/SubjectModal";
import SubjectTasksModal from "../../components/subjects/SubjectTasksModal";
import SubjectFilesModal from "../../components/subjects/SubjectFilesModal";
import { listarMaterias, deletarMateria } from "../../services/subjectService";
import { Plus, Grid, List } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import "./SubjectsPage.css";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await listarMaterias();
      setSubjects(data);
    } catch (error) {
      console.error("Erro ao carregar matérias:", error.response?.data || error);
      await showAlert(
        "Erro ao carregar matérias. Tente novamente.",
        "error",
        "Erro"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleNewSubject() {
    setSelectedSubject(null);
    setIsModalOpen(true);
  }

  function handleEditSubject(subject) {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  }

  function handleOpenTasks(subject) {
    setSelectedSubject(subject);
    setIsTasksModalOpen(true);
  }

  function handleOpenFiles(subject) {
    setSelectedSubject(subject);
    setIsFilesModalOpen(true);
  }

  async function handleDeleteSubject(subjectId) {
    const confirmado = await showConfirm(
      "Tem certeza que deseja excluir esta matéria? Todas as pastas, arquivos, tarefas e dados associados serão permanentemente excluídos.",
      "Excluir matéria",
      "warning"
    );

    if (!confirmado) return;

    try {
      await deletarMateria(subjectId);
      await loadSubjects();
      await showAlert("Matéria excluída com sucesso.", "success", "Excluída");
    } catch (error) {
      console.error("Erro ao deletar matéria:", error.response?.data || error);
      await showAlert(
        "Erro ao deletar matéria. Tente novamente.",
        "error",
        "Erro"
      );
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setSelectedSubject(null);
    loadSubjects();
  }

  function handleTasksModalClose() {
    setIsTasksModalOpen(false);
    setSelectedSubject(null);
  }

  function handleFilesModalClose() {
    setIsFilesModalOpen(false);
    setSelectedSubject(null);
  }

  return (
    <main className="subjects-page-root">
      <div className="subjects-header">
        <div>
          <h2 className="subjects-title">Matérias</h2>
          <p className="subjects-subtitle">Organize seus estudos por disciplinas</p>
        </div>
        <div className="subjects-actions">
          <div className="view-toggle">
            <button
              onClick={() => setViewMode("grid")}
              className={`view-button ${viewMode === "grid" ? "active" : ""}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`view-button ${viewMode === "list" ? "active" : ""}`}
            >
              <List size={18} />
            </button>
          </div>
          <button onClick={handleNewSubject} className="add-button">
            <Plus size={18} />
            Nova Matéria
          </button>
        </div>
      </div>

      {loading ? (
        <div className="subjects-loading">Carregando matérias...</div>
      ) : subjects.length === 0 ? (
        <div className="subjects-empty">
          <p className="empty-text">Nenhuma matéria cadastrada</p>
          <button onClick={handleNewSubject} className="empty-button">
            <Plus size={18} />
            Criar primeira matéria
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "subjects-grid" : "subjects-list"}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleEditSubject}
              onDelete={handleDeleteSubject}
              onOpenTasks={handleOpenTasks}
              onOpenFiles={handleOpenFiles}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <SubjectModal subject={selectedSubject} onClose={handleModalClose} />
      )}

      {isTasksModalOpen && (
        <SubjectTasksModal
          subject={selectedSubject}
          onClose={handleTasksModalClose}
        />
      )}

      {isFilesModalOpen && (
        <SubjectFilesModal
          subject={selectedSubject}
          onClose={handleFilesModalClose}
        />
      )}
    </main>
  );
}
