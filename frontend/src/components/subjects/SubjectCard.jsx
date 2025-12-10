import React from "react";
import * as Icons from "lucide-react";
import { Edit2, Trash2, FileText, ListTodo } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import "./SubjectCard.css";

export default function SubjectCard({
  subject,
  onEdit,
  onDelete,
  onOpenTasks,
  onOpenFiles,
  viewMode = "grid"
}) {
  const { showConfirm, showAlert } = useModal();

  const IconComponent = Icons[subject.icon] || Icons.BookOpen;

  async function handleDeleteClick() {
    const confirmado = await showConfirm(
      `Tem certeza que deseja excluir a matéria "${subject.name}"? Todos os dados associados poderão ser perdidos.`,
      "Excluir Matéria",
      "error"
    );

    if (!confirmado) return;

    try {
      await onDelete(subject.id);
    } catch (e) {
      await showAlert(
        "Não foi possível excluir a matéria. Tente novamente.",
        "error",
        "Erro"
      );
    }
  }

  if (viewMode === "list") {
    return (
      <div className="subject-list-card">
        <div className="list-left">
          <div
            className="icon-container"
            style={{
              backgroundColor: `${subject.color}20`,
              color: subject.color
            }}
          >
            <IconComponent size={24} />
          </div>
          <div>
            <h3 className="list-title">{subject.name}</h3>
            {subject.description && (
              <p className="list-description">{subject.description}</p>
            )}
          </div>
        </div>
        <div className="list-actions">
          <button
            onClick={() => onOpenTasks && onOpenTasks(subject)}
            className="action-button"
            title="Tarefas"
          >
            <ListTodo size={16} />
          </button>
          <button
            onClick={() => onOpenFiles && onOpenFiles(subject)}
            className="action-button"
            title="Arquivos"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={() => onEdit(subject)}
            className="action-button"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="action-button delete-button"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-card">
      <div
        className="card-header"
        style={{
          backgroundColor: subject.color
        }}
      >
        <IconComponent size={32} color="white" />
      </div>

      <div className="card-body">
        <h3 className="card-title">{subject.name}</h3>
        {subject.description && (
          <p className="card-description">{subject.description}</p>
        )}
      </div>

      <div className="card-footer">
        <button
          onClick={() => onOpenTasks && onOpenTasks(subject)}
          className="footer-button"
          title="Tarefas"
        >
          <ListTodo size={16} />
          Tarefas
        </button>
        <button
          onClick={() => onOpenFiles && onOpenFiles(subject)}
          className="footer-button"
          title="Arquivos"
        >
          <FileText size={16} />
          Arquivos
        </button>
      </div>

      <div className="card-actions">
        <button
          onClick={() => onEdit(subject)}
          className="action-icon-button"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={handleDeleteClick}
          className="action-icon-button delete-action-button"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
