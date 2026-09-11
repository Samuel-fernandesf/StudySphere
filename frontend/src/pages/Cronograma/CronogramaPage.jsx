import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Layers3,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import CalendarView from "../../components/calendar/CalendarView";
import { listarMaterias } from "../../services/subjectService";
import { criarEvento } from "../../services/eventService";
import { useModal } from "../../contexts/ModalContext";
import "./CronogramaPage.css";

const DEFAULT_SUBJECTS = [
  { id: "matematica", name: "Matemática", color: "#2563eb" },
  { id: "linguagens", name: "Linguagens", color: "#db2777" },
  { id: "natureza", name: "Ciências da Natureza", color: "#059669" },
  { id: "humanas", name: "Ciências Humanas", color: "#d97706" },
  { id: "redacao", name: "Redação", color: "#7c3aed" },
];

const DAY_OPTIONS = [
  { id: "seg", label: "Seg" },
  { id: "ter", label: "Ter" },
  { id: "qua", label: "Qua" },
  { id: "qui", label: "Qui" },
  { id: "sex", label: "Sex" },
  { id: "sab", label: "Sáb" },
  { id: "dom", label: "Dom" },
];

const OBJECTIVES = [
  {
    id: "enem",
    label: "ENEM",
    description: "Rotina forte em conteúdos recorrentes, redação e simulados.",
    targetName: "ENEM 2026",
    weeklyHours: 24,
    intensity: "intenso",
    selectedDays: ["seg", "ter", "qua", "qui", "sex", "sab"],
    tags: ["Alta incidência", "Redação semanal", "Simulado quinzenal"],
  },
  {
    id: "vestibular",
    label: "Vestibular",
    description: "Plano por edital, com teoria direcionada e listas de questões.",
    targetName: "Vestibular 2026",
    weeklyHours: 20,
    intensity: "equilibrado",
    selectedDays: ["seg", "ter", "qua", "qui", "sex", "sab"],
    tags: ["Edital alvo", "Lista de questões", "Revisão por frente"],
  },
  {
    id: "reforco",
    label: "Reforço escolar",
    description: "Carga mais leve para acompanhar provas, trabalhos e base teórica.",
    targetName: "Reforço escolar",
    weeklyHours: 10,
    intensity: "essencial",
    selectedDays: ["seg", "qua", "sex"],
    tags: ["Base teórica", "Exercícios guiados", "Provas da escola"],
  },
  {
    id: "personalizado",
    label: "Meta própria",
    description: "Ponto de partida flexível para ajustar sua rotina manualmente.",
    targetName: "Meta própria",
    weeklyHours: 16,
    intensity: "equilibrado",
    selectedDays: ["seg", "ter", "qua", "qui", "sex"],
    tags: ["Prioridades livres", "Rotina flexível", "Rebalanceamento"],
  },
];

const EXAM_TYPES = [
  { id: "enem", label: "ENEM" },
  { id: "vestibular", label: "Vestibular" },
  { id: "concurso", label: "Concurso" },
  { id: "escolar", label: "Provas escolares" },
];

const INTENSITIES = [
  { id: "essencial", label: "Essencial", sessions: 1 },
  { id: "equilibrado", label: "Equilibrado", sessions: 2 },
  { id: "intenso", label: "Intenso", sessions: 3 },
];

const STUDY_MODES = [
  {
    id: "misto",
    label: "Teoria + questões",
    sessionTypes: ["Aula", "Questões", "Revisão"],
  },
  {
    id: "questoes",
    label: "Mais questões",
    sessionTypes: ["Teoria rápida", "Questões", "Correção"],
  },
  {
    id: "revisao",
    label: "Mais revisão",
    sessionTypes: ["Revisão", "Flashcards", "Questões"],
  },
];

const SIMULATION_FREQUENCIES = [
  { id: "nenhum", label: "Sem simulado" },
  { id: "mensal", label: "Mensal" },
  { id: "quinzenal", label: "Quinzenal" },
  { id: "semanal", label: "Semanal" },
];

const SCHEDULE_EVENT_MARKER = "[STUDYSPHERE_SCHEDULE]";

const DAY_INDEX_BY_ID = {
  dom: 0,
  seg: 1,
  ter: 2,
  qua: 3,
  qui: 4,
  sex: 5,
  sab: 6,
};

function getDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultEndDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 4);
  return getDateInputValue(date);
}

function parseLocalDate(value) {
  return new Date(`${value}T00:00:00`);
}

function getWeeksBetween(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const diff = end.getTime() - start.getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  if (Number.isNaN(diff) || diff <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(diff / weekMs));
}

