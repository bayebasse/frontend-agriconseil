import { authService } from "../../services/authService";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  CloudRain,
  CloudSun,
  Droplets,
  History as HistoryIcon,
  Image as ImageIcon,
  Leaf,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Save,
  Sparkles,
  ShoppingBag,
  Sprout,
  Sun,
  UserRound,
  Wind,
  X,
} from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import MessagesNavLink from "../../components/MessagesNavLink";
import MessagesPage from "../Messages/MessagesPage";
import TransactionsPage from "../Transactions/TransactionsPage";
import { useAuth } from "../../contexts/AuthContext";
import { cultureService } from "../../services/cultureService";
import { calendrierService } from "../../services/calendrierService";
import { meteoService } from "../../services/meteoService";
import { iaService } from "../../services/iaService";
import { buyerService } from "../../services/buyerService";
import { transactionService } from "../../services/transactionService";
import { getPastHarvestDate } from "../../utils/harvestHistory";
import { isValidSenegalPhone } from "../../utils/accountValidation";
import { hasFarmerMessagingAccess } from "../../utils/farmerMessagingAccess";
import { getCropImageUrl } from "../../utils/cropImages";

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

function getList(data, label) {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.results)) {
    return data.results;
  }
  throw new Error(`Format inattendu pour ${label}.`);
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

