const SCHEDULES_STORAGE_KEY = "studysphere:cronogramas";
const ACTIVE_SCHEDULE_ID_KEY = "studysphere:active_cronograma_id";
const SCHEDULE_CHANGE_EVENT = "studysphere:schedule_changed";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SCHEDULE_CHANGE_EVENT));
  }
}

export function getStoredSchedules() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SCHEDULES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((schedule) => {
      const weeklyHours = Number(schedule.weeklyHours) || 20;
      const selectedDays =
        Array.isArray(schedule.selectedDays) && schedule.selectedDays.length > 0
          ? schedule.selectedDays
          : ["seg", "ter", "qua", "qui", "sex"];
      const dailyHours =
        schedule.dailyHours != null
          ? Number(schedule.dailyHours)
          : schedule.dailyAverage != null
            ? Number(schedule.dailyAverage)
            : Number((weeklyHours / selectedDays.length).toFixed(1));

      return {
        ...schedule,
        title: schedule.title || schedule.targetName || "Cronograma",
        weeklyHours,
        selectedDays,
        dailyHours,
        dailyAverage: dailyHours,
      };
    });
  } catch (err) {
    console.error("Erro ao ler cronogramas salvos:", err);
    return [];
  }
}

export function saveStoredSchedules(schedules) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    notifyChange();
  } catch (err) {
    console.error("Erro ao salvar cronogramas:", err);
  }
}

export function getActiveScheduleId() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const id = window.localStorage.getItem(ACTIVE_SCHEDULE_ID_KEY);
    if (id !== null && id !== undefined && id !== "") {
      return id;
    }
    const schedules = getStoredSchedules();
    return schedules.length > 0 ? schedules[0].id : "";
  } catch (err) {
    console.error("Erro ao ler ID do cronograma ativo:", err);
    return "";
  }
}

export function setActiveScheduleId(scheduleId) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (scheduleId) {
      window.localStorage.setItem(ACTIVE_SCHEDULE_ID_KEY, String(scheduleId));
      const schedules = getStoredSchedules();
      const active = schedules.find((s) => String(s.id) === String(scheduleId));
      if (active && active.weeklyHours) {
        window.localStorage.setItem("study_weekly_goal_hours", String(active.weeklyHours));
      }
    } else {
      window.localStorage.setItem(ACTIVE_SCHEDULE_ID_KEY, "");
    }
    notifyChange();
  } catch (err) {
    console.error("Erro ao salvar ID do cronograma ativo:", err);
  }
}

export function getActiveSchedule() {
  const schedules = getStoredSchedules();
  if (!schedules || schedules.length === 0) {
    return null;
  }

  const activeId = getActiveScheduleId();
  if (!activeId) {
    return null;
  }

  return schedules.find((s) => String(s.id) === String(activeId)) || null;
}

export function getActiveScheduleStudyGoals() {
  const active = getActiveSchedule();
  if (!active) {
    return null;
  }

  const daysCount =
    Array.isArray(active.selectedDays) && active.selectedDays.length > 0
      ? active.selectedDays.length
      : 5;

  const weeklyHours = Number(active.weeklyHours) || 20;
  const dailyHours =
    active.dailyHours != null
      ? Number(active.dailyHours)
      : active.dailyAverage != null
        ? Number(active.dailyAverage)
        : Number((weeklyHours / daysCount).toFixed(1));

  return {
    id: active.id,
    title: active.title || "Cronograma ativo",
    dailyHours,
    weeklyHours,
    selectedDays: active.selectedDays || [],
    totalHours: active.totalHours || weeklyHours * 16,
  };
}

export function updateActiveScheduleWeeklyHours(weeklyHours) {
  const schedules = getStoredSchedules();
  const activeId = getActiveScheduleId();
  const num = Number(weeklyHours);
  if (!num || num <= 0) return;

  const updated = schedules.map((schedule) => {
    if (String(schedule.id) === String(activeId) || (!activeId && schedules.length === 1)) {
      const daysCount =
        Array.isArray(schedule.selectedDays) && schedule.selectedDays.length > 0
          ? schedule.selectedDays
          : 5;
      const dailyHours = Number((num / daysCount).toFixed(1));
      return {
        ...schedule,
        weeklyHours: num,
        dailyHours,
        dailyAverage: dailyHours,
      };
    }
    return schedule;
  });

  saveStoredSchedules(updated);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("study_weekly_goal_hours", String(num));
  }
}

export function subscribeToScheduleChanges(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => {
    callback();
  };

  window.addEventListener(SCHEDULE_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(SCHEDULE_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
