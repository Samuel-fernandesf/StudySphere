import React, { useState, useEffect, useRef } from "react";
import { X, Upload, File, Trash2, Download, Folder, FolderPlus, ChevronRight, ArrowLeft, MoreVertical, Move, Copy, Edit2 } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import { enviarArquivo, listarArquivos, deletarArquivo, baixarArquivo, moverArquivo, copiarArquivo } from "../../services/fileService";
import { listarPastas, criarPasta, deletarPasta, atualizarPasta, obterCaminhoPasta } from "../../services/folderService";
import { listarMaterias } from "../../services/subjectService";

const MAX_FOLDER_DEPTH = 10;

export default function SubjectFilesModal({ subject, onClose }) {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [contextMenu, setContextMenu] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [targetSubject, setTargetSubject] = useState(null);
  const [targetFolders, setTargetFolders] = useState([]);
  const [targetFolderId, setTargetFolderId] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const fileInputRef = useRef(null);
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    if (subject?.id) {
      loadContent();
    }
  }, [subject, currentFolderId]);

  async function loadContent() {
    try {
      setLoading(true);
      const [foldersData, filesData] = await Promise.all([
        listarPastas(subject.id, currentFolderId),
        listarArquivos(subject.id, currentFolderId)
      ]);
      setFolders(foldersData || []);
      setFiles(filesData.files || []);

      // Atualizar breadcrumb
      if (currentFolderId) {
        const path = await obterCaminhoPasta(currentFolderId);
        setBreadcrumb(path);
        setCurrentDepth(path.length);
      } else {
        setBreadcrumb([]);
        setCurrentDepth(0);
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo:", error);
      setFolders([]);
      setFiles([]);
      showAlert("Erro ao carregar conteúdo. Tente novamente.", "error", "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await enviarArquivo(file, subject.id, currentFolderId);
      await loadContent();
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

  async function handleCreateFolder() {
    if (!newFolderName.trim()) {
      await showAlert("Digite um nome para a pasta.", "warning", "Nome obrigatório");
      return;
    }

    if (currentDepth >= MAX_FOLDER_DEPTH) {
      await showAlert("Limite máximo de 10 níveis de pastas atingido.", "warning", "Limite atingido");
      return;
    }

    try {
      await criarPasta(subject.id, newFolderName.trim(), currentFolderId, newFolderColor);
      setNewFolderName("");
      setNewFolderColor("#6366f1");
      setShowNewFolderInput(false);
      await loadContent();
      await showAlert("Pasta criada com sucesso!", "success", "Pasta criada");
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      await showAlert(
        error.response?.data?.message || "Erro ao criar pasta.",
        "error",
        "Erro"
      );
    }
  }

  async function handleDeleteFile(file) {
    const confirmado = await showConfirm(
      `Tem certeza que deseja excluir o arquivo "${file.original_filename || file.name || "sem nome"}"?`,
      "Excluir arquivo",
      "warning"
    );

    if (!confirmado) return;

    setDeleting(file.id);
    try {
      await deletarArquivo(file.id);
      await loadContent();
      await showAlert("Arquivo excluído com sucesso!", "success", "Excluído");
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      await showAlert("Erro ao excluir arquivo. Tente novamente.", "error", "Erro");
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteFolder(folder) {
    const confirmado = await showConfirm(
      `Tem certeza que deseja excluir a pasta "${folder.name}"? Todo o conteúdo dentro dela será excluído.`,
      "Excluir pasta",
      "warning"
    );

    if (!confirmado) return;

    try {
      await deletarPasta(folder.id);
      await loadContent();
      await showAlert("Pasta excluída com sucesso!", "success", "Excluída");
    } catch (error) {
      console.error("Erro ao excluir pasta:", error);
      await showAlert("Erro ao excluir pasta. Tente novamente.", "error", "Erro");
    }
  }

  async function handleDownloadClick(fileId) {
    try {
      await baixarArquivo(fileId);
    } catch (error) {
      console.error("Erro ao baixar:", error);
      await showAlert("Erro ao baixar arquivo.", "error", "Erro no download");
    }
  }

  function handleFolderClick(folder) {
    setCurrentFolderId(folder.id);
  }

  function handleBackClick() {
    if (breadcrumb.length > 1) {
      setCurrentFolderId(breadcrumb[breadcrumb.length - 2].id);
    } else {
      setCurrentFolderId(null);
    }
  }

  function handleBreadcrumbClick(index) {
    if (index === -1) {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(breadcrumb[index].id);
    }
  }

  async function handleMoveOrCopy(file, action) {
    setContextMenu(null);

    // Carregar todas as matérias
    try {
      const subjects = await listarMaterias();
      setAllSubjects(subjects);
      setTargetSubject(subject.id);
      setTargetFolderId(null);
      setShowMoveModal({ file, action });

      // Carregar pastas da matéria atual
      const folders = await listarPastas(subject.id, null);
      setTargetFolders(folders);
    } catch (error) {
      console.error("Erro ao carregar destinos:", error);
      await showAlert("Erro ao carregar opções de destino.", "error", "Erro");
    }
  }

  async function handleTargetSubjectChange(newSubjectId) {
    setTargetSubject(newSubjectId);
    setTargetFolderId(null);
    try {
      const folders = await listarPastas(newSubjectId, null);
      setTargetFolders(folders);
    } catch (error) {
      console.error("Erro ao carregar pastas:", error);
      setTargetFolders([]);
    }
  }

  async function executeMoveOrCopy() {
    if (!showMoveModal) return;

    const { file, action } = showMoveModal;

    try {
      if (action === "move") {
        await moverArquivo(file.id, targetSubject, targetFolderId);
        await showAlert("Arquivo movido com sucesso!", "success", "Movido");
      } else {
        await copiarArquivo(file.id, targetSubject, targetFolderId);
        await showAlert("Arquivo copiado com sucesso!", "success", "Copiado");
      }
      setShowMoveModal(null);
      await loadContent();
    } catch (error) {
      console.error(`Erro ao ${action === "move" ? "mover" : "copiar"} arquivo:`, error);
      await showAlert(`Erro ao ${action === "move" ? "mover" : "copiar"} arquivo.`, "error", "Erro");
    }
  }

  async function handleEditFolder(folder) {
    setEditingFolder(folder.id);
    setEditFolderName(folder.name);
    setContextMenu(null);
  }

  async function saveEditFolder(folder) {
    if (!editFolderName.trim()) return;

    try {
      await atualizarPasta(folder.id, { name: editFolderName.trim() });
      setEditingFolder(null);
      await loadContent();
    } catch (error) {
      console.error("Erro ao renomear pasta:", error);
      await showAlert("Erro ao renomear pasta.", "error", "Erro");
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
            <p style={styles.subtitle}>Gerencie os arquivos e pastas desta matéria</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            style={styles.breadcrumbItem}
          >
            {subject.name}
          </button>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.id}>
              <ChevronRight size={14} style={{ color: "#94a3b8" }} />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                style={styles.breadcrumbItem}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div style={styles.content}>
          {/* Ações */}
          <div style={styles.actions}>
            {currentFolderId && (
              <button onClick={handleBackClick} style={styles.backButton}>
                <ArrowLeft size={18} />
                Voltar
              </button>
            )}

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
              style={{ ...styles.actionButton, opacity: uploading ? 0.7 : 1 }}
              disabled={uploading}
            >
              <Upload size={18} />
              {uploading ? "Enviando..." : "Upload"}
            </button>

            {currentDepth < MAX_FOLDER_DEPTH && (
              <button
                onClick={() => setShowNewFolderInput(true)}
                style={styles.actionButton}
              >
                <FolderPlus size={18} />
                Nova Pasta
              </button>
            )}
          </div>

          {/* Input nova pasta */}
          {showNewFolderInput && (
            <div style={styles.newFolderContainer}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta"
                style={styles.newFolderInput}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <input
                type="color"
                value={newFolderColor}
                onChange={(e) => setNewFolderColor(e.target.value)}
                style={styles.colorPicker}
              />
              <button onClick={handleCreateFolder} style={styles.confirmButton}>Criar</button>
              <button onClick={() => setShowNewFolderInput(false)} style={styles.cancelButton}>Cancelar</button>
            </div>
          )}

          {loading ? (
            <div style={styles.loading}>Carregando conteúdo...</div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div style={styles.empty}>
              Nenhum conteúdo ainda. Clique em "Upload" ou "Nova Pasta" para começar.
            </div>
          ) : (
            <div style={styles.contentList}>
              {/* Pastas */}
              {folders.map((folder) => (
                <div key={`folder-${folder.id}`} style={styles.folderItem}>
                  {editingFolder === folder.id ? (
                    <div style={styles.editContainer}>
                      <input
                        type="text"
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        style={styles.editInput}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveEditFolder(folder)}
                      />
                      <button onClick={() => saveEditFolder(folder)} style={styles.confirmButton}>Salvar</button>
                      <button onClick={() => setEditingFolder(null)} style={styles.cancelButton}>Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <div
                        style={styles.folderContent}
                        onClick={() => handleFolderClick(folder)}
                      >
                        <div style={{ ...styles.folderIcon, backgroundColor: folder.color + "20" }}>
                          <Folder size={24} color={folder.color} />
                        </div>
                        <div style={styles.folderInfo}>
                          <div style={styles.folderName}>{folder.name}</div>
                          <div style={styles.folderMeta}>Pasta</div>
                        </div>
                      </div>
                      <div style={styles.folderActions}>
                        <button
                          onClick={() => handleEditFolder(folder)}
                          style={styles.iconButton}
                          title="Renomear"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder)}
                          style={styles.deleteIconButton}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Arquivos */}
              {files.map((file) => (
                <div key={`file-${file.id}`} style={styles.fileItem}>
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
                      onClick={() => handleDownloadClick(file.id)}
                      style={styles.downloadButton}
                      title="Baixar arquivo"
                      disabled={deleting === file.id}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveOrCopy(file, "move")}
                      style={styles.iconButton}
                      title="Mover"
                    >
                      <Move size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveOrCopy(file, "copy")}
                      style={styles.iconButton}
                      title="Copiar"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      style={{
                        ...styles.deleteButton,
                        opacity: deleting === file.id ? 0.7 : 1,
                      }}
                      title="Excluir arquivo"
                      disabled={deleting === file.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Mover/Copiar */}
        {showMoveModal && (
          <div style={styles.moveModalOverlay} onClick={() => setShowMoveModal(null)}>
            <div style={styles.moveModal} onClick={(e) => e.stopPropagation()}>
              <h4 style={styles.moveTitle}>
                {showMoveModal.action === "move" ? "Mover" : "Copiar"} arquivo
              </h4>
              <p style={styles.moveSubtitle}>
                {showMoveModal.file.original_filename}
              </p>

              <div style={styles.moveForm}>
                <label style={styles.moveLabel}>Matéria de destino:</label>
                <select
                  value={targetSubject || ""}
                  onChange={(e) => handleTargetSubjectChange(Number(e.target.value))}
                  style={styles.moveSelect}
                >
                  {allSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <label style={styles.moveLabel}>Pasta de destino:</label>
                <select
                  value={targetFolderId || ""}
                  onChange={(e) => setTargetFolderId(e.target.value ? Number(e.target.value) : null)}
                  style={styles.moveSelect}
                >
                  <option value="">Raiz da matéria</option>
                  {targetFolders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.moveActions}>
                <button onClick={() => setShowMoveModal(null)} style={styles.cancelButton}>
                  Cancelar
                </button>
                <button onClick={executeMoveOrCopy} style={styles.confirmButton}>
                  {showMoveModal.action === "move" ? "Mover" : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        )}
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
    maxWidth: "700px",
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
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "12px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap"
  },
  breadcrumbItem: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    color: "#3b82f6",
    padding: "4px 8px",
    borderRadius: "4px",
    "&:hover": { backgroundColor: "#e0e7ff" }
  },
  content: {
    padding: "16px 20px",
    overflowY: "auto",
    flex: 1
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  newFolderContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    alignItems: "center"
  },
  newFolderInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px"
  },
  colorPicker: {
    width: "40px",
    height: "36px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer"
  },
  confirmButton: {
    padding: "8px 14px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  cancelButton: {
    padding: "8px 14px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  contentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  folderItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  folderContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1
  },
  folderIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  folderInfo: {
    flex: 1,
    minWidth: 0
  },
  folderName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "2px"
  },
  folderMeta: {
    fontSize: "12px",
    color: "#94a3b8"
  },
  folderActions: {
    display: "flex",
    gap: "4px"
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    transition: "all 0.2s"
  },
  fileIcon: {
    width: "44px",
    height: "44px",
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
    marginBottom: "2px",
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
    gap: "4px",
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
    justifyContent: "center"
  },
  iconButton: {
    padding: "8px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteButton: {
    padding: "8px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  deleteIconButton: {
    padding: "8px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
  },
  editContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flex: 1
  },
  editInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px"
  },
  moveModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100
  },
  moveModal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  moveTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px 0"
  },
  moveSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 16px 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  moveForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px"
  },
  moveLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569"
  },
  moveSelect: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white"
  },
  moveActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px"
  }
};
