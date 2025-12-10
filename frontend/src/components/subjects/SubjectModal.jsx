import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import * as Icons from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import { criarMateria, atualizarMateria } from "../../services/subjectService";

export default function SubjectModal({ subject, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    icon: "BookOpen"
  });
  const [loading, setLoading] = useState(false);
  const { showAlert } = useModal();

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || "",
        description: subject.description || "",
        color: subject.color || "#3b82f6",
        icon: subject.icon || "BookOpen"
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
        icon: "BookOpen"
      });
    }
  }, [subject]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      await showAlert("Preencha o nome da matéria.", "warning", "Campo obrigatório");
      return;
    }

    try {
      setLoading(true);

      if (subject) {
        await atualizarMateria(subject.id, formData);
        await showAlert("Matéria atualizada com sucesso.", "success", "Alterações salvas");
      } else {
        await criarMateria(formData);
        await showAlert("Matéria criada com sucesso.", "success", "Matéria cadastrada");
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar matéria:", error.response?.data || error);
      await showAlert(
        error.response?.data?.message || "Erro ao salvar matéria. Tente novamente.",
        "error",
        "Erro ao salvar"
      );
    } finally {
      setLoading(false);
    }
  }

  const colors = [
    { name: "Azul", value: "#3b82f6" },
    { name: "Verde", value: "#10b981" },
    { name: "Vermelho", value: "#ef4444" },
    { name: "Amarelo", value: "#f59e0b" },
    { name: "Roxo", value: "#8b5cf6" },
    { name: "Rosa", value: "#ec4899" },
    { name: "Ciano", value: "#06b6d4" },
    { name: "Laranja", value: "#f97316" }
  ];

  const availableIcons = [
    "BookOpen",
    "Calculator",
    "Beaker",
    "Globe",
    "Palette",
    "Music",
    "Code",
    "Heart",
    "Dumbbell",
    "Languages",
    "Microscope",
    "Atom",
    "Binary",
    "FlaskConical"
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            {subject ? "Editar Matéria" : "Nova Matéria"}
          </h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nome da Matéria *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ex: Matemática, História, Programação..."
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...styles.input, ...styles.textarea }}
              placeholder="Detalhes sobre a matéria"
              rows="3"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Cor</label>
            <div style={styles.colorGrid}>
              {colors.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  style={{
                    ...styles.colorButton,
                    backgroundColor: color.value,
                    ...(formData.color === color.value ? styles.colorButtonSelected : {})
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Ícone</label>
            <div style={styles.iconGrid}>
              {availableIcons.map(iconName => {
                const IconComponent = Icons[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                    style={{
                      ...styles.iconButton,
                      ...(formData.icon === iconName ? styles.iconButtonSelected : {})
                    }}
                    title={iconName}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.preview}>
            <label style={styles.label}>Pré-visualização</label>
            <div
              style={{
                ...styles.previewCard,
                backgroundColor: formData.color
              }}
            >
              {React.createElement(Icons[formData.icon] || Icons.BookOpen, {
                size: 32,
                color: "white"
              })}
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "550px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0"
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "#64748b"
  },
  form: {
    padding: "20px"
  },
  field: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    marginBottom: "8px"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  textarea: {
    resize: "vertical",
    fontFamily: "inherit"
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: "8px"
  },
  colorButton: {
    width: "100%",
    height: "40px",
    border: "2px solid transparent",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "transform 0.2s"
  },
  colorButtonSelected: {
    borderColor: "#1e293b",
    transform: "scale(1.1)"
  },
  iconGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px"
  },
  iconButton: {
    padding: "10px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "2px solid transparent",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  iconButtonSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
    color: "#3b82f6"
  },
  preview: {
    marginBottom: "20px"
  },
  previewCard: {
    padding: "24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100px"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0"
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  }
};
