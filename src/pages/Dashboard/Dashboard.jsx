
import { authService } from "../../services/authService";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  CalendarDays,
  CloudRain,
  Droplets,
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
import { hydriqueService } from "../../services/hydriqueService";
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

function getFirstName(user) {
  return (
    user?.first_name ||
    user?.prenom ||
    user?.username ||
    "Agriculteur"
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [cultures, setCultures] = useState([]);
  const [selectedCulture, setSelectedCulture] = useState(null);

  const [calendar, setCalendar] = useState(null);
  const [weather, setWeather] = useState(null);
  const [hydric, setHydric] = useState(null);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
  });

  useEffect(() => {
    setProfile({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
    });
  }, [user]);

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

  // useEffect(() => {
  //   async function loadCultureServices() {
  //     if (!selectedCulture?.id) {
  //       setCalendar(null);
  //       setWeather(null);
  //       setHydric(null);
  //       return;
  //     }

  //     setServicesLoading(true);
  //     setError("");

  //     try {
  //       const [calendarData, weatherData, hydricData] =
  //         await Promise.all([
  //           calendrierService.getCalendar(selectedCulture.id),
  //           meteoService.getWeather(selectedCulture.id),
  //           hydriqueService.getHydrique(selectedCulture.id),
  //         ]);

  //       setCalendar(calendarData);
  //       setWeather(weatherData);
  //       setHydric(hydricData);
  //     } catch (err) {
  //       setError(
  //         err.message ||
  //           "Impossible de charger les informations agricoles."
  //       );
  //     } finally {
  //       setServicesLoading(false);
  //     }
  //   }

  //   loadCultureServices();
  // }, [selectedCulture]);
  useEffect(() => {
  async function loadWeather() {
    if (!selectedCulture?.id) {
      setWeather(null);
      return;
    }

    setServicesLoading(true);
    setError("");

    try {
      const weatherData =
        await meteoService.getWeather(
          selectedCulture.id
        );

      setWeather(weatherData);
    } catch (err) {
      setError(
        err.message ||
          "Impossible de charger la météo de votre région."
      );
    } finally {
      setServicesLoading(false);
    }
  }

  loadWeather();
}, [selectedCulture]);

  const selectedCultureName = useMemo(
     () => getCultureName(selectedCulture),
    [selectedCulture]
  );

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
  }

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

      setAnalysis(
        result?.analyse ||
          result?.resultat ||
          result
      );
    } catch (err) {
      setError(
        err.message ||
          "Impossible d'analyser la photo."
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  // Ancienne version codeeeee
  // function saveProfile(event) {
  //   event.preventDefault();

  //   /*
  //    * Interface prête.
  //    * La persistance réelle sera branchée sur l'endpoint
  //    * PATCH du profil lorsque celui-ci sera exposé côté backend.
  //    */

  //   setProfileSaved(true);
  //   setEditingProfile(false);

  //   setTimeout(() => {
  //     setProfileSaved(false);
  //   }, 3000);
  // }
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

        {/* HEADER */}
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
                la météo locale, les conseils et votre assistant IA.
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

        {/* NAVIGATION AGRICULTEUR */}
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

        {/* AUCUNE CULTURE */}
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
            {/* CULTURES */}
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
                              {culture.date_semis ?? "—"}
                            </strong>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* VUE D'ENSEMBLE */}
            {activeSection === "overview" && (
              <section className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted">
                        Cultures suivies
                      </span>
                      <Sprout
                        size={20}
                        className="text-primary"
                      />
                    </div>
                    <p className="mt-3 text-3xl font-bold">
                      {cultures.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted">
                        Culture active
                      </span>
                      <Leaf
                        size={20}
                        className="text-primary"
                      />
                    </div>
                    <p className="mt-3 text-2xl font-bold">
                      {selectedCultureName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted">
                        Stade actuel
                      </span>
                      <CalendarDays
                        size={20}
                        className="text-primary"
                      />
                    </div>
                    <p className="mt-3 text-xl font-bold">
                      {hydric?.stage?.nom ||
                        calendar?.stade_actuel?.nom ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted">
                        Pluie prévue
                      </span>
                      <CloudRain
                        size={20}
                        className="text-primary"
                      />
                    </div>
                    <p className="mt-3 text-xl font-bold">
                      {weather?.precipitation_mm ?? "—"} mm
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* METEO */}
                  <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                          Météo locale
                        </span>
                        <h2 className="mt-1 text-2xl font-bold">
                          {weather?.region ||
                            selectedCulture?.region_nom ||
                            selectedCulture?.region?.nom ||
                            "Région non renseignée"}

                         
                        </h2>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-primary">
                        <Sun size={22} />
                      </div>
                    </div>

                    <div className="mt-7 flex items-end gap-3">
                      <span className="font-display text-6xl">
                        {weather?.temperature ?? "—"}°
                      </span>
                      <span className="pb-2 text-muted">
                        température
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-sand p-3">
                        <Droplets size={17} className="text-primary" />
                        <p className="mt-2 text-xs text-muted">
                          Humidité
                        </p>
                        <strong>
                          {weather?.humidite ?? "—"}%
                        </strong>
                      </div>

                      <div className="rounded-xl bg-sand p-3">
                        <Wind size={17} className="text-primary" />
                        <p className="mt-2 text-xs text-muted">
                          Vent
                        </p>
                        <strong>
                          {weather?.vent_kmh ?? "—"} km/h
                        </strong>
                      </div>

                      <div className="rounded-xl bg-sand p-3">
                        <CloudRain
                          size={17}
                          className="text-primary"
                        />
                        <p className="mt-2 text-xs text-muted">
                          Pluie
                        </p>
                        <strong>
                          {weather?.precipitation_mm ?? "—"} mm
                        </strong>
                      </div>
                    </div>
                  </article>

                  {/* CONSEIL HYDRIQUE */}
                  <article className="rounded-[24px] border border-primary/20 bg-soft p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary">
                        <Droplets size={22} />
                      </div>

                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                          Conseil agricole
                        </span>
                        <h2 className="mt-1 text-2xl font-bold">
                          Conseil hydrique
                        </h2>
                      </div>
                    </div>

                    <p className="mt-7 text-lg leading-8 text-ink">
                      {servicesLoading
                        ? "Chargement du conseil..."
                        : hydric?.conseil ||
                          "Les informations hydriques seront affichées ici."}
                    </p>

                    <div className="mt-7 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-4">
                        <span className="text-sm text-muted">
                          Kc
                        </span>
                        <strong className="mt-1 block text-xl">
                          {hydric?.stage?.kc ?? "—"}
                        </strong>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <span className="text-sm text-muted">
                          ETo
                        </span>
                        <strong className="mt-1 block text-xl">
                          {hydric?.eto ?? "—"} mm
                        </strong>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {/* CALENDRIER */}
            {activeSection === "calendar" && (
              <section className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                      Calendrier agricole intelligent
                    </span>

                    <h2 className="mt-1 font-display text-3xl">
                      {selectedCultureName}
                    </h2>
                  </div>

                  <span className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary">
                    Stade :{" "}
                    {calendar?.stade_actuel?.nom ||
                      hydric?.stage?.nom ||
                      "—"}
                  </span>
                </div>

                <div className="mt-8 space-y-5">
                  {calendar?.operations?.length ? (
                    calendar.operations.map((operation) => (
                      <article
                        key={operation.id}
                        className="relative border-l-2 border-primary/20 pl-6"
                      >
                        <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />

                        <span className="text-sm font-semibold text-primary">
                          {operation.date_debut} →{" "}
                          {operation.date_fin}
                        </span>

                        <h3 className="mt-1 text-xl font-bold">
                          {operation.nom}
                        </h3>

                        <p className="mt-2 leading-7 text-muted">
                          {operation.description}
                        </p>

                        {operation.stade_nom && (
                          <span className="mt-3 inline-block rounded-full bg-sand px-3 py-1 text-xs font-semibold">
                            Stade : {operation.stade_nom}
                          </span>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-sand p-6 text-muted">
                      Le calendrier sera affiché ici dès que les
                      données sont disponibles.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* METEO */}
            {activeSection === "weather" && (
              <section className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
                  <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                    Météo de ma région
                  </span>

                  <h2 className="mt-1 font-display text-3xl">
                    {getLocalisation(selectedCulture)}
                  </h2>

                  <div className="mt-8 flex items-end gap-3">
                    <CloudRain
                      size={38}
                      className="mb-2 text-primary"
                    />
                    <span className="font-display text-6xl">
                      {weather?.temperature ?? "—"}°
                    </span>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-sand p-4">
                      <p className="text-sm text-muted">
                        Humidité
                      </p>
                      <strong>
                        {weather?.humidite ?? "—"}%
                      </strong>
                    </div>

                    <div className="rounded-xl bg-sand p-4">
                      <p className="text-sm text-muted">
                        Vent
                      </p>
                      <strong>
                        {weather?.vent_kmh ?? "—"} km/h
                      </strong>
                    </div>

                    <div className="rounded-xl bg-sand p-4">
                      <p className="text-sm text-muted">
                        Précipitations
                      </p>
                      <strong>
                        {weather?.precipitation_mm ?? "—"} mm
                      </strong>
                    </div>

                    <div className="rounded-xl bg-sand p-4">
                      <p className="text-sm text-muted">
                        Pluie prévue
                      </p>
                      <strong>
                        {weather?.pluie_prevue
                          ? "Oui"
                          : "Non"}
                      </strong>
                    </div>
                  </div>
                </article>

                <article className="rounded-[24px] border border-primary/20 bg-primary p-6 text-white shadow-sm sm:p-8">
                  <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-white/70">
                    Conseil
                  </span>

                  <h2 className="mt-2 font-display text-3xl">
                    Que faire aujourd'hui ?
                  </h2>

                  <p className="mt-6 text-lg leading-8 text-white/85">
                    {hydric?.conseil ||
                      "Le conseil agricole apparaîtra ici à partir des conditions météo et des données de votre culture."}
                  </p>
                </article>
              </section>
            )}

            {/* IA */}
            {activeSection === "ai" && (
              <section className="grid gap-5 lg:grid-cols-2">
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

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-earth bg-sand px-5 py-8 text-center transition hover:border-primary hover:bg-soft"
                  >
                    <Camera size={30} className="text-primary" />

                    <span>
                      <strong className="block">
                        {photo
                          ? photo.name
                          : "Prendre ou importer une photo"}
                      </strong>

                      <small className="mt-1 block text-muted">
                        Photo nette de la feuille ou de la plante
                      </small>
                    </span>
                  </button>

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Aperçu de la plante"
                      className="mt-5 max-h-80 w-full rounded-2xl object-cover"
                    />
                  )}

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

                <article className="rounded-[24px] border border-primary/20 bg-soft p-6 sm:p-8">
                  <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                    Résultat
                  </span>

                  {analysis ? (
                    <div className="mt-4 space-y-5">
                      <div>
                        <p className="text-sm font-semibold text-muted">
                          Problème détecté
                        </p>

                        <h3 className="mt-1 text-2xl font-bold">
                          {analysis.probleme ||
                            "Analyse terminée"}
                        </h3>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-muted">
                          Résultat
                        </p>

                        <p className="mt-1 leading-7">
                          {analysis.resultat ||
                            analysis.description ||
                            "Aucune description disponible."}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-5">
                        <p className="text-sm font-semibold text-muted">
                          Conseil agronomique
                        </p>

                        <p className="mt-2 leading-7">
                          {analysis.conseil ||
                            "Aucun conseil supplémentaire disponible."}
                        </p>
                      </div>

                      {analysis.confiance !== undefined && (
                        <p className="text-sm font-semibold text-primary">
                          Confiance indicative :{" "}
                          {analysis.confiance}%
                        </p>
                      )}

                      <p className="text-xs leading-5 text-muted">
                        L'analyse constitue une aide à la décision et
                        ne remplace pas l'avis d'un professionnel
                        agricole.
                      </p>
                    </div>
                  ) : (
                    <div className="flex min-h-[360px] items-center justify-center text-center">
                      <div>
                        <Sprout
                          size={45}
                          className="mx-auto text-primary"
                        />

                        <h3 className="mt-4 text-xl font-bold">
                          Votre diagnostic apparaîtra ici
                        </h3>

                        <p className="mt-2 max-w-sm text-muted">
                          Importez une photo pour lancer
                          l'analyse.
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              </section>
            )}

            {/* PROFIL */}
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
                      onClick={() => setEditingProfile(true)}
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