function formatHistoryTimestamp(value) {
  if (!value) {
    return "Date non renseignée";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date non renseignée"
    : date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
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

function YieldPredictionCard({ prediction, loading, error }) {
  const formatKg = (value) => new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value));
  const formatHarvestQuantity = (value) => {
    const quantityKg = Number(value);
    if (!Number.isFinite(quantityKg)) return "Quantité indisponible";
    if (quantityKg >= 1000) {
      return `≈ ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(quantityKg / 1000)} t`;
    }
    return `≈ ${formatKg(quantityKg)} kg`;
  };

  return (
    <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
      <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">Prévision indicative</span>
      <h2 className="mt-1 text-2xl font-bold">Estimation de récolte</h2>
      {loading ? <p className="mt-4 text-muted">Calcul des informations disponibles…</p> : null}
      {error ? <p role="status" className="mt-4 text-sm text-muted">{error}</p> : null}
      {!loading && prediction ? (
        <>
          {prediction.rendement_estime_kg_ha != null ? (
            <div className="mt-4 rounded-xl bg-sand p-4 text-ink">
              {prediction.quantite_totale_estimee_kg != null ? (
                <p className="text-sm text-muted">Récolte estimée</p>
              ) : null}
              <p className="mt-1 text-2xl font-extrabold text-primary">
                {prediction.quantite_totale_estimee_kg != null
                  ? formatHarvestQuantity(prediction.quantite_totale_estimee_kg)
                  : `${formatKg(prediction.rendement_estime_kg_ha)} kg/ha`}
              </p>
              {prediction.quantite_totale_estimee_kg != null ? (
                <p className="mt-1 text-sm">
                  Soit environ {formatKg(prediction.rendement_estime_kg_ha)} kg par hectare.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-sand p-4 text-sm text-ink">
              Aucune référence de rendement documentée n’est disponible pour cette culture.
            </p>
          )}
          {prediction.avancement_cycle ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {prediction.avancement_cycle.indicatif ? "Cycle estimé" : "Avancement du cycle"}
                </span>
                <span className="font-bold text-primary">{prediction.avancement_cycle.pourcentage}%</span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-sand"
                role="progressbar"
                aria-label="Avancement du cycle cultural"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={prediction.avancement_cycle.pourcentage}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${prediction.avancement_cycle.pourcentage}%` }}
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

export default function Dashboard() {
  const { user, logout, deleteAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasMessagingAccess, setHasMessagingAccess] = useState(
    () => hasFarmerMessagingAccess(user)
  );

  const [cultures, setCultures] = useState([]);
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [cultureFilter, setCultureFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [systemFilter, setSystemFilter] = useState("");
  const [marketForm, setMarketForm] = useState({
    statut_recolte: "in_progress",
    quantite_disponible_vente: "",
    unite_disponible_vente: "kg",
    prix_kg_fcfa: "",
  });
  const [marketSaving, setMarketSaving] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [marketNotice, setMarketNotice] = useState("");

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
  const [yieldPrediction, setYieldPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(location.state?.dashboardSection || "overview");
  const [history, setHistory] = useState({
    orders: [],
    reservations: [],
    messages: [],
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

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
  const [accountDeleting, setAccountDeleting] = useState(false);

  async function handleProfileLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function handleAccountDeletion() {
    const confirmed = window.confirm(
      "La suppression de votre compte est définitive. Vos cultures, commandes, réservations et messages associés seront également supprimés. Voulez-vous continuer ?"
    );
    if (!confirmed) return;

    setAccountDeleting(true);
    setError("");
    try {
      await deleteAccount();
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(deleteError.message || "Impossible de supprimer votre compte.");
      setAccountDeleting(false);
    }
  }

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
        const createdId = location.state?.createdCultureId;
        setSelectedCulture(list.find((item) => String(item.id) === String(createdId)) || list[0] || null);
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
  }, [location.state]);

  useEffect(() => {
    if (activeSection !== "history") {
      return undefined;
    }

    let active = true;
    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const [orderData, reservationData] = await Promise.all([
          transactionService.getOrders(),
          transactionService.getReservations(),
        ]);
        const orders = getList(orderData, "des commandes");
        const reservations = getList(reservationData, "des réservations");
        let messages = [];

        if (hasMessagingAccess) {
          const conversationData = await buyerService.getConversations();
          const conversations = getList(conversationData, "des conversations");
          const messagesByConversation = await Promise.all(
            conversations.map(async (conversation) => ({
              conversation,
              messages: getList(
                await buyerService.getMessages(conversation.id),
                "des messages"
              ),
            }))
          );
          messages = messagesByConversation.flatMap(({ conversation, messages: conversationMessages }) =>
            conversationMessages.map((message) => ({ ...message, conversation }))
          );
        }

        if (active) {
          setHistory({ orders, reservations, messages });
        }
      } catch (historyLoadError) {
        if (active) {
          setHistoryError(
            historyLoadError.message || "Impossible de charger votre historique."
          );
        }
      } finally {
        if (active) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [activeSection, hasMessagingAccess]);

  useEffect(() => {
    setMarketForm({
      statut_recolte: selectedCulture?.statut_recolte || "in_progress",
      quantite_disponible_vente: selectedCulture?.quantite_disponible_vente ?? "",
      unite_disponible_vente: selectedCulture?.unite_disponible_vente || "kg",
      prix_kg_fcfa: selectedCulture?.prix_kg_fcfa ?? "",
    });
    setMarketError("");
    setMarketNotice("");
  }, [selectedCulture?.id]);

  useEffect(() => {
    if (location.state?.dashboardSection) {
      setActiveSection(location.state.dashboardSection);
    }
  }, [location.state]);

  useEffect(() => {
    let active = true;
    async function loadYieldPrediction() {
      if (!selectedCulture?.id) {
        setYieldPrediction(null);
        return;
      }
      setPredictionLoading(true);
      setPredictionError("");
      try {
        const data = await cultureService.getYieldPrediction(selectedCulture.id);
        if (active) setYieldPrediction(data);
      } catch (err) {
        if (active) {
          setYieldPrediction(null);
          setPredictionError(err.message || "La prévision est momentanément indisponible.");
        }
      } finally {
        if (active) setPredictionLoading(false);
      }
    }
    loadYieldPrediction();
    return () => { active = false; };
  }, [selectedCulture?.id]);

  /*
   * Chargement du calendrier + météo
   *
   * Le calendrier et la météo sont deux services distincts.
   *
   * La météo ne dépend PAS du module hydrique.
   */
  useEffect(() => {
    let active = true;

    async function loadCultureServices() {
      if (!selectedCulture?.id) {
        setCalendar(null);
        setWeather(null);
        setServicesLoading(false);
        return;
      }

      setServicesLoading(true);
      setError("");
      setCalendar(null);
      setWeather(null);

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

        if (active) {
          setCalendar(calendarData);
          setWeather(weatherData);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Impossible de charger les informations de votre culture."
          );
        }
      } finally {
        if (active) {
          setServicesLoading(false);
        }
      }
    }

    loadCultureServices();

    return () => {
      active = false;
    };
  }, [selectedCulture]);

  /*
   * Nom de la culture sélectionnée
   */
  const selectedCultureName = useMemo(
    () => getCultureName(selectedCulture),
    [selectedCulture]
  );

  const filteredCultures = useMemo(() => cultures.filter((culture) => (
    (!cultureFilter || String(culture.culture) === cultureFilter)
    && (!regionFilter || String(culture.region) === regionFilter)
    && (!systemFilter || culture.systeme_culture === systemFilter)
  )), [cultures, cultureFilter, regionFilter, systemFilter]);

  useEffect(() => {
    if (!filteredCultures.length && selectedCulture) {
      setSelectedCulture(null);
    } else if (filteredCultures.length && !filteredCultures.some((culture) => culture.id === selectedCulture?.id)) {
      setSelectedCulture(filteredCultures[0]);
      if (activeSection === "cultures") {
        setActiveSection("overview");
      }
    }
  }, [activeSection, filteredCultures, selectedCulture?.id]);

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

    if (profile.telephone.trim() && !isValidSenegalPhone(profile.telephone)) {
      setError("Saisissez un numéro sénégalais valide commençant par 76, 77 ou 78 (9 chiffres, indicatif +221 facultatif).");
      return;
    }

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

  async function saveMarketData(event) {
    event.preventDefault();
    if (!selectedCulture?.id) return;
    setMarketSaving(true);
    setMarketError("");
    setMarketNotice("");
    try {
      const updated = await cultureService.updateCulture(selectedCulture.id, {
        ...marketForm,
        quantite_disponible_vente: marketForm.quantite_disponible_vente === "" ? null : marketForm.quantite_disponible_vente,
        unite_disponible_vente: marketForm.quantite_disponible_vente === "" ? "" : marketForm.unite_disponible_vente,
        prix_kg_fcfa: marketForm.prix_kg_fcfa === "" ? null : marketForm.prix_kg_fcfa,
      });
      setCultures((current) => current.map((crop) => crop.id === updated.id ? updated : crop));
      setSelectedCulture(updated);
      setMarketNotice("Les informations de récolte et de vente sont enregistrées.");
    } catch (saveError) {
      setMarketError(saveError.message || "Impossible d’enregistrer ces informations.");
    } finally {
      setMarketSaving(false);
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
    <main className="farmer-dashboard min-h-[80vh] bg-sand pb-20 lg:flex lg:pb-0">
      <aside className="hidden w-full border-b border-earth bg-white shadow-sm lg:sticky lg:top-16 lg:z-40 lg:block lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:self-start lg:border-b-0 lg:border-r">
        <div className="flex min-h-16 items-center gap-3 px-3 py-2 sm:px-6 lg:flex-col lg:items-stretch lg:gap-2 lg:px-4 lg:py-4">
          <nav
            aria-label="Navigation de l’espace agriculteur"
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
          >
            {[
              ["overview", "Vue d'ensemble", LayoutDashboard],
              ["cultures", "Mes cultures", Leaf],
              ["calendar", "Calendrier", CalendarDays],
              ["weather", "Météo", CloudSun],
              ["ai", "Assistant IA", Sparkles],
              ["history", "Historiques", HistoryIcon],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                aria-current={activeSection === id ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition lg:w-full ${
                  activeSection === id
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-soft hover:text-primary"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
            <MessagesNavLink
              label="Mes acheteurs"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-soft hover:text-primary lg:w-full"
              onClick={() => setActiveSection("buyers")}
              active={activeSection === "buyers"}
              showUnreadCount={hasMessagingAccess}
            />
            <button
              type="button"
              onClick={() => setActiveSection("orders")}
              aria-current={activeSection === "orders" ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition lg:w-full ${
                activeSection === "orders"
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-soft hover:text-primary"
              }`}
            >
              <ClipboardList size={16} />
              Mes commandes
            </button>
          </nav>
        </div>
      </aside>

      <div className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-10">

        {!["cultures", "calendar", "weather", "ai", "buyers", "orders"].includes(activeSection) && (
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
        )}

        {activeSection === "cultures" && (
          <div className="mb-3 flex justify-end">
            <Link
              to="/culture/nouvelle"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Ajouter une culture
            </Link>
          </div>
        )}

        {cultures.length > 0 && !["ai", "profile"].includes(activeSection) && (
          <section className="mb-6 rounded-2xl border border-earth bg-white p-4 shadow-sm sm:p-5" aria-label="Filtres des cultures enregistrées">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-ink">Filtrer mes cultures</h2>
              <span className="text-sm text-muted">{filteredCultures.length} culture{filteredCultures.length > 1 ? "s" : ""} affichée{filteredCultures.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm font-medium text-ink">
                Culture
                <select value={cultureFilter} onChange={(event) => setCultureFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-earth bg-white px-3 py-2.5 font-normal">
                  <option value="">Toutes les cultures</option>
                  {[...new Map(cultures.map((culture) => [String(culture.culture), getCultureName(culture)])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-ink">
                Région
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-earth bg-white px-3 py-2.5 font-normal">
                  <option value="">Toutes les régions</option>
                  {[...new Map(cultures.map((culture) => [String(culture.region), culture.region_nom || culture.region?.nom || "Région"]))].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-ink">
                Système de culture
                <select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-earth bg-white px-3 py-2.5 font-normal">
                  <option value="">Tous les systèmes</option>
                  <option value="pluvial">Pluvial</option>
                  <option value="irrigue">Irrigué</option>
                  <option value="mixte">Mixte</option>
                </select>
              </label>
            </div>
          </section>
        )}

        {cultures.length > 0 &&
          filteredCultures.length === 0 &&
          !["ai", "profile"].includes(activeSection) && (
          <section className="mb-6 rounded-2xl border border-earth bg-white p-6 text-center text-muted">
            Aucune culture enregistrée ne correspond à ces filtres.
          </section>
        )}

        <ErrorMessage message={error} />

        {profileSaved && (
          <div className="mb-5 rounded-xl border border-primary/20 bg-soft px-4 py-3 text-sm font-semibold text-primary">
            Profil enregistré dans l'interface.
          </div>
        )}

        {/* =====================================================
            AUCUNE CULTURE
        ====================================================== */}

        {cultures.length === 0 && ["overview", "cultures"].includes(activeSection) ? (
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

                <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {filteredCultures.map((culture) => {
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

                          {getCropImageUrl(getCultureName(culture)) ? (
                            <img
                              src={getCropImageUrl(getCultureName(culture))}
                              alt={getCultureName(culture)}
                              className="h-11 w-11 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                              <Leaf size={21} />
                            </div>
                          )}

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

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">

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
              <section className="grid items-start gap-5 lg:grid-cols-2">

                {/* Résumé culture + prochaine opération */}


                  {/* MA CULTURE */}

                  <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">

                    <div className="flex items-center gap-3">

                      {getCropImageUrl(selectedCultureName) ? (
                        <img
                          src={getCropImageUrl(selectedCultureName)}
                          alt={selectedCultureName}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary">
                          <Leaf size={24} />
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
                          Ma culture
                        </span>

                        <h2 className="mt-1 text-2xl font-bold">
                          {selectedCultureName}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3 md:grid-cols-2">

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
                        {calendar?.fin_prevue_indicative ? "Fin estimée (indicative)" : "Fin prévue"}
                      </p>

                      <strong className="mt-1 block">
                        {formatDate(
                          calendar?.fin_prevue
                        )}
                      </strong>

                    </div>
                  </article>

                <YieldPredictionCard
                  prediction={yieldPrediction}
                  loading={predictionLoading}
                  error={predictionError}
                />

                <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-3">
                    {getCropImageUrl(selectedCultureName) ? (
                      <img
                        src={getCropImageUrl(selectedCultureName)}
                        alt={selectedCultureName}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary"><ShoppingBag size={23} /></div>
                    )}
                    <div><span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">Vente et récolte</span><h2 className="mt-1 text-2xl font-bold">Publier cette récolte</h2></div>
                  </div>
                  <form onSubmit={saveMarketData} className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-ink md:col-span-2">Statut de la récolte
                      <select value={marketForm.statut_recolte} onChange={(event) => setMarketForm((current) => ({ ...current, statut_recolte: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-earth bg-white px-3 py-2.5">
                        <option value="in_progress">En cours de récolte</option><option value="available">Disponible à la vente</option><option value="harvested">Récoltée</option><option value="exhausted">Épuisée</option><option value="unavailable">Indisponible</option><option value="cancelled">Annulée</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium text-ink">Quantité réellement disponible
                      <input type="number" min="0" step="0.001" value={marketForm.quantite_disponible_vente} onChange={(event) => setMarketForm((current) => ({ ...current, quantite_disponible_vente: event.target.value }))} placeholder="Stock récolté disponible" className="mt-1.5 w-full rounded-xl border border-earth px-3 py-2.5" />
                    </label>
                    <label className="text-sm font-medium text-ink">Unité
                      <select value={marketForm.unite_disponible_vente} onChange={(event) => setMarketForm((current) => ({ ...current, unite_disponible_vente: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-earth bg-white px-3 py-2.5"><option value="kg">Kilogrammes</option><option value="tonne">Tonnes</option></select>
                    </label>
                    <label className="text-sm font-medium text-ink md:col-span-2">Prix facultatif (FCFA/kg)
                      <input type="number" min="0.01" step="0.01" value={marketForm.prix_kg_fcfa} onChange={(event) => setMarketForm((current) => ({ ...current, prix_kg_fcfa: event.target.value }))} placeholder="Laisser vide si le prix est à discuter" className="mt-1.5 w-full rounded-xl border border-earth px-3 py-2.5" />
                    </label>
                    {marketError ? <p role="alert" className="text-sm text-red-700 md:col-span-2">{marketError}</p> : null}
                    {marketNotice ? <p role="status" className="text-sm font-semibold text-primary md:col-span-2">{marketNotice}</p> : null}
                    <button type="submit" disabled={marketSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50 md:col-span-2"><Save size={17} /> {marketSaving ? "Enregistrement…" : "Publier la récolte"}</button>
                  </form>
                </article>

                  {/* PROCHAINE OPÉRATION */}

                  <article className="rounded-[24px] border border-primary/20 bg-soft p-6 shadow-sm sm:p-8">

                    <div className="flex items-center gap-3">

                      {getCropImageUrl(selectedCultureName) ? (
                        <img
                          src={getCropImageUrl(selectedCultureName)}
                          alt={selectedCultureName}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary">
                          <CalendarDays size={24} />
                        </div>
                      )}

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

                {/* =================================================
                    MÉTÉO + CONSEIL DANS OVERVIEW
                    CÔTE À CÔTE SUR GRAND ÉCRAN
                ================================================== */}


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

                    <div className="mt-7 grid gap-3 md:grid-cols-2">

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

                      <div className="rounded-xl bg-sand p-4 md:col-span-2">

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
                        {calendar?.fin_prevue_indicative ? "Fin estimée (indicative) : " : "Fin prévue : "}{" "}
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
              <section className="grid items-start gap-5 lg:grid-cols-2">

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

                  <div className="mt-8 grid gap-3 md:grid-cols-2">

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
              <section className="grid items-start gap-5 lg:grid-cols-2">

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

                  <div className="mt-6 grid gap-3 md:grid-cols-2">

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
                    <div className="flex items-center justify-center text-center">
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
                  className="mt-8 grid gap-4 md:grid-cols-2"
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
                    type="tel"
                    value={profile.telephone}
                    pattern="(?:\+221[ .-]?)?(?:76|77|78)(?:[ .-]?[0-9]){7}"
                    title="Numéro sénégalais commençant par 76, 77 ou 78, avec 9 chiffres. L’indicatif +221 est facultatif."
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
                    <div className="flex flex-wrap gap-3 md:col-span-2">

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

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-earth pt-5 lg:hidden">
                  <button
                    type="button"
                    onClick={handleProfileLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-earth px-3 py-3 text-sm font-semibold text-ink transition hover:bg-sand"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    Se déconnecter
                  </button>
                  <button
                    type="button"
                    onClick={handleAccountDeletion}
                    disabled={accountDeleting}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-3 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {accountDeleting ? "Suppression…" : "Supprimer mon compte"}
                  </button>
                </div>

              </section>
            )}
          </>
        )}

        {activeSection === "buyers" && (
          <MessagesPage embedded onAccessGranted={() => setHasMessagingAccess(true)} />
        )}

        {activeSection === "orders" && <TransactionsPage embedded />}

        {activeSection === "history" && (
          <section className="space-y-6">
            <header>
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                <HistoryIcon size={16} />
                Archives de votre activité
              </span>
              <h2 className="mt-1 font-display text-3xl">Historiques</h2>
              <p className="mt-2 text-sm text-muted">
                Les récoltes apparaissent ici après leur date prévue. Retrouvez aussi vos commandes,
                réservations et échanges avec les acheteurs.
              </p>
            </header>

            {historyError ? (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {historyError}
              </p>
            ) : null}

            {historyLoading ? (
              <p className="rounded-2xl border border-earth bg-white p-8 text-center text-muted">
                Chargement de votre historique…
              </p>
            ) : (
              <>
                <section className="space-y-3" aria-labelledby="history-harvests">
                  <h3 id="history-harvests" className="flex items-center gap-2 text-xl font-bold">
                    <CalendarDays size={20} className="text-primary" />
                    Récoltes passées
                  </h3>
                  {cultures.filter((culture) => getPastHarvestDate(culture)).length === 0 ? (
                    <p className="rounded-2xl border border-earth bg-white p-5 text-sm text-muted">
                      Aucune récolte dont la date est passée pour le moment.
                    </p>
                  ) : (
                    <div className="grid items-start gap-3 md:grid-cols-2">
                      {cultures
                        .map((culture) => ({
                          culture,
                          harvestDate: getPastHarvestDate(culture),
                        }))
                        .filter(({ harvestDate }) => harvestDate)
                        .sort((a, b) => b.harvestDate.localeCompare(a.harvestDate))
                        .map(({ culture, harvestDate }) => (
                          <article key={culture.id} className="rounded-2xl border border-earth bg-white p-5">
                            <h4 className="text-lg font-bold">{getCultureName(culture)}</h4>
                            <p className="mt-1 text-sm text-muted">{getLocalisation(culture)}</p>
                            <p className="mt-3 text-sm">
                              Date de récolte passée : <strong>{formatDate(harvestDate)}</strong>
                            </p>
                            {culture.statut_recolte ? (
                              <p className="mt-1 text-sm text-muted">
                                Statut : {culture.statut_recolte}
                              </p>
                            ) : null}
                          </article>
                        ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3" aria-labelledby="history-orders">
                  <h3 id="history-orders" className="flex items-center gap-2 text-xl font-bold">
                    <ClipboardList size={20} className="text-primary" />
                    Commandes
                  </h3>
                  {history.orders.length === 0 ? (
                    <p className="rounded-2xl border border-earth bg-white p-5 text-sm text-muted">
                      Aucune commande dans votre historique.
                    </p>
                  ) : (
                    <div className="grid items-start gap-3 md:grid-cols-2">
                      {[...history.orders]
                        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                        .map((order) => (
                          <article key={order.id} className="rounded-2xl border border-earth bg-white p-5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="text-lg font-bold">{order.culture_nom || "Culture"}</h4>
                              <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                                {order.statut || "Statut inconnu"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted">Commande n° {order.id}</p>
                            <p className="mt-1 text-sm">Acheteur : <strong>{order.buyer_name || "Non renseigné"}</strong></p>
                            <p className="mt-1 text-sm">Quantité : <strong>{order.quantite_kg ?? "—"} kg</strong></p>
                            <p className="mt-1 text-sm">Demandée le : {formatHistoryTimestamp(order.created_at)}</p>
                            {order.message ? <p className="mt-2 rounded-xl bg-sand p-3 text-sm">{order.message}</p> : null}
                          </article>
                        ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3" aria-labelledby="history-reservations">
                  <h3 id="history-reservations" className="flex items-center gap-2 text-xl font-bold">
                    <CalendarClock size={20} className="text-primary" />
                    Réservations
                  </h3>
                  {history.reservations.length === 0 ? (
                    <p className="rounded-2xl border border-earth bg-white p-5 text-sm text-muted">
                      Aucune réservation dans votre historique.
                    </p>
                  ) : (
                    <div className="grid items-start gap-3 md:grid-cols-2">
                      {[...history.reservations]
                        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                        .map((reservation) => (
                          <article key={reservation.id} className="rounded-2xl border border-earth bg-white p-5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="text-lg font-bold">{reservation.culture_nom || "Culture"}</h4>
                              <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                                {reservation.statut || "Statut inconnu"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted">Réservation n° {reservation.id}</p>
                            <p className="mt-1 text-sm">Acheteur : <strong>{reservation.buyer_name || "Non renseigné"}</strong></p>
                            <p className="mt-1 text-sm">Quantité : <strong>{reservation.quantite_kg ?? "—"} kg</strong></p>
                            <p className="mt-1 text-sm">Demandée le : {formatHistoryTimestamp(reservation.created_at)}</p>
                            {reservation.message ? <p className="mt-2 rounded-xl bg-sand p-3 text-sm">{reservation.message}</p> : null}
                          </article>
                        ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3" aria-labelledby="history-messages">
                  <h3 id="history-messages" className="flex items-center gap-2 text-xl font-bold">
                    <MessageCircle size={20} className="text-primary" />
                    Messages
                  </h3>
                  {!hasMessagingAccess ? (
                    <p className="rounded-2xl border border-earth bg-white p-5 text-sm text-muted">
                      L’accès aux discussions est disponible après le paiement simulé dans « Mes acheteurs ».
                    </p>
                  ) : history.messages.length === 0 ? (
                    <p className="rounded-2xl border border-earth bg-white p-5 text-sm text-muted">
                      Aucun message dans votre historique.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {[...history.messages]
                        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                        .map((message) => (
                          <article
                            key={`${message.conversation.id}-${message.id}`}
                            className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-earth bg-white p-5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">
                                {message.sender_name || "Participant"} · {message.conversation.culture_nom || "Conversation"}
                              </p>
                              <p className="mt-1 text-xs text-muted">{formatHistoryTimestamp(message.created_at)}</p>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                                {message.message_type === "audio" ? "Message vocal" : message.content}
                              </p>
                            </div>
                            <Link
                              to={`/messages/${message.conversation.id}`}
                              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-earth px-4 py-2 text-sm font-semibold text-primary hover:bg-soft"
                            >
                              <MessageCircle size={16} />
                              Voir la conversation
                            </Link>
                          </article>
                        ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
