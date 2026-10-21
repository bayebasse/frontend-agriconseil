import assert from "node:assert/strict";
import {
  buildCalendarReminders,
  markCalendarReminderAsRead,
} from "../src/utils/calendarReminders.js";

const cultures = [
  { id: 10, culture_nom: "Mil" },
  { id: 20, culture_nom: "Riz" },
];
const calendars = {
  10: {
    operations: [
      { id: 1, nom: "Désherbage", date_debut: "2026-10-19" },
      { id: 6, nom: "Désherbage", date_debut: "2026-10-17" },
      { id: 2, nom: "Récolte", date_debut: "2026-10-17" },
      { id: 3, nom: "Fertilisation", date_debut: "2026-10-20" },
      { id: 5, nom: "Récolte", date_debut: "2026-10-17", statut: "terminee" },
    ],
  },
  20: {
    operations: [
      { id: 4, nom: "Semis", date_debut: "2026-10-17" },
    ],
  },
};
const today = new Date(2026, 9, 17, 12);

assert.deepEqual(
  buildCalendarReminders(cultures, calendars, today).map(({ id, reminderType }) => [id, reminderType]),
  [
    ["10:6:today:2026-10-17:audio-v1", "today"],
    ["10:2:today:2026-10-17", "today"],
    ["20:4:today:2026-10-17", "today"],
    ["10:1:in_two_days:2026-10-19", "in_two_days"],
  ],
  "only operations scheduled today or in two days create reminders"
);
assert.equal(
  buildCalendarReminders(cultures, calendars, today)
    .find((reminder) => reminder.id === "10:6:today:2026-10-17:audio-v1").audioKey,
  "weeding_today",
  "the recorded Senegalese Wolof message is assigned only to weeding scheduled today"
);
assert.equal(
  buildCalendarReminders(cultures, calendars, today)
    .find((reminder) => reminder.id === "10:6:today:2026-10-17:audio-v1").wolofText,
  "Tey, wolli am na.",
  "weeding reminders display their Wolof wording directly in the notification"
);
assert.equal(
  buildCalendarReminders(cultures, calendars, today)
    .find((reminder) => reminder.id === "10:1:in_two_days:2026-10-19").audioKey,
  null,
  "the recording is not used for a different reminder"
);
assert.equal(
  buildCalendarReminders(cultures, calendars, today)
    .find((reminder) => reminder.id === "10:2:today:2026-10-17").wolofText,
  "Tey, góob am na.",
  "harvest reminders use the Wolof wording supplied by the user"
);
const readReminders = markCalendarReminderAsRead(
  buildCalendarReminders(cultures, calendars, today),
  "10:2:today:2026-10-17"
);
assert.equal(readReminders.filter((reminder) => !reminder.read).length, 3);
assert.equal(readReminders.length, 4, "reading a reminder removes it from the unread count, not from history");

process.stdout.write("✓ calendar reminders are generated on the due date and two days before\n");
