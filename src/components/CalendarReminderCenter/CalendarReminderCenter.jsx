import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Sprout, Volume2, X } from "lucide-react";

import weedingTodayAudio from "../../Voix 008.m4a";
import { calendrierService } from "../../services/calendrierService";
import { cultureService } from "../../services/cultureService";
import {
  buildCalendarReminders,
  markCalendarReminderAsRead,
} from "../../utils/calendarReminders";

const MAX_REMINDER_HISTORY = 100;
const REMINDER_AUDIO = {
  weeding_today: weedingTodayAudio,
};

function storageKey(userId) {
  return `agri_calendar_reminders_v1_${userId}`;
}

function readSavedReminders(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
    if (!Array.isArray(saved)) {
      throw new Error("Le format des rappels enregistrés est invalide.");
    }
    return { reminders: saved, error: "" };
  } catch (error) {
    return {
      reminders: [],
      error: error.message || "Impossible de lire les rappels enregistrés.",
    };
  }
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function findWolofVoice(voices) {
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("wo")) || null;
}

export default function CalendarReminderCenter({ cultures: suppliedCultures, userId }) {
  const [initialStorage] = useState(() => readSavedReminders(userId));
  const [reminders, setReminders] = useState(initialStorage.reminders);
  const [cultures, setCultures] = useState(suppliedCultures || []);
  const [voices, setVoices] = useState([]);
  const [calendars, setCalendars] = useState(null);
  const [showCenter, setShowCenter] = useState(false);
  const [toastReminderId, setToastReminderId] = useState(
    initialStorage.reminders.find((reminder) => !reminder.read)?.id || null
  );
  const [selectedReminderId, setSelectedReminderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState(initialStorage.error);
  const [audioPlaybackError, setAudioPlaybackError] = useState("");
  const lastAutoSpokenId = useRef("");
  const reminderAudioRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadCultures() {
      if (suppliedCultures) {
        setCultures(suppliedCultures);
        return suppliedCultures;
      }

      const data = await cultureService.getCultures();
      if (!Array.isArray(data)) {
        throw new Error("Le format des cultures reçues est invalide.");
      }
      if (active) setCultures(data);
      return data;
    }

    async function loadCalendars() {
      setLoading(true);
      setError("");

      try {
        const farmerCultures = await loadCultures();
        const calendarEntries = await Promise.all(
          farmerCultures.map(async (culture) => [
            culture.id,
            await calendrierService.getCalendar(culture.id),
          ])
        );
        if (active) {
          setCalendars(Object.fromEntries(calendarEntries));
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Impossible de charger les rappels du calendrier.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCalendars();
    return () => {
      active = false;
    };
  }, [suppliedCultures, userId]);

  useEffect(() => {
    if (!calendars) return undefined;

    function addCurrentReminders() {
      const dueReminders = buildCalendarReminders(cultures, calendars);
      const existingIds = new Set(reminders.map((reminder) => reminder.id));
      const newReminders = dueReminders.filter((reminder) => !existingIds.has(reminder.id));

      if (!newReminders.length) return;

      setToastReminderId((current) => current || newReminders[0].id);
      setReminders((current) => {
        return [
          ...dueReminders.filter((reminder) => !current.some((item) => item.id === reminder.id)),
          ...current,
        ].slice(0, MAX_REMINDER_HISTORY);
      });
    }

    addCurrentReminders();
    const intervalId = window.setInterval(addCurrentReminders, 60_000);
    return () => window.clearInterval(intervalId);
  }, [calendars, cultures, reminders]);

  useEffect(() => {
    if (initialStorage.error) return;

    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(reminders));
    } catch (saveError) {
      setStorageError(saveError.message || "Impossible d’enregistrer les rappels.");
    }
  }, [initialStorage.error, reminders, userId]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;

    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const unreadReminders = reminders.filter((reminder) => !reminder.read);
  const toastReminder = reminders.find((reminder) => reminder.id === toastReminderId) || null;
  const selectedReminder = reminders.find((reminder) => reminder.id === selectedReminderId) || null;
  const wolofVoice = findWolofVoice(voices);

  const playReminder = useCallback((reminder, automatic = false) => {
    if (reminder.audioKey && REMINDER_AUDIO[reminder.audioKey]) return;
    if (!wolofVoice || !("speechSynthesis" in window)) return;

    if (automatic && lastAutoSpokenId.current === reminder.id) return;
    if (automatic) lastAutoSpokenId.current = reminder.id;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(reminder.wolofText);
    utterance.voice = wolofVoice;
    utterance.lang = wolofVoice.lang;
    window.speechSynthesis.speak(utterance);
  }, [wolofVoice]);

  useEffect(() => {
    if (toastReminder && !toastReminder.audioKey && wolofVoice) {
      playReminder(toastReminder, true);
    }
  }, [playReminder, toastReminder, wolofVoice]);

  useEffect(() => {
    if (!selectedReminder?.audioKey || !REMINDER_AUDIO[selectedReminder.audioKey]) return;

    const audio = reminderAudioRef.current;
    if (!audio) return;

    setAudioPlaybackError("");
    audio.play().catch(() => {
      setAudioPlaybackError("La lecture automatique est bloquée par le navigateur. Appuyez sur Lecture dans le lecteur audio.");
    });
  }, [selectedReminder?.id, selectedReminder?.audioKey]);

  function markAsRead(reminderId) {
    setReminders((current) => markCalendarReminderAsRead(current, reminderId));
    setToastReminderId((current) => current === reminderId ? null : current);
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowCenter((shown) => !shown);
            setSelectedReminderId(null);
            setToastReminderId(null);
          }}
          aria-expanded={showCenter}
          aria-label={`Consulter les rappels${unreadReminders.length ? `, ${unreadReminders.length} non lus` : ""}`}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#036A38] transition hover:bg-soft"
        >
          <Bell size={22} aria-hidden="true" />
          {unreadReminders.length > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
              {unreadReminders.length > 99 ? "99+" : unreadReminders.length}
            </span>
          )}
        </button>
      </div>

      {showCenter && (
        <aside
          aria-label="Centre des rappels agricoles"
          className="fixed right-4 top-[4.5rem] z-[60] max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-earth bg-white p-4 shadow-2xl sm:right-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Rappels agricoles</h2>
            <button
              type="button"
              onClick={() => setShowCenter(false)}
              aria-label="Fermer les rappels"
              className="rounded-md p-1 text-muted hover:bg-sand"
            >
              <X size={20} />
            </button>
          </div>
          {loading && <p className="text-sm text-muted">Vérification du calendrier…</p>}
          {error && <p role="alert" className="mb-2 text-sm text-red-700">{error}</p>}
          {storageError && <p role="alert" className="mb-2 text-sm text-red-700">{storageError}</p>}
          {!loading && !reminders.length && (
            <p className="text-sm text-muted">Aucun rappel récent. Les opérations prévues dans deux jours et celles du jour apparaîtront ici.</p>
          )}
          <ul className="space-y-3">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="rounded-xl border border-earth p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {reminder.read ? "Lu" : "À lire"} · {reminder.reminderType === "today" ? "Aujourd’hui" : "Dans deux jours"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReminderId(reminder.id);
                    markAsRead(reminder.id);
                    setShowCenter(false);
                  }}
                  className="mt-1 block w-full text-left"
                >
                  <span className="font-semibold text-ink">{reminder.operationName} · {reminder.cultureName}</span>
                  <span className="block text-sm text-muted">{formatDate(reminder.operationDate)}</span>
                </button>
                {reminder.audioKey && REMINDER_AUDIO[reminder.audioKey] && (
                  <audio
                    controls
                    preload="none"
                    src={REMINDER_AUDIO[reminder.audioKey]}
                    className="mt-3 w-full"
                    aria-label={`Message vocal en wolof pour ${reminder.operationName}`}
                  >
                    Votre navigateur ne prend pas en charge la lecture audio.
                  </audio>
                )}
              </li>
            ))}
          </ul>
          {!wolofVoice && !loading && reminders.some((reminder) => !reminder.audioKey) && (
            <p className="mt-3 text-xs leading-5 text-muted">
              Aucune voix wolof n’est disponible sur cet appareil. Le texte reste consultable ; installe une voix wolof pour activer la lecture.
            </p>
          )}
        </aside>
      )}

      {toastReminder && (
        <div className="fixed right-4 top-20 z-[55] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-earth bg-white p-4 shadow-xl sm:right-6">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                markAsRead(toastReminder.id);
                setSelectedReminderId(toastReminder.id);
                setShowCenter(false);
              }}
              className="flex w-full gap-3 text-left transition hover:-translate-y-0.5"
              aria-label={`Ouvrir le rappel ${toastReminder.operationName}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary" aria-hidden="true">
                <Sprout size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold uppercase tracking-wide text-primary">
                  Agri-Conseil · {toastReminder.reminderType === "today" ? "Aujourd’hui" : "Dans deux jours"}
                </span>
                <span className="mt-1 block font-semibold text-ink">{toastReminder.operationName} · {toastReminder.cultureName}</span>
                <span lang="wo" className="mt-1 block text-sm text-ink">{toastReminder.wolofText}</span>
                <span className="mt-1 block text-xs text-muted">Touchez pour ouvrir le rappel</span>
              </span>
            </button>
            {toastReminder.audioKey && REMINDER_AUDIO[toastReminder.audioKey] && (
              <audio
                controls
                preload="none"
                src={REMINDER_AUDIO[toastReminder.audioKey]}
                className="mt-3 w-full"
                aria-label={`Écouter en wolof : ${toastReminder.operationName} aujourd’hui`}
              >
                Votre navigateur ne prend pas en charge la lecture audio.
              </audio>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToastReminderId(null)}
            aria-label="Fermer le nouveau rappel"
            className="shrink-0 rounded-md p-1 text-muted hover:bg-sand"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {selectedReminder && (
        <div className="fixed right-4 top-20 z-[55] w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-earth bg-white p-5 shadow-xl sm:right-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary" aria-hidden="true">
              <Sprout size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                Agri-Conseil · {selectedReminder.reminderType === "today" ? "Aujourd’hui" : "Dans deux jours"}
              </p>
              <p className="mt-1 font-semibold text-ink">{selectedReminder.operationName} · {selectedReminder.cultureName}</p>
              <p className="text-sm text-muted">{formatDate(selectedReminder.operationDate)}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedReminderId(null)}
              aria-label="Fermer le rappel"
              className="rounded-md p-1 text-muted hover:bg-sand"
            >
              <X size={18} />
            </button>
          </div>
          <p lang="wo" className="mt-4 rounded-xl bg-sand p-3 text-ink">{selectedReminder.wolofText}</p>
          {selectedReminder.audioKey && REMINDER_AUDIO[selectedReminder.audioKey] ? (
            <>
              <audio
                ref={reminderAudioRef}
                controls
                preload="auto"
                src={REMINDER_AUDIO[selectedReminder.audioKey]}
                className="mt-3 w-full"
                aria-label={`Message vocal en wolof pour ${selectedReminder.operationName}`}
              >
                Votre navigateur ne prend pas en charge la lecture audio.
              </audio>
              {audioPlaybackError && (
                <p role="status" className="mt-2 text-xs text-muted">{audioPlaybackError}</p>
              )}
            </>
          ) : wolofVoice ? (
            <button
              type="button"
              onClick={() => playReminder(selectedReminder)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary"
            >
              <Volume2 size={16} />
              Réécouter
            </button>
          ) : (
            <p className="mt-3 text-xs leading-5 text-muted">
              Aucune voix wolof n’est disponible sur cet appareil. Le texte reste consultable.
            </p>
          )}
        </div>
      )}
    </>
  );
}
