import React from "react";
import * as Icons from "lucide-react";
import { Edit2, Trash2 } from "lucide-react";
import "./SubjectCard.css";

export default function SubjectCard({ subject, onEdit, onDelete, viewMode = 'grid' }) {
  // Obter o ícone dinamicamente
  const IconComponent = Icons[subject.icon] || Icons.BookOpen;

  if (viewMode === 'list') {
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
            onClick={() => onEdit(subject)}
            className="action-button"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(subject.id)}
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
          onClick={() => onEdit(subject)}
          className="footer-button"
        >
          <Edit2 size={16} />
          Editar
        </button>
        <button
          onClick={() => onDelete(subject.id)}
          className="footer-button delete-footer-button"
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
}
