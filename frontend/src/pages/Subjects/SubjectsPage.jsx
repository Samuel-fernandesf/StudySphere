import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import SubjectCard from "../../components/subjects/SubjectCard";
import SubjectModal from "../../components/subjects/SubjectModal";
import { listarMaterias, deletarMateria } from "../../services/subjectService";
import { Plus, Grid, List } from "lucide-react";
import "./SubjectsPage.css";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await listarMaterias();
      setSubjects(data);
    } catch (error) {
      console.error("Erro ao carregar matérias:", error);
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

  async function handleDeleteSubject(subjectId) {
    if (!confirm("Tem certeza que deseja excluir esta matéria?")) {
      return;
    }

    try {
      await deletarMateria(subjectId);
      loadSubjects();
    } catch (error) {
      console.error("Erro ao deletar matéria:", error);
      alert("Erro ao deletar matéria");
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setSelectedSubject(null);
    loadSubjects();
  }

  return (
    <>
      <Sidebar />
      <main className="subjects-page-root">
        <div className="subjects-header">
          <div>
            <h2 className="subjects-title">Matérias</h2>
            <p className="subjects-subtitle">Organize seus estudos por disciplinas</p>
          </div>
          <div className="subjects-actions">
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
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
          <div className={viewMode === 'grid' ? 'subjects-grid' : 'subjects-list'}>
            {subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={handleEditSubject}
                onDelete={handleDeleteSubject}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {isModalOpen && (
          <SubjectModal
            subject={selectedSubject}
            onClose={handleModalClose}
          />
        )}
      </main>
    </>
  );
}