function getSubjectName(subject) {
  return subject.name || subject.nome || subject.title || "Matéria";
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "08:00")
    .split(":")
    .map((part) => Number(part));

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 8 * 60;
  }

  return hours * 60 + minutes;
}

function buildWeeklyPlan({
  subjects,
  selectedDays,
  weeklyHours,
  intensity,
  studyMode,
  studyStartTime,
  sessionGapMinutes,
  minSessionMinutes,
}) {
  const activeSubjects = subjects.length ? subjects : DEFAULT_SUBJECTS;
  const activeDays = selectedDays.length ? selectedDays : ["seg"];
  const dailyMinutes = Math.max(30, Math.round((weeklyHours * 60) / activeDays.length));
  const sessionCount = INTENSITIES.find((item) => item.id === intensity)?.sessions || 2;
  const sessionTypes =
    STUDY_MODES.find((item) => item.id === studyMode)?.sessionTypes || STUDY_MODES[0].sessionTypes;
  const gapMinutes = Math.max(0, Number(sessionGapMinutes) || 0);
  const minimumMinutes = Math.max(15, Number(minSessionMinutes) || 25);

  return DAY_OPTIONS.map((day) => {
    if (!selectedDays.includes(day.id)) {
      return {
        ...day,
        isRestDay: true,
        sessions: [],
      };
    }

    const activeDayIndex = activeDays.indexOf(day.id);
    const primarySubject = activeSubjects[activeDayIndex % activeSubjects.length];
    const secondarySubject = activeSubjects[(activeDayIndex + 2) % activeSubjects.length];
    const reviewSubject = activeSubjects[(activeDayIndex + 4) % activeSubjects.length];
    const splitMinutes = Math.max(minimumMinutes, Math.floor(dailyMinutes / sessionCount));
    let startMinutes = timeToMinutes(studyStartTime);

    const sessions = [
      {
        type: sessionTypes[0],
        title: getSubjectName(primarySubject),
        minutes: splitMinutes,
        startMinutes,
        color: primarySubject.color || "#2563eb",
      },
    ];

    if (sessionCount >= 2) {
      startMinutes += splitMinutes + gapMinutes;
      sessions.push({
        type: sessionTypes[1],
        title: getSubjectName(secondarySubject),
        minutes: splitMinutes,
        startMinutes,
        color: secondarySubject.color || "#059669",
      });
    }

    if (sessionCount >= 3) {
      startMinutes += splitMinutes + gapMinutes;
      sessions.push({
        type: sessionTypes[2],
        title: getSubjectName(reviewSubject),
        minutes: splitMinutes,
        startMinutes,
        color: reviewSubject.color || "#d97706",
      });
    }

    return {
      ...day,
      isRestDay: false,
      sessions,
    };
  });
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function createSessionDate(baseDate, minutesFromMidnight) {
  const date = new Date(baseDate);
  date.setHours(0, minutesFromMidnight, 0, 0);
  return date;
}

function isDateInsidePausePeriods(date, pausePeriods) {
  return pausePeriods.some((pause) => {
    const pauseStart = parseLocalDate(pause.startDate);
    const pauseEnd = parseLocalDate(pause.endDate);
    return date >= pauseStart && date <= pauseEnd;
  });
}

function getFirstOccurrence(startDate, targetDayIndex) {
  const start = parseLocalDate(startDate);
  const offset = (targetDayIndex - start.getDay() + 7) % 7;
  return addDays(start, offset);
}

function buildCalendarEventsFromPreview(preview) {
  const end = parseLocalDate(preview.endDate);
  const events = [];

  preview.weeklyPlan.forEach((day) => {
    if (day.isRestDay) return;

    let occurrenceDate = getFirstOccurrence(preview.startDate, DAY_INDEX_BY_ID[day.id]);

    while (occurrenceDate <= end) {
      if (!isDateInsidePausePeriods(occurrenceDate, preview.pausePeriods)) {
        day.sessions.forEach((session) => {
          const startDate = createSessionDate(occurrenceDate, session.startMinutes);
          const endDate = new Date(startDate.getTime() + session.minutes * 60 * 1000);

          events.push({
            title: `${session.type}: ${session.title}`,
            description:
              `${SCHEDULE_EVENT_MARKER}\n` +
              `Cronograma ${preview.title}\n` +
              `Objetivo: ${preview.objective.label}\n` +
              `Tipos de prova: ${preview.examTypesLabel}\n` +
              `Bloco: ${session.type}\n` +
              `Gerado pelo criador de cronograma personalizado.`,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            all_day: false,
            color: session.color || "#2563eb",
          });
        });
      }

      occurrenceDate = addDays(occurrenceDate, 7);
    }
  });

  return events;
}

export default function CronogramaPage() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  const activeTab = tab === "criar" ? "criar" : "calendario";
  const isScheduleModalOpen = activeTab === "criar";
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [calendarVersion, setCalendarVersion] = useState(0);
  const [creationStep, setCreationStep] = useState("config");
  const [draftPresetId, setDraftPresetId] = useState("enem");
  const [pauseDraft, setPauseDraft] = useState({
    startDate: "",
    endDate: "",
    label: "",
  });
  const [form, setForm] = useState({
    objective: OBJECTIVES[0].id,
    examTypes: ["enem"],
    targetName: OBJECTIVES[0].targetName,
    startDate: getDateInputValue(new Date()),
    endDate: getDefaultEndDate(),
    weeklyHours: OBJECTIVES[0].weeklyHours,
    intensity: OBJECTIVES[0].intensity,
    studyMode: "misto",
    studyStartTime: "08:00",
    sessionGapMinutes: 15,
    minSessionMinutes: 25,
    simulationFrequency: "quinzenal",
    includeEssay: true,
    pausePeriods: [],
    selectedDays: OBJECTIVES[0].selectedDays,
    selectedSubjects: DEFAULT_SUBJECTS.map((subject) => subject.id),
  });

  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await listarMaterias();
        if (!Array.isArray(data) || data.length === 0) return;

        const mappedSubjects = data.map((subject) => ({
          ...subject,
          id: String(subject.id),
          name: getSubjectName(subject),
          color: subject.color || "#2563eb",
        }));

        setSubjects(mappedSubjects);
        setForm((current) => ({
          ...current,
          selectedSubjects: mappedSubjects.slice(0, 6).map((subject) => subject.id),
        }));
      } catch (error) {
        console.error("Erro ao carregar matérias para o cronograma:", error);
      }
    }

    loadSubjects();
  }, []);

  const selectedObjective = useMemo(
    () => OBJECTIVES.find((objective) => objective.id === form.objective) || OBJECTIVES[0],
    [form.objective]
  );

  const selectedSubjects = useMemo(() => {
    const selected = subjects.filter((subject) => form.selectedSubjects.includes(String(subject.id)));

    if (!form.includeEssay || !form.examTypes.includes("enem")) {
      return selected;
    }

    const hasEssay = selected.some((subject) =>
      getSubjectName(subject).toLowerCase().includes("redação")
    );

    if (hasEssay) {
      return selected;
    }

    const essaySubject =
      subjects.find((subject) => getSubjectName(subject).toLowerCase().includes("redação")) ||
      DEFAULT_SUBJECTS.find((subject) => subject.id === "redacao");

    return essaySubject ? [...selected, essaySubject] : selected;
  }, [form.examTypes, form.includeEssay, form.selectedSubjects, subjects]);

  const weeksToTarget = useMemo(
    () => getWeeksBetween(form.startDate, form.endDate),
    [form.startDate, form.endDate]
  );

  const weeklyPlan = useMemo(
    () =>
      buildWeeklyPlan({
        subjects: selectedSubjects,
        selectedDays: form.selectedDays,
        weeklyHours: Number(form.weeklyHours),
        intensity: form.intensity,
        studyMode: form.studyMode,
        studyStartTime: form.studyStartTime,
        sessionGapMinutes: Number(form.sessionGapMinutes),
        minSessionMinutes: Number(form.minSessionMinutes),
      }),
    [
      form.intensity,
      form.minSessionMinutes,
      form.selectedDays,
      form.sessionGapMinutes,
      form.studyMode,
      form.studyStartTime,
      form.weeklyHours,
      selectedSubjects,
    ]
  );

  const totalHours = weeksToTarget * Number(form.weeklyHours);
  const dailyAverage = form.selectedDays.length
    ? (Number(form.weeklyHours) / form.selectedDays.length).toFixed(1)
    : "0";
  const selectedExamTypes = EXAM_TYPES.filter((type) => form.examTypes.includes(type.id));
  const selectedStudyMode =
    STUDY_MODES.find((mode) => mode.id === form.studyMode) || STUDY_MODES[0];
  const selectedSimulationFrequency =
    SIMULATION_FREQUENCIES.find((frequency) => frequency.id === form.simulationFrequency) ||
    SIMULATION_FREQUENCIES[0];

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function toggleDay(dayId) {
    setForm((current) => {
      const isSelected = current.selectedDays.includes(dayId);
      const selectedDays = isSelected
        ? current.selectedDays.filter((day) => day !== dayId)
        : [...current.selectedDays, dayId];

      return {
        ...current,
        selectedDays,
      };
    });
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function toggleSubject(subjectId) {
    setForm((current) => {
      const id = String(subjectId);
      const isSelected = current.selectedSubjects.includes(id);
      const selectedSubjects = isSelected
        ? current.selectedSubjects.filter((subject) => subject !== id)
        : [...current.selectedSubjects, id];

      return {
        ...current,
        selectedSubjects,
      };
    });
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function toggleExamType(examTypeId) {
    setForm((current) => {
      const isSelected = current.examTypes.includes(examTypeId);
      const examTypes = isSelected
        ? current.examTypes.filter((type) => type !== examTypeId)
        : [...current.examTypes, examTypeId];

      return {
        ...current,
        examTypes,
      };
    });
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function updatePauseDraft(field, value) {
    setPauseDraft((current) => ({
      ...current,
      [field]: value,
    }));
    setPreviewError("");
  }

  function addPausePeriod() {
    if (!pauseDraft.startDate || !pauseDraft.endDate) {
      setPreviewError("Informe início e término para adicionar uma pausa.");
      return;
    }

    if (parseLocalDate(pauseDraft.endDate) < parseLocalDate(pauseDraft.startDate)) {
      setPreviewError("A pausa precisa terminar depois da data de início.");
      return;
    }

    setForm((current) => ({
      ...current,
      pausePeriods: [
        ...current.pausePeriods,
        {
          id: `${pauseDraft.startDate}-${pauseDraft.endDate}-${Date.now()}`,
          startDate: pauseDraft.startDate,
          endDate: pauseDraft.endDate,
          label: pauseDraft.label.trim() || "Pausa",
        },
      ],
    }));
    setPauseDraft({
      startDate: "",
      endDate: "",
      label: "",
    });
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function removePausePeriod(pauseId) {
    setForm((current) => ({
      ...current,
      pausePeriods: current.pausePeriods.filter((pause) => pause.id !== pauseId),
    }));
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function resetDraft() {
    const defaultPreset = OBJECTIVES[0];
    setForm({
      objective: defaultPreset.id,
      examTypes: ["enem"],
      targetName: defaultPreset.targetName,
      startDate: getDateInputValue(new Date()),
      endDate: getDefaultEndDate(),
      weeklyHours: defaultPreset.weeklyHours,
      intensity: defaultPreset.intensity,
      studyMode: "misto",
      studyStartTime: "08:00",
      sessionGapMinutes: 15,
      minSessionMinutes: 25,
      simulationFrequency: "quinzenal",
      includeEssay: true,
      pausePeriods: [],
      selectedDays: defaultPreset.selectedDays,
      selectedSubjects: subjects.slice(0, 6).map((subject) => String(subject.id)),
    });
    setDraftPresetId(defaultPreset.id);
    setPauseDraft({
      startDate: "",
      endDate: "",
      label: "",
    });
    setCreationStep("config");
    setGeneratedPreview(null);
    setPreviewError("");
  }

  function openPresetModal() {
    setDraftPresetId(form.objective);
    setIsPresetModalOpen(true);
  }

  function applyPreset() {
    const preset = OBJECTIVES.find((objective) => objective.id === draftPresetId) || OBJECTIVES[0];
    const presetExamTypes =
      preset.id === "enem"
        ? ["enem"]
        : preset.id === "vestibular"
          ? ["vestibular"]
          : preset.id === "reforco"
            ? ["escolar"]
            : form.examTypes.length
              ? form.examTypes
              : ["enem"];

    setForm((current) => ({
      ...current,
      objective: preset.id,
      examTypes: presetExamTypes,
      targetName: preset.targetName,
      weeklyHours: preset.weeklyHours,
      intensity: preset.intensity,
      selectedDays: preset.selectedDays,
    }));
    setGeneratedPreview(null);
    setPreviewError("");
    setIsPresetModalOpen(false);
  }

  function closeScheduleModal() {
    setIsPresetModalOpen(false);
    navigate("/cronograma/calendario");
  }

  function refreshPreview() {
    const weeklyHours = Number(form.weeklyHours);
    const sessionGapMinutes = Number(form.sessionGapMinutes);
    const minSessionMinutes = Number(form.minSessionMinutes);

    if (parseLocalDate(form.endDate) < parseLocalDate(form.startDate)) {
      setPreviewError("A data alvo precisa ser posterior à data de início.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    if (!Number.isFinite(weeklyHours) || weeklyHours < 1) {
      setPreviewError("Informe uma carga horária semanal válida para gerar a prévia.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    if (!Number.isFinite(sessionGapMinutes) || sessionGapMinutes < 0) {
      setPreviewError("Informe um intervalo válido entre os blocos.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    if (!Number.isFinite(minSessionMinutes) || minSessionMinutes < 15) {
      setPreviewError("A duração mínima por bloco precisa ser de pelo menos 15 minutos.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    if (form.selectedDays.length === 0) {
      setPreviewError("Selecione pelo menos um dia disponível para gerar a prévia.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    if (selectedSubjects.length === 0) {
      setPreviewError("Selecione pelo menos uma matéria para montar o cronograma.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    if (form.examTypes.length === 0) {
      setPreviewError("Selecione pelo menos um tipo de prova.");
      setGeneratedPreview(null);
      setCreationStep("config");
      return;
    }

    setPreviewError("");
    setGeneratedPreview({
      title: form.targetName.trim() || "Cronograma personalizado",
      weeklyHours,
      weeksToTarget,
      selectedDaysCount: form.selectedDays.length,
      startDate: form.startDate,
      endDate: form.endDate,
      objective: selectedObjective,
      examTypes: selectedExamTypes,
      examTypesLabel: selectedExamTypes.map((type) => type.label).join(", "),
      studyMode: selectedStudyMode,
      simulationFrequency: selectedSimulationFrequency,
      includeEssay: form.includeEssay,
      pausePeriods: form.pausePeriods,
      weeklyPlan,
      totalHours,
      dailyAverage,
      generatedAt: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    });
    setCreationStep("preview");
  }

  async function createScheduleInCalendar() {
    if (!generatedPreview) {
      setPreviewError("Gere uma prévia antes de criar o cronograma no calendário.");
      return;
    }

    const calendarEvents = buildCalendarEventsFromPreview(generatedPreview);

    if (calendarEvents.length === 0) {
      setPreviewError("Não há blocos suficientes para criar eventos no calendário.");
      return;
    }

    const confirmed = await showConfirm(
      `Isso criará ${calendarEvents.length} eventos no calendário entre ${generatedPreview.startDate} e ${generatedPreview.endDate}. Deseja continuar?`,
      "Criar cronograma",
      "warning"
    );

    if (!confirmed) return;

    try {
      setIsCreatingSchedule(true);
      for (const eventData of calendarEvents) {
        await criarEvento(eventData);
      }
      await showAlert(
        `${calendarEvents.length} eventos adicionados ao calendário.`,
        "success",
        "Cronograma criado"
      );
      setCalendarVersion((currentVersion) => currentVersion + 1);
      navigate("/cronograma/calendario");
    } catch (error) {
      console.error("Erro ao criar cronograma no calendário:", error.response?.data || error);
      await showAlert(
        error.response?.data?.message || "Erro ao criar cronograma no calendário. Tente novamente.",
        "error",
        "Erro"
      );
    } finally {
      setIsCreatingSchedule(false);
    }
  }

  return (
    <main className="cronograma-page">
      <header className="cronograma-header">
        <div>
          <h1 className="cronograma-title">Cronograma</h1>
          <p className="cronograma-subtitle">
            Calendário, metas e plano personalizado em um só lugar.
          </p>
        </div>
      </header>

      <nav className="cronograma-tabs" aria-label="Submenus de cronograma">
        <NavLink
          to="/cronograma/calendario"
          className={({ isActive }) =>
            `cronograma-tab ${isActive || activeTab === "calendario" ? "active" : ""}`
          }
        >
          <CalendarDays size={18} />
          <span>Calendário</span>
        </NavLink>
        <NavLink
          to="/cronograma/criar"
          className={({ isActive }) =>
            `cronograma-tab ${isActive || activeTab === "criar" ? "active" : ""}`
          }
        >
          <Sparkles size={18} />
          <span>Criar cronograma personalizado</span>
        </NavLink>
      </nav>

      <section className="cronograma-calendar" aria-label="Calendário">
        <CalendarView key={calendarVersion} />
      </section>

      {isScheduleModalOpen && (
        <div className="schedule-builder-modal-overlay" onClick={closeScheduleModal}>
          <div
            className="schedule-builder-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-builder-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="schedule-builder-modal-header">
              <div>
                <h2 id="schedule-builder-modal-title">Criar cronograma personalizado</h2>
                <p>Prova, datas, ritmo e matérias em um só fluxo.</p>
              </div>
              <button
                type="button"
                className="schedule-builder-close-button"
                onClick={closeScheduleModal}
                aria-label="Fechar criador de cronograma"
              >
                <X size={20} />
              </button>
            </div>

            <div className="schedule-builder-step-tabs" role="tablist" aria-label="Etapas do criador">
              <button
                type="button"
                className={creationStep === "config" ? "active" : ""}
                onClick={() => setCreationStep("config")}
              >
                <span>1</span>
                Configuração
              </button>
              <button
                type="button"
                className={creationStep === "preview" ? "active" : ""}
                onClick={() => setCreationStep("preview")}
              >
                <span>2</span>
                Prévia
              </button>
            </div>

            <div className="schedule-builder-modal-body">
              <div className="cronograma-kpis" aria-label="Resumo do cronograma">
                <article className="cronograma-kpi">
                  <Target size={20} />
                  <div>
                    <span>Objetivo</span>
                    <strong>{selectedObjective.label}</strong>
                  </div>
                </article>
                <article className="cronograma-kpi">
                  <CalendarDays size={20} />
                  <div>
                    <span>Duração</span>
                    <strong>{weeksToTarget} semanas</strong>
                  </div>
                </article>
                <article className="cronograma-kpi">
                  <Clock3 size={20} />
                  <div>
                    <span>Ritmo</span>
                    <strong>{dailyAverage}h por dia ativo</strong>
                  </div>
                </article>
                <article className="cronograma-kpi">
                  <CheckCircle2 size={20} />
                  <div>
                    <span>Carga total</span>
                    <strong>{totalHours}h planejadas</strong>
                  </div>
                </article>
              </div>

              <div className={creationStep === "config" ? "schedule-config-step" : "schedule-preview-step"}>
                {creationStep === "config" && (
                <form className="planner-form-surface">
                  <div className="planner-section-heading">
                    <div className="planner-heading-icon">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h2>Predefinição do cronograma</h2>
                      <p>Base de distribuição para conteúdos, questões e revisões.</p>
                    </div>
                  </div>

                  <div className="selected-preset-panel">
                    <div className="selected-preset-main">
                      <div className="selected-preset-icon">
                        <Sparkles size={19} />
                      </div>
                      <div>
                        <span>Selecionada</span>
                        <strong>{selectedObjective.label}</strong>
                        <p>{selectedObjective.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="planner-secondary-button planner-compact-button"
                      onClick={openPresetModal}
                    >
                      <Sparkles size={16} />
                      Escolher
                    </button>
                  </div>

                  <div className="planner-fields-grid">
                    <label className="planner-field">
                      <span>Prova ou meta</span>
                      <input
                        type="text"
                        value={form.targetName}
                        onChange={(event) => updateField("targetName", event.target.value)}
                      />
                    </label>

                    <label className="planner-field">
                      <span>Horas por semana</span>
                      <div className="hours-control">
                        <input
                          type="range"
                          min="4"
                          max="60"
                          step="1"
                          value={form.weeklyHours}
                          onChange={(event) => updateField("weeklyHours", event.target.value)}
                        />
                        <input
                          type="number"
                          min="4"
                          max="60"
                          value={form.weeklyHours}
                          onChange={(event) => updateField("weeklyHours", event.target.value)}
                        />
                      </div>
                    </label>

                    <label className="planner-field">
                      <span>Início</span>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(event) => updateField("startDate", event.target.value)}
                      />
                    </label>

                    <label className="planner-field">
                      <span>Data alvo</span>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(event) => updateField("endDate", event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="planner-control-group">
                    <div className="planner-label-row">
                      <Target size={17} />
                      <span>Tipo de prova</span>
                    </div>
                    <div className="exam-type-grid">
                      {EXAM_TYPES.map((examType) => (
                        <label key={examType.id} className="exam-type-option">
                          <input
                            type="checkbox"
                            checked={form.examTypes.includes(examType.id)}
                            onChange={() => toggleExamType(examType.id)}
                          />
                          <span>{examType.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="planner-control-group">
                    <div className="planner-label-row">
                      <Clock3 size={17} />
                      <span>Períodos de pausa</span>
                    </div>
                    <div className="pause-period-editor">
                      <label className="planner-field">
                        <span>Início</span>
                        <input
                          type="date"
                          value={pauseDraft.startDate}
                          onChange={(event) => updatePauseDraft("startDate", event.target.value)}
                        />
                      </label>
                      <label className="planner-field">
                        <span>Término</span>
                        <input
                          type="date"
                          value={pauseDraft.endDate}
                          onChange={(event) => updatePauseDraft("endDate", event.target.value)}
                        />
                      </label>
                      <label className="planner-field">
                        <span>Nome</span>
                        <input
                          type="text"
                          value={pauseDraft.label}
                          placeholder="Férias, viagem..."
                          onChange={(event) => updatePauseDraft("label", event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        className="planner-secondary-button pause-add-button"
                        onClick={addPausePeriod}
                      >
                        Adicionar
                      </button>
                    </div>

                    <div className="pause-period-list">
                      {form.pausePeriods.length === 0 ? (
                        <span className="pause-empty">Nenhum período de pausa adicionado</span>
                      ) : (
                        form.pausePeriods.map((pause) => (
                          <div key={pause.id} className="pause-period-item">
                            <div>
                              <strong>{pause.label}</strong>
                              <span>
                                {pause.startDate} até {pause.endDate}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePausePeriod(pause.id)}
                              aria-label={`Remover pausa ${pause.label}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="planner-control-group">
                    <div className="planner-label-row">
                      <Layers3 size={17} />
                      <span>Profundidade</span>
                    </div>
                    <div className="intensity-segmented">
                      {INTENSITIES.map((intensity) => (
                        <button
                          type="button"
                          key={intensity.id}
                          className={form.intensity === intensity.id ? "active" : ""}
                          onClick={() => updateField("intensity", intensity.id)}
                        >
                          {intensity.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="planner-fields-grid planner-preferences-grid">
                    <label className="planner-field">
                      <span>Início dos blocos</span>
                      <input
                        type="time"
                        value={form.studyStartTime}
                        onChange={(event) => updateField("studyStartTime", event.target.value)}
                      />
                    </label>

                    <label className="planner-field">
                      <span>Intervalo entre blocos</span>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={form.sessionGapMinutes}
                        onChange={(event) => updateField("sessionGapMinutes", event.target.value)}
                      />
                    </label>

                    <label className="planner-field">
                      <span>Duração mínima</span>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={form.minSessionMinutes}
                        onChange={(event) => updateField("minSessionMinutes", event.target.value)}
                      />
                    </label>

                    <label className="planner-field">
                      <span>Simulado</span>
                      <select
                        value={form.simulationFrequency}
                        onChange={(event) => updateField("simulationFrequency", event.target.value)}
                      >
                        {SIMULATION_FREQUENCIES.map((frequency) => (
                          <option key={frequency.id} value={frequency.id}>
                            {frequency.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="planner-control-group">
                    <div className="planner-label-row">
                      <ClipboardList size={17} />
                      <span>Estilo dos blocos</span>
                    </div>
                    <div className="study-mode-grid">
                      {STUDY_MODES.map((mode) => (
                        <button
                          type="button"
                          key={mode.id}
                          className={form.studyMode === mode.id ? "active" : ""}
                          onClick={() => updateField("studyMode", mode.id)}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    <label className="planner-toggle-row">
                      <input
                        type="checkbox"
                        checked={form.includeEssay}
                        onChange={(event) => updateField("includeEssay", event.target.checked)}
                      />
                      <span>Incluir redação nas prioridades</span>
                    </label>
                  </div>

                  <div className="planner-control-group">
                    <div className="planner-label-row">
                      <CalendarDays size={17} />
                      <span>Dias disponíveis</span>
                    </div>
                    <div className="day-checkbox-grid">
                      {DAY_OPTIONS.map((day) => (
                        <label key={day.id} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={form.selectedDays.includes(day.id)}
                            onChange={() => toggleDay(day.id)}
                          />
                          <span>{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="planner-control-group">
                    <div className="planner-label-row">
                      <BookOpen size={17} />
                      <span>Matérias priorizadas</span>
                    </div>
                    <div className="subject-checkbox-grid">
                      {subjects.map((subject) => (
                        <label key={subject.id} className="subject-checkbox">
                          <input
                            type="checkbox"
                            checked={form.selectedSubjects.includes(String(subject.id))}
                            onChange={() => toggleSubject(subject.id)}
                          />
                          <span
                            className="subject-color"
                            style={{ backgroundColor: subject.color || "#2563eb" }}
                          />
                          <span>{getSubjectName(subject)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="planner-actions">
                    <button type="button" className="planner-secondary-button" onClick={resetDraft}>
                      <RotateCcw size={17} />
                      Resetar
                    </button>
                    <button type="button" className="planner-primary-button" onClick={refreshPreview}>
                      <ClipboardList size={17} />
                      Gerar prévia
                    </button>
                  </div>

                  {previewError && <p className="planner-error">{previewError}</p>}
                </form>
                )}

                {creationStep === "preview" && (
                <div className="planner-preview">
                  {!generatedPreview ? (
                    <div className="preview-empty-state">
                      <div className="preview-empty-icon">
                        <ClipboardList size={24} />
                      </div>
                      <h2>Prévia ainda não gerada</h2>
                      <p>
                        Defina objetivo, carga horária, dias disponíveis e matérias para montar
                        a primeira semana do cronograma.
                      </p>
                      <button
                        type="button"
                        className="planner-primary-button"
                        onClick={() => setCreationStep("config")}
                      >
                        Voltar para configuração
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="preview-header">
                        <div>
                          <h2>{generatedPreview.title}</h2>
                          <p>
                            {generatedPreview.weeklyHours}h semanais, {generatedPreview.weeksToTarget} semanas,
                            {" "}
                            {generatedPreview.selectedDaysCount} dias ativos.
                          </p>
                        </div>
                        <span className="preview-status">Gerado às {generatedPreview.generatedAt}</span>
                      </div>

                      <div className="objective-tags">
                        {generatedPreview.objective.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <div className="preview-personalization-grid">
                        <div>
                          <span>Tipo de prova</span>
                          <strong>{generatedPreview.examTypesLabel}</strong>
                        </div>
                        <div>
                          <span>Estilo</span>
                          <strong>{generatedPreview.studyMode.label}</strong>
                        </div>
                        <div>
                          <span>Simulado</span>
                          <strong>{generatedPreview.simulationFrequency.label}</strong>
                        </div>
                        <div>
                          <span>Redação</span>
                          <strong>{generatedPreview.includeEssay ? "Incluída" : "Não incluída"}</strong>
                        </div>
                      </div>

                      {generatedPreview.pausePeriods.length > 0 && (
                        <div className="preview-pause-list">
                          <span>Pausas planejadas</span>
                          {generatedPreview.pausePeriods.map((pause) => (
                            <div key={pause.id}>
                              <strong>{pause.label}</strong>
                              <small>
                                {pause.startDate} até {pause.endDate}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="weekly-preview-grid">
                        {generatedPreview.weeklyPlan.map((day) => (
                          <article
                            key={day.id}
                            className={`preview-day-card ${day.isRestDay ? "rest" : ""}`}
                          >
                            <div className="preview-day-title">
                              <strong>{day.label}</strong>
                              <span>{day.isRestDay ? "Folga" : `${day.sessions.length} blocos`}</span>
                            </div>

                            {day.isRestDay ? (
                              <div className="rest-day-line">Pausa planejada</div>
                            ) : (
                              <div className="session-list">
                                {day.sessions.map((session) => (
                                  <div key={`${day.id}-${session.type}`} className="session-item">
                                    <span
                                      className="session-marker"
                                      style={{ backgroundColor: session.color }}
                                    />
                                    <div>
                                      <strong>{session.type}</strong>
                                      <span>
                                        {session.title} · {session.minutes}min
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </article>
                        ))}
                      </div>

                      <div className="preview-summary-strip">
                        <div>
                          <span>Objetivo</span>
                          <strong>{generatedPreview.objective.label}</strong>
                        </div>
                        <div>
                          <span>Carga total estimada</span>
                          <strong>{generatedPreview.totalHours}h</strong>
                        </div>
                        <div>
                          <span>Média por dia ativo</span>
                          <strong>{generatedPreview.dailyAverage}h</strong>
                        </div>
                      </div>

                  <div className="preview-actions">
                    <button
                      type="button"
                      className="planner-secondary-button"
                      onClick={() => setCreationStep("config")}
                    >
                      Ajustar configuração
                    </button>
                    <button
                      type="button"
                      className="planner-primary-button"
                          onClick={createScheduleInCalendar}
                          disabled={isCreatingSchedule}
                        >
                          <CalendarDays size={17} />
                          {isCreatingSchedule ? "Criando..." : "Criar no calendário"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPresetModalOpen && (
        <div className="schedule-preset-modal-overlay" onClick={() => setIsPresetModalOpen(false)}>
          <div
            className="schedule-preset-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-preset-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="schedule-preset-modal-header">
              <div>
                <h3 id="schedule-preset-modal-title">Predefinições do cronograma</h3>
                <p>Escolha um perfil inicial para montar a rotina.</p>
              </div>
              <button
                type="button"
                className="schedule-preset-close-button"
                onClick={() => setIsPresetModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="schedule-preset-grid">
              {OBJECTIVES.map((preset) => {
                const isSelected = draftPresetId === preset.id;

                return (
                  <button
                    type="button"
                    key={preset.id}
                    className={`schedule-preset-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setDraftPresetId(preset.id)}
                  >
                    <div className="schedule-preset-card-header">
                      <div>
                        <strong>{preset.label}</strong>
                        <span>{preset.weeklyHours}h/semana</span>
                      </div>
                      {isSelected && <CheckCircle2 size={20} />}
                    </div>
                    <p>{preset.description}</p>
                    <div className="schedule-preset-tags">
                      {preset.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="schedule-preset-modal-actions">
              <button
                type="button"
                className="planner-secondary-button"
                onClick={() => setIsPresetModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className="planner-primary-button" onClick={applyPreset}>
                <CheckCircle2 size={17} />
                Aplicar predefinição
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
