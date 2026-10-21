function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return toDateKey(result);
}

function wolofOperationName(operationName) {
  const normalizedName = operationName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (normalizedName.includes("recolte")) return "góob";
  if (normalizedName.includes("desherbage")) return "wolli";
  if (normalizedName.includes("semis") || normalizedName.includes("plantation")) return "ji";

  return operationName;
}

function makeReminder(culture, operation, reminderType) {
  const operationWolof = wolofOperationName(operation.nom);
  const wolofText = reminderType === "today"
    ? `Tey, ${operationWolof} am na.`
    : `Ci ñaari fan, ${operationWolof} am na.`;
  const normalizedName = operation.nom
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  const audioKey = normalizedName.includes("desherbage") && reminderType === "today"
    ? "weeding_today"
    : null;
  const audioVersion = audioKey ? ":audio-v1" : "";

  return {
    id: `${culture.id}:${operation.id}:${reminderType}:${operation.date_debut}${audioVersion}`,
    cultureName: culture.culture_nom || culture.culture?.nom || "Culture",
    operationName: operation.nom,
    operationDate: operation.date_debut,
    reminderType,
    wolofText,
    audioKey,
    read: false,
  };
}

export function buildCalendarReminders(cultures, calendars, today = new Date()) {
  const todayKey = toDateKey(today);
  const inTwoDaysKey = addDays(today, 2);
  const reminders = [];

  cultures.forEach((culture) => {
    const calendar = calendars[culture.id];

    (calendar?.operations || []).forEach((operation) => {
      if (operation.statut === "terminee") return;

      if (operation.date_debut === todayKey) {
        reminders.push(makeReminder(culture, operation, "today"));
      } else if (operation.date_debut === inTwoDaysKey) {
        reminders.push(makeReminder(culture, operation, "in_two_days"));
      }
    });
  });

  return reminders.sort((first, second) => (
    first.operationDate.localeCompare(second.operationDate)
  ));
}

export function markCalendarReminderAsRead(reminders, reminderId) {
  return reminders.map((reminder) => (
    reminder.id === reminderId ? { ...reminder, read: true } : reminder
  ));
}
