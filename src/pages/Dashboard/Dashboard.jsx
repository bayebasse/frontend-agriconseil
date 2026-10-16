import { authService } from "../../services/authService";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  CalendarDays,
  CloudRain,
  Droplets,
  Image as ImageIcon,
  Leaf,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sprout,
  Sun,
  UserRound,
  Wind,
  X,
} from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { useAuth } from "../../contexts/AuthContext";
import { cultureService } from "../../services/cultureService";
import { calendrierService } from "../../services/calendrierService";
import { meteoService } from "../../services/meteoService";
import { iaService } from "../../services/iaService";

function getCultureName(culture) {
  return (
    culture?.culture_nom ||
    culture?.culture?.nom ||
    culture?.nom ||
    "Culture"
  );
}

function getLocalisation(culture) {
  return (
    culture?.localisation ||
    culture?.commune_nom ||
    culture?.commune?.nom ||
    "Localisation non renseignée"
  );
}

function getRegionName(culture, weather) {
  return (
    weather?.region ||
    culture?.region_nom ||
    culture?.region?.nom ||
    "Région non renseignée"
  );
}

function getFirstName(user) {
  return (
    user?.first_name ||
    user?.prenom ||
    user?.username ||
    "Agriculteur"
  );
}

function parseKnowledgeSections(content) {
  if (!content || typeof content !== "string") {
    return [];
  }

  return content
    .split(/^###\s+/m)
    .slice(1)
    .map((section) => {
      const lines = section.split("\n");
      const title = (lines.shift() || "").trim().replace(/[*_`]/g, "");
      const text = lines
        .join("\n")
        .replace(/^\s*[-*]\s+/gm, "")
        .replace(/^\s*\d+[.)]\s+/gm, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .trim();

      return { title, text };
    })
    .filter((section) => section.title && section.text);
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateRange(dateStart, dateEnd) {
  if (!dateStart) {
    return "Date non renseignée";
  }

  if (!dateEnd || dateStart === dateEnd) {
    return formatDate(dateStart);
  }

  return `${formatDate(dateStart)} → ${formatDate(dateEnd)}`;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [cultures, setCultures] = useState([]);
  const [selectedCulture, setSelectedCulture] = useState(null);

  /*
   * SERVICES ACTUELS
   *
   * calendar = calendrier agricole
   * weather = météo régionale
   *
   * Le module hydrique est volontairement absent.
   */
  const [calendar, setCalendar] = useState(null);
  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  /*
   * IA
   */
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  /*
   * PROFIL
   */
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  /*
   * Deux références différentes :
   *
   * cameraInputRef = appareil photo
   * fileInputRef = galerie / fichiers
   */
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
  });

  /*
   * Synchronisation du profil avec l'utilisateur connecté
   */
  useEffect(() => {
    setProfile({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
    });
  }, [user]);

  /*
   * Chargement des cultures
   */
  useEffect(() => {
    async function loadCultures() {
      setLoading(true);
      setError("");

      try {
        const data = await cultureService.getCultures();

        const list = Array.isArray(data) ? data : [];

        setCultures(list);
        setSelectedCulture(list[0] || null);
      } catch (err) {
        setError(
          err.message ||
            "Impossible de charger vos cultures."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCultures();
  }, []);

  /*
   * Chargement du calendrier + météo
   *
   * Le calendrier et la météo sont deux services distincts.
   *
   * La météo ne dépend PAS du module hydrique.
   */
  useEffect(() => {
    async function loadCultureServices() {
      if (!selectedCulture?.id) {
        setCalendar(null);
        setWeather(null);
        return;
      }

      setServicesLoading(true);
      setError("");

      try {
        const [calendarData, weatherData] =
          await Promise.all([
            calendrierService.getCalendar(
              selectedCulture.id
            ),
            meteoService.getWeather(
              selectedCulture.id
            ),
          ]);

        setCalendar(calendarData);
        setWeather(weatherData);
      } catch (err) {
        setError(
          err.message ||
            "Impossible de charger les informations de votre culture."
        );
      } finally {
        setServicesLoading(false);
      }
    }

    loadCultureServices();
  }, [selectedCulture]);

  /*
   * Nom de la culture sélectionnée
   */
  const selectedCultureName = useMemo(
    () => getCultureName(selectedCulture),
    [selectedCulture]
  );

  /*
   * Prochaine opération provenant directement
   * du calendrier retourné par le backend.
   */
  const nextOperation =
    calendar?.prochaine_operation || null;

  /*
   * ============================================================
   * GESTION PHOTO IA
   * ============================================================
   *
   * Deux possibilités :
   *
   * 1. Prendre une photo avec l'appareil photo
   * 2. Importer une photo existante
   */

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhoto(file);
    setAnalysis(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));

    /*
     * Permet de sélectionner à nouveau le même fichier
     * plus tard si nécessaire.
     */
    event.target.value = "";
  }

  function stopCamera() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      cameraStreamRef.current = null;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  }

  async function openCamera() {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!isDesktop) {
      cameraInputRef.current?.click();
      return;
    }

    if (cameraOpen) {
      const video = cameraVideoRef.current;

      if (!video || !video.videoWidth || !video.videoHeight) {
        setError("La caméra n'est pas encore prête. Réessayez dans un instant.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Impossible de capturer l'image depuis la caméra.");
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Impossible de créer la photo capturée.");
            return;
          }

          const file = new File(
            [blob],
            `agriconseil-camera-${Date.now()}.jpg`,
            { type: "image/jpeg" }
          );

          setPhoto(file);
          setAnalysis(null);

          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
        },
        "image/jpeg",
        0.92
      );

      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      });
    } catch (err) {
      setError(
        "Impossible d'accéder à la caméra. Vérifiez l'autorisation de la caméra dans votre navigateur."
      );
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function analyzePhoto() {
    if (!photo) {
      return;
    }

    setAnalysisLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("image", photo);

      if (selectedCulture?.id) {
        formData.append(
          "culture_suivie",
          selectedCulture.id
        );
      }

      const result = await iaService.analyze(formData);

      setAnalysis(result?.resultat_ia || null);
    } catch (err) {
      setError(
        err.message ||
          "Impossible d'analyser la photo."
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  /*
   * ============================================================
   * MODIFICATION DU PROFIL
   * ============================================================
   */

  async function saveProfile(event) {
    event.preventDefault();

    setError("");
    setProfileSaved(false);

    try {
      const updatedUser =
        await authService.updateProfile({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          telephone: profile.telephone,
        });

      setProfile({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        telephone: updatedUser.telephone || "",
      });

      setEditingProfile(false);
      setProfileSaved(true);

      setTimeout(() => {
        setProfileSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err.message ||
          "Impossible de modifier votre profil."
      );
    }
  }

  /*
   * Chargement initial
   */
  if (loading) {
    return (
      <main className="min-h-[75vh] bg-sand px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-earth bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-soft border-t-primary" />

            <p className="text-muted">
              Chargement de votre espace agricole...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] bg-sand">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="mb-6 overflow-hidden rounded-[24px] bg-primary p-6 text-white shadow-[0_18px_50px_rgba(3,106,56,0.16)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/70">
                Espace agriculteur
              </span>

              <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Bonjour {getFirstName(user)}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Retrouvez ici vos cultures, votre calendrier agricole,
                la météo de votre région et votre assistant IA.
              </p>
            </div>

            <Link
              to="/culture/nouvelle"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-primary transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Ajouter une culture
            </Link>
          </div>
        </section>

        <ErrorMessage message={error} />

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="mb-6 overflow-x-auto rounded-2xl border border-earth bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">

            {[
              ["overview", "Vue d'ensemble"],
              ["cultures", "Mes cultures"],
              ["calendar", "Calendrier"],
              ["weather", "Météo"],
              ["ai", "Assistant IA"],
              ["profile", "Mon profil"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeSection === id
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-soft hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {profileSaved && (
          <div className="mb-5 rounded-xl border border-primary/20 bg-soft px-4 py-3 text-sm font-semibold text-primary">
            Profil enregistré dans l'interface.
          </div>
        )}

        {/* =====================================================
            AUCUNE CULTURE
        ====================================================== */}

        {cultures.length === 0 ? (
          <section className="rounded-[24px] border border-earth bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-primary">
              <Sprout size={30} />
            </div>

            <h2 className="mt-5 font-display text-3xl">
              Votre espace est prêt
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-muted">
              Vous n'avez pas encore enregistré de culture.
              Créez votre première culture pour générer votre
              suivi agricole personnalisé.
            </p>

            <Link
              to="/culture/nouvelle"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
            >
              <Plus size={18} />
              Créer ma culture
            </Link>
          </section>
        ) : (
          <>
            {/* =================================================
                MES CULTURES
            ================================================== */}

            {activeSection === "cultures" && (
              <section className="space-y-5">

                <div>
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                    Mes cultures
                  </span>

                  <h2 className="mt-1 font-display text-3xl">
                    Mes suivis agricoles
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {cultures.map((culture) => {
                    const active =
                      selectedCulture?.id === culture.id;

                    return (
                      <button
                        key={culture.id}
                        type="button"
                        onClick={() => {
                          setSelectedCulture(culture);
                          setActiveSection("overview");
                        }}
                        className={`rounded-2xl border p-5 text-left transition ${
                          active
                            ? "border-primary bg-soft"
                            : "border-earth bg-white hover:border-primary/40"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                            <Leaf size={21} />
                          </div>

                          {active && (
                            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                              Sélectionnée
                            </span>
                          )}
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                          {getCultureName(culture)}
                        </h3>

                        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                          <MapPin size={15} />
                          {getLocalisation(culture)}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                          <div className="rounded-xl bg-white p-3">
                            <span className="block text-muted">
                              Superficie
                            </span>

                            <strong>
                              {culture.superficie ?? "—"} ha
                            </strong>
                          </div>

                          <div className="rounded-xl bg-white p-3">
                            <span className="block text-muted">
                              Semis
                            </span>

                            <strong>
                              {formatShortDate(
                                culture.date_semis
                              )}
                            </strong>
                          </div>

                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================
                VUE D'ENSEMBLE
            ================================================== */}

            {activeSection === "overview" && (
              <section className="space-y-5">

                {/* Résumé culture + prochaine opération */}

                <div className="grid gap-5 lg:grid-cols-2">

                  {/* MA CULTURE */}

                  <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary">
                        <Leaf size={24} />
                      </div>

                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                          Ma culture
                        </span>

                        <h2 className="mt-1 text-2xl font-bold">
                          {selectedCultureName}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-xl bg-sand p-4">
                        <p className="text-sm text-muted">
                          Semis
                        </p>

                        <strong className="mt-1 block">
                          {formatShortDate(
                            selectedCulture?.date_semis
                          )}
                        </strong>
                      </div>

                      <div className="rounded-xl bg-sand p-4">
                        <p className="text-sm text-muted">
                          Stade actuel
                        </p>

                        <strong className="mt-1 block">
                          {calendar?.stade_actuel?.nom ||
                            "—"}
                        </strong>
                      </div>

                    </div>

                    <div className="mt-3 rounded-xl bg-sand p-4">

                      <p className="text-sm text-muted">
                        Fin prévue
                      </p>

                      <strong className="mt-1 block">
                        {formatDate(
                          calendar?.fin_prevue
                        )}
                      </strong>

                    </div>
                  </article>

                  {/* PROCHAINE OPÉRATION */}

                  <article className="rounded-[24px] border border-primary/20 bg-soft p-6 shadow-sm sm:p-8">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary">
                        <CalendarDays size={24} />
                      </div>

                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                          Prochaine étape
                        </span>

                        <h2 className="mt-1 text-2xl font-bold">
                          {nextOperation?.nom ||
                            "Aucune opération à venir"}
                        </h2>
                      </div>
                    </div>

                    {nextOperation ? (
                      <>
                        <p className="mt-7 text-lg font-semibold text-primary">
                          {formatDate(
                            nextOperation.date_debut
                          )}
                        </p>

                        {nextOperation.date_fin &&
                          nextOperation.date_fin !==
                            nextOperation.date_debut && (
                            <p className="mt-1 text-sm text-muted">
                              Jusqu'au{" "}
                              {formatDate(
                                nextOperation.date_fin
                              )}
                            </p>
                          )}

                        {nextOperation.description && (
                          <p className="mt-5 leading-7 text-muted">
                            {nextOperation.description}
                          </p>
                        )}

                        {nextOperation.stade_nom && (
                          <span className="mt-5 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                            Stade :{" "}
                            {nextOperation.stade_nom}
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="mt-7 leading-7 text-muted">
                        Aucune opération future n'est actuellement
                        disponible dans votre calendrier.
                      </p>
                    )}

                  </article>
                </div>

                {/* =================================================
                    MÉTÉO + CONSEIL DANS OVERVIEW
                    CÔTE À CÔTE SUR GRAND ÉCRAN
                ================================================== */}

                <div className="grid gap-5 lg:grid-cols-2">

                  {/* MÉTÉO */}

                  <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                    <div className="flex items-start justify-between gap-5">

                      <div>

                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                          Météo de ma région
                        </span>

                        <h2 className="mt-1 font-display text-3xl">
                          {getRegionName(
                            selectedCulture,
                            weather
                          )}
                        </h2>

                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                        <Sun size={24} />
                      </div>

                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-xl bg-sand p-4">

                        <p className="text-sm text-muted">
                          Température
                        </p>

                        <strong className="mt-1 block text-2xl">
                          {weather?.temperature ?? "—"}°C
                        </strong>

                      </div>

                      <div className="rounded-xl bg-sand p-4">

                        <p className="text-sm text-muted">
                          Humidité
                        </p>

                        <strong className="mt-1 block text-2xl">
                          {weather?.humidite ?? "—"}%
                        </strong>

                      </div>

                      <div className="rounded-xl bg-sand p-4">

                        <p className="text-sm text-muted">
                          Vent
                        </p>

                        <strong className="mt-1 block text-2xl">
                          {weather?.vent_kmh ?? "—"} km/h
                        </strong>

                      </div>

                      <div className="rounded-xl bg-sand p-4">

                        <p className="text-sm text-muted">
                          Pluie
                        </p>

                        <strong className="mt-1 block text-2xl">
                          {weather?.precipitation_mm ?? "—"} mm
                        </strong>

                      </div>

                      <div className="rounded-xl bg-sand p-4 sm:col-span-2">

                        <p className="text-sm text-muted">
                          Pluie prévue
                        </p>

                        <strong className="mt-1 block text-2xl">
                          {weather?.pluie_prevue
                            ? "Oui"
                            : "Non"}
                        </strong>

                      </div>

                    </div>

                  </article>

                  {/* CONSEIL */}

                  <article className="rounded-[24px] bg-primary p-6 text-white shadow-sm sm:p-8">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                        <CloudRain size={24} />
                      </div>

                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-white/70">
                          Conseil
                        </span>

                        <h2 className="mt-1 text-2xl font-bold">
                          Conseil
                        </h2>
                      </div>

                    </div>

                    <p className="mt-7 leading-7 text-white/90">
                      {weather?.conseil ||
                        "Le conseil météo sera affiché ici."}
                    </p>

                  </article>

                </div>

              </section>
            )}

            {/* =================================================
                CALENDRIER AGRICOLE
            ================================================== */}

            {activeSection === "calendar" && (
              <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                {/* EN-TÊTE */}

                <div className="flex flex-col gap-5 border-b border-earth pb-6 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                      Calendrier agricole intelligent
                    </span>

                    <h2 className="mt-1 font-display text-3xl sm:text-4xl">
                      {selectedCultureName}
                    </h2>

                    <div className="mt-3 space-y-1 text-sm text-muted">

                      <p>
                        Semis :{" "}
                        <strong className="text-ink">
                          {formatDate(
                            selectedCulture?.date_semis
                          )}
                        </strong>
                      </p>

                      <p>
                        Fin prévue :{" "}
                        <strong className="text-ink">
                          {formatDate(
                            calendar?.fin_prevue
                          )}
                        </strong>
                      </p>

                    </div>

                  </div>

                  <div className="rounded-2xl bg-soft px-5 py-4">

                    <span className="block text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                      Stade actuel
                    </span>

                    <strong className="mt-1 block text-lg text-primary">
                      {calendar?.stade_actuel?.nom ||
                        "—"}
                    </strong>

                  </div>

                </div>

                {/* TIMELINE */}

                <div className="mt-8">

                  {servicesLoading ? (
                    <div className="rounded-2xl bg-sand p-6 text-center text-muted">
                      Chargement du calendrier...
                    </div>
                  ) : calendar?.operations?.length ? (

                    <div className="relative">

                      {/* Ligne verticale */}

                      <div className="absolute bottom-0 left-[11px] top-0 w-[2px] bg-primary/15" />

                      <div className="space-y-8">

                        {calendar.operations.map(
                          (operation) => {

                            const isNext =
                              nextOperation?.id ===
                              operation.id;

                            return (
                              <article
                                key={operation.id}
                                className="relative pl-10"
                              >

                                {/* Point */}

                                <div
                                  className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                                    isNext
                                      ? "bg-primary"
                                      : "bg-primary/70"
                                  }`}
                                />

                                {/* CONTENU */}

                                <div
                                  className={`rounded-2xl border p-5 transition ${
                                    isNext
                                      ? "border-primary bg-soft shadow-sm"
                                      : "border-earth bg-white"
                                  }`}
                                >

                                  {isNext && (
                                    <span className="mb-3 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                                      Prochaine opération
                                    </span>
                                  )}

                                  <p className="text-sm font-semibold text-primary">
                                    {formatDateRange(
                                      operation.date_debut,
                                      operation.date_fin
                                    )}
                                  </p>

                                  <h3 className="mt-2 text-xl font-bold">
                                    {operation.nom}
                                  </h3>

                                  {operation.description && (
                                    <p className="mt-2 leading-7 text-muted">
                                      {
                                        operation.description
                                      }
                                    </p>
                                  )}

                                  {operation.stade_nom && (
                                    <span className="mt-4 inline-block rounded-full bg-sand px-3 py-1 text-xs font-semibold">
                                      Stade :{" "}
                                      {
                                        operation.stade_nom
                                      }
                                    </span>
                                  )}

                                </div>
                              </article>
                            );
                          }
                        )}

                      </div>
                    </div>

                  ) : (
                    <div className="rounded-2xl bg-sand p-6 text-muted">
                      Le calendrier agricole n'est pas encore
                      disponible pour cette culture.
                    </div>
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                MÉTÉO
                MÉTÉO + CONSEIL CÔTE À CÔTE
            ================================================== */}

            {activeSection === "weather" && (
              <section className="grid gap-5 lg:grid-cols-2">

                {/* MÉTÉO DE MA RÉGION */}

                <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                  <div className="flex items-start justify-between gap-5">

                    <div>

                      <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                        Météo de ma région
                      </span>

                      <h2 className="mt-1 font-display text-3xl sm:text-4xl">
                        {getRegionName(
                          selectedCulture,
                          weather
                        )}
                      </h2>

                    </div>

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-soft text-primary">
                      <Sun size={28} />
                    </div>

                  </div>

                  {/* Température */}

                  <div className="mt-8 flex items-center gap-4">

                    <span className="font-display text-6xl sm:text-7xl">
                      {weather?.temperature ?? "—"}°C
                    </span>

                    <div>
                      <p className="text-muted">
                        Conditions actuelles
                      </p>

                      <p className="mt-1 font-semibold">
                        {weather?.description ||
                          "Informations météorologiques"}
                      </p>
                    </div>

                  </div>

                  {/* DONNÉES MÉTÉO */}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl bg-sand p-4">

                      <Droplets
                        size={18}
                        className="text-primary"
                      />

                      <p className="mt-2 text-sm text-muted">
                        Humidité
                      </p>

                      <strong className="text-lg">
                        {weather?.humidite ?? "—"} %
                      </strong>

                    </div>

                    <div className="rounded-xl bg-sand p-4">

                      <Wind
                        size={18}
                        className="text-primary"
                      />

                      <p className="mt-2 text-sm text-muted">
                        Vent
                      </p>

                      <strong className="text-lg">
                        {weather?.vent_kmh ?? "—"} km/h
                      </strong>

                    </div>

                    <div className="rounded-xl bg-sand p-4">

                      <CloudRain
                        size={18}
                        className="text-primary"
                      />

                      <p className="mt-2 text-sm text-muted">
                        Précipitation
                      </p>

                      <strong className="text-lg">
                        {weather?.precipitation_mm ?? "—"} mm
                      </strong>

                    </div>

                    <div className="rounded-xl bg-sand p-4">

                      <CloudRain
                        size={18}
                        className="text-primary"
                      />

                      <p className="mt-2 text-sm text-muted">
                        Pluie prévue
                      </p>

                      <strong className="text-lg">
                        {weather?.pluie_prevue
                          ? "Oui"
                          : "Non"}
                      </strong>

                    </div>

                  </div>

                </article>

                {/* CONSEIL MÉTÉO */}

                <article className="rounded-[24px] bg-primary p-6 text-white shadow-sm sm:p-8">

                  <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-white/70">
                    Conseil météo
                  </span>

                  <h2 className="mt-2 font-display text-3xl">
                    Que faire aujourd'hui ?
                  </h2>

                  <p className="mt-6 max-w-3xl text-lg leading-8 text-white/90">
                    {weather?.conseil ||
                      "Aucun conseil météo disponible pour le moment."}
                  </p>

                </article>

              </section>
            )}

            {/* =================================================
                IA
            ================================================== */}

            {activeSection === "ai" && (
              <section className="grid gap-5 lg:grid-cols-2">

                {/* =================================================
                    CARTE PHOTO
                ================================================== */}

                <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary">
                      <Camera size={24} />
                    </div>

                    <div>

                      <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                        Intelligence artificielle
                      </span>

                      <h2 className="text-2xl font-bold">
                        Un problème sur votre plante ?
                      </h2>

                    </div>

                  </div>

                  <p className="mt-5 leading-7 text-muted">
                    Prenez une photo d'une feuille ou d'une plante
                    malade, ou importez une image depuis votre
                    téléphone.
                  </p>

                  {/* =================================================
                      INPUT APPAREIL PHOTO
                  ================================================== */}

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {/* =================================================
                      INPUT GALERIE / FICHIERS
                  ================================================== */}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {/* =================================================
                      DEUX BOUTONS
                  ================================================== */}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">

                    {/* PRENDRE UNE PHOTO */}

                    <button
                      type="button"
                      onClick={openCamera}
                      className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-soft px-5 py-6 text-center transition hover:bg-primary hover:text-white"
                    >

                      <Camera
                        size={30}
                        className="text-primary"
                      />

                      <span>
                        <strong className="block">
                          Prendre une photo
                        </strong>

                        <small className="mt-1 block text-muted">
                          Utiliser l'appareil photo
                        </small>
                      </span>

                    </button>

                    {/* IMPORTER UNE PHOTO */}

                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-earth bg-sand px-5 py-6 text-center transition hover:border-primary hover:bg-soft"
                    >

                      <ImageIcon
                        size={30}
                        className="text-primary"
                      />

                      <span>
                        <strong className="block">
                          Importer une photo
                        </strong>

                        <small className="mt-1 block text-muted">
                          Depuis la galerie ou les fichiers
                        </small>
                      </span>

                    </button>

                  </div>

                  {cameraOpen && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-primary/20 bg-black">
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="max-h-80 w-full object-cover"
                      />

                      <p className="px-4 py-3 text-center text-sm text-white">
                        Cliquez à nouveau sur « Prendre une photo » pour capturer l'image.
                      </p>
                    </div>
                  )}

                  {/* PHOTO SÉLECTIONNÉE */}

                  {photo && (
                    <div className="mt-4 rounded-xl bg-soft px-4 py-3">

                      <p className="text-sm font-semibold text-primary">
                        Photo sélectionnée
                      </p>

                      <p className="mt-1 truncate text-sm text-muted">
                        {photo.name}
                      </p>

                    </div>
                  )}

                  {/* APERÇU */}

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Aperçu de la plante"
                      className="mt-5 max-h-80 w-full rounded-2xl object-cover"
                    />
                  )}

                  {/* ANALYSE */}

                  <button
                    type="button"
                    disabled={!photo || analysisLoading}
                    onClick={analyzePhoto}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <Camera size={18} />

                    {analysisLoading
                      ? "Analyse en cours..."
                      : "Analyser la plante"}

                  </button>

                </article>

                {/* =================================================
                    RÉSULTAT IA
                ================================================== */}

                <article className="rounded-[24px] border border-primary/20 bg-soft p-6 sm:p-8">

                  <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                    Résultat
                  </span>

                  {analysis ? (
                    <div className="mt-4 space-y-5">
                      {analysis.diagnostic?.message && (
                        <div
                          className={`rounded-2xl border p-4 ${
                            ["image_inexploitable", "culture_non_supportee"].includes(
                              analysis.diagnostic?.statut
                            )
                              ? "border-amber-300 bg-amber-50 text-amber-950"
                              : "border-primary/20 bg-white text-slate-800"
                          }`}
                          role="status"
                        >
                          <p className="font-semibold">
                            {analysis.diagnostic.statut === "image_inexploitable"
                              ? "Photo à reprendre"
                              : analysis.diagnostic.statut === "culture_non_supportee"
                                ? "Culture non prise en charge"
                                : "Résultat de l'analyse"}
                          </p>
                          <p className="mt-2 leading-7">
                            {analysis.diagnostic.message}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-muted">
                          Culture détectée
                        </p>
                        <h3 className="mt-1 text-2xl font-bold">
                          {analysis.prediction?.culture ||
                            (analysis.diagnostic?.statut === "culture_non_supportee"
                              ? "Culture non prise en charge"
                              : analysis.diagnostic?.statut === "image_inexploitable"
                                ? "Culture non déterminée"
                                : "Résultat non disponible")}
                        </h3>
                      </div>

                      {analysis.prediction?.maladie && (
                        <div>
                          <p className="text-sm font-semibold text-muted">
                            Résultat de l'analyse
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {analysis.prediction.maladie}
                          </p>
                        </div>
                      )}

                      {analysis.connaissance?.titre && (
                        <p className="font-bold text-primary">
                          {analysis.connaissance.titre}
                        </p>
                      )}

                      {parseKnowledgeSections(analysis.connaissance?.contenu).map(
                        (section, index) => (
                          <div
                            key={`${section.title}-${index}`}
                            className="rounded-2xl bg-white p-5"
                          >
                            <p className="font-semibold text-primary">
                              {section.title}
                            </p>
                            <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
                              {section.text}
                            </p>
                          </div>
                        )
                      )}

                      {analysis.conseil && (
                        <div className="rounded-2xl bg-white p-5">
                          <p className="text-sm font-semibold text-muted">
                            Conseil pratique
                          </p>
                          <p className="mt-2 whitespace-pre-line leading-7">
                            {analysis.conseil}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex min-h-[360px] items-center justify-center text-center">
                      <div>
                        <Sprout
                          size={45}
                          className="mx-auto text-primary"
                        />

                        <h3 className="mt-4 text-xl font-bold">
                          Le résultat de votre analyse apparaîtra ici
                        </h3>

                        <p className="mt-2 max-w-sm text-muted">
                          Prenez une photo ou importez une image
                          pour lancer l'analyse.
                        </p>
                      </div>
                    </div>
                  )}

                </article>

              </section>
            )}

            {/* =================================================
                PROFIL
            ================================================== */}

            {activeSection === "profile" && (
              <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft text-primary">
                      <UserRound size={28} />
                    </div>

                    <div>

                      <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                        Mon profil
                      </span>

                      <h2 className="mt-1 font-display text-3xl">
                        Mes informations
                      </h2>

                    </div>

                  </div>

                  {!editingProfile && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProfile(true)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 font-semibold text-primary"
                    >
                      <Pencil size={17} />
                      Modifier
                    </button>
                  )}

                </div>

                <form
                  onSubmit={saveProfile}
                  className="mt-8 grid gap-4 sm:grid-cols-2"
                >

                  <input
                    value={profile.first_name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        first_name: e.target.value,
                      })
                    }
                    disabled={!editingProfile}
                    placeholder="Prénom"
                    className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary disabled:bg-sand"
                  />

                  <input
                    value={profile.last_name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        last_name: e.target.value,
                      })
                    }
                    disabled={!editingProfile}
                    placeholder="Nom"
                    className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary disabled:bg-sand"
                  />

                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                    disabled={!editingProfile}
                    placeholder="Email"
                    className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary disabled:bg-sand"
                  />

                  <input
                    value={profile.telephone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        telephone: e.target.value,
                      })
                    }
                    disabled={!editingProfile}
                    placeholder="Téléphone"
                    className="rounded-xl border border-earth px-4 py-3 outline-none focus:border-primary disabled:bg-sand"
                  />

                  {editingProfile && (
                    <div className="flex flex-wrap gap-3 sm:col-span-2">

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
                      >
                        <Save size={17} />
                        Enregistrer
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingProfile(false)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-earth px-5 py-3 font-semibold"
                      >
                        <X size={17} />
                        Annuler
                      </button>

                    </div>
                  )}

                </form>

              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}