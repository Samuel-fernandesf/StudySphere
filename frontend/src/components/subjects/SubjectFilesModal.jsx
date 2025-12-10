import React, { useState, useEffect, useRef } from "react";
import { X, Upload, File, Trash2, Download } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import { enviarArquivo, listarArquivos, deletarArquivo, baixarArquivo } from "../../services/fileService";

export default function SubjectFilesModal({ subject, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    if (subject?.id) {
      loadFiles();
    }
  }, [subject]);

  async function loadFiles() {
    try {
      setLoading(true);
      const filesData = await listarArquivos(subject.id); // ✅ Filtra por matéria
      setFiles(filesData.files || []);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      setFiles([]);
      showAlert("Erro ao carregar arquivos. Tente novamente.", "error", "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await enviarArquivo(file, subject.id); // ✅ Envia subject_id
      await loadFiles();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await showAlert("Arquivo enviado com sucesso.", "success", "Upload concluído");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      await showAlert(
        error.response?.data?.message || "Erro ao fazer upload do arquivo. Tente novamente.", 
        "error", 
        "Erro no upload"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteClick(file) {
    const confirmado = await showConfirm(
      `Tem certeza que deseja excluir o arquivo "${file.original_filename || file.name || "sem nome"}"?`,
      "Excluir arquivo",
      "warning"
    );

    if (!confirmado) return;

    setDeleting(file.id);
    try {
      await deletarArquivo(file.id); // ✅ Chama API de exclusão
      await loadFiles();
      await showAlert("Arquivo excluído com sucesso!", "success", "Excluído");
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      await showAlert("Erro ao excluir arquivo. Tente novamente.", "error", "Erro");
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownloadClick(fileId, fileName) {
    try {
      await baixarArquivo(fileId); // ✅ Download correto com blob
    } catch (error) {
      console.error("Erro ao baixar:", error);
      await showAlert("Erro ao baixar arquivo.", "error", "Erro no download");
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  if (!subject) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Arquivos - {subject.name}</h3>
            <p style={styles.subtitle}>Gerencie os arquivos desta matéria</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.mp4,.mp3"
            disabled={uploading}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...styles.uploadButton,
              opacity: uploading ? 0.7 : 1,
              cursor: uploading ? "not-allowed" : "pointer"
            }}
            disabled={uploading}
          >
            <Upload size={18} />
            {uploading ? "Enviando..." : "Fazer Upload"}
          </button>

          {loading ? (
            <div style={styles.loading}>Carregando arquivos...</div>
          ) : files.length === 0 ? (
            <div style={styles.empty}>
              Nenhum arquivo enviado ainda. Clique em "Fazer Upload" para adicionar arquivos.
            </div>
          ) : (
            <div style={styles.filesList}>
              {files.map((file) => (
                <div key={file.id} style={styles.fileItem}>
                  <div style={styles.fileIcon}>
                    <File size={24} color="#3b82f6" />
                  </div>
                  <div style={styles.fileContent}>
                    <div style={styles.fileName}>
                      {file.original_filename || file.name || "Arquivo sem nome"}
                    </div>
                    <div style={styles.fileInfo}>
                      {file.size ? formatFileSize(file.size) : "Tamanho desconhecido"} •{' '}
                      {file.created_at ? new Date(file.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                    </div>
                  </div>
                  <div style={styles.fileActions}>
                    <button
                      onClick={() => handleDownloadClick(file.id, file.original_filename)}
                      style={styles.downloadButton}
                      title="Baixar arquivo"
                      disabled={deleting === file.id}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(file)}
                      style={{
                        ...styles.deleteButton,
                        opacity: deleting === file.id ? 0.7 : 1,
                        cursor: deleting === file.id ? "not-allowed" : "pointer"
                      }}
                      title="Excluir arquivo"
                      disabled={deleting === file.id}
                    >
                      {deleting === file.id ? (
                        <>
                          <div style={{ width: 12, height: 12, border: '1px solid #dc2626', borderTop: 'none', borderRight: 'none', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 4 }} />
                          Excluindo...
                        </>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Seus styles permanecem iguais ✅
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
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0"
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px 0"
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "#64748b"
  },
  content: {
    padding: "20px",
    overflowY: "auto",
    flex: 1
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "16px",
    width: "100%",
    justifyContent: "center"
  },
  filesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    transition: "all 0.2s"
  },
  fileIcon: {
    width: "48px",
    height: "48px",
    backgroundColor: "#dbeafe",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  fileContent: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  fileInfo: {
    fontSize: "12px",
    color: "#94a3b8"
  },
  fileActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0
  },
  downloadButton: {
    padding: "8px",
    backgroundColor: "#dbeafe",
    color: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none"
  },
  deleteButton: {
    padding: "8px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    fontSize: "14px"
  }
};
