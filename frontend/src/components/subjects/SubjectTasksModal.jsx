import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Circle, CheckCircle2 } from "lucide-react";
import { listarTarefas, criarTarefa, deletarTarefa, alternarConclusaoTarefa } from "../../services/taskService";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SubjectTasksModal({ subject, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium"
  });

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      // Carregar tarefas desta matéria
      // O subject.id deve ser passado como string para a API se for um parâmetro de query
      const allTasks = await listarTarefas(String(subject.id));
      setTasks(allTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask() {
    if (!newTaskData.title) {
      alert("O título da tarefa é obrigatório");
      return;
    }

    try {
      const taskData = {
        subject_id: subject.id,
        title: newTaskData.title,
        description: newTaskData.description || null,
        due_date: newTaskData.due_date ? new Date(newTaskData.due_date).toISOString() : null,
        priority: newTaskData.priority
      };

      await criarTarefa(taskData);
      
      // Limpar formulário
      setNewTaskData({
        title: "",
        description: "",
        due_date: "",
        priority: "medium"
      });
      setShowNewTask(false);
      loadTasks();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      alert("Erro ao criar tarefa");
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }

    try {
      await deletarTarefa(taskId);
      loadTasks();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      alert("Erro ao deletar tarefa");
    }
  }

  async function handleToggleComplete(taskId) {
    try {
      await alternarConclusaoTarefa(taskId);
      loadTasks();
    } catch (error) {
      console.error("Erro ao alternar conclusão:", error);
      alert("Erro ao atualizar tarefa");
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  }

  function getPriorityLabel(priority) {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Tarefas - {subject?.name}</h3>
            <p style={styles.subtitle}>Gerencie as tarefas desta matéria</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <button
            onClick={() => setShowNewTask(!showNewTask)}
            style={styles.addButton}
          >
            <Plus size={18} />
            {showNewTask ? 'Cancelar' : 'Nova Tarefa'}
          </button>

          {showNewTask && (
            <div style={styles.newTaskForm}>
              <input
                type="text"
                placeholder="Título da tarefa *"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                style={styles.input}
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                style={styles.textarea}
                rows="2"
              />
              <input
                type="date"
                value={newTaskData.due_date}
                onChange={(e) => setNewTaskData({ ...newTaskData, due_date: e.target.value })}
                style={styles.input}
              />
              <select
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                style={styles.select}
              >
                <option value="low">Prioridade Baixa</option>
                <option value="medium">Prioridade Média</option>
                <option value="high">Prioridade Alta</option>
              </select>
              <button onClick={handleCreateTask} style={styles.createButton}>
                Criar Tarefa
              </button>
            </div>
          )}

          {loading ? (
            <div style={styles.loading}>Carregando tarefas...</div>
          ) : tasks.length === 0 ? (
            <div style={styles.empty}>
              Nenhuma tarefa criada ainda. Clique em "Nova Tarefa" para adicionar.
            </div>
          ) : (
            <div style={styles.tasksList}>
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  style={{
                    ...styles.taskItem,
                    opacity: task.completed ? 0.6 : 1
                  }}
                >
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    style={styles.checkButton}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={20} color="#10b981" />
                    ) : (
                      <Circle size={20} color="#94a3b8" />
                    )}
                  </button>
                  
                  <div style={styles.taskContent}>
                    <div style={{
                      ...styles.taskTitle,
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={styles.taskDescription}>{task.description}</div>
                    )}
                    <div style={styles.taskMeta}>
                      <span 
                        style={{
                          ...styles.priorityBadge,
                          backgroundColor: `${getPriorityColor(task.priority)}20`,
                          color: getPriorityColor(task.priority)
                        }}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.due_date && (
                        <span style={styles.dueDate}>
                          Prazo: {format(parseISO(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {task.completed && task.completed_at && (
                        <span style={styles.completedDate}>
                          Concluída em: {format(parseISO(task.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#64748b'
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '16px',
    width: '100%',
    justifyContent: 'center'
  },
  newTaskForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none'
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'white'
  },
  createButton: {
    padding: '10px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  taskItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  checkButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    flexShrink: 0
  },
  taskContent: {
    flex: 1,
    minWidth: 0
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px'
  },
  taskDescription: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px'
  },
  taskMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center'
  },
  priorityBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  dueDate: {
    fontSize: '12px',
    color: '#64748b'
  },
  completedDate: {
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '500'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#ef4444',
    flexShrink: 0
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    fontSize: '14px'
  }
};
