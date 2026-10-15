import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ban, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, CircleX, ClipboardList, Eye, Leaf, LogOut, MapPin, MessageCircle, PackageCheck, Phone, ShoppingCart, Sprout, Clock3 } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { buyerService } from "../../services/buyerService";
import { cultureService } from "../../services/cultureService";
import { api } from "../../services/api";
import MessagesNavLink from "../../components/MessagesNavLink";
import CropTransactionForm from "./CropTransactionForm";
import { getMarketAction } from "../../utils/marketActions";

const STATUS_LABELS = {
  in_progress: "En cours",
  planned: "Récolte prévue",
  harvested: "Récoltée",
  available: "Disponible à la vente",
  exhausted: "Épuisée",
  unavailable: "Indisponible",
  cancelled: "Annulée",
};
const STATUS_ICONS = {
  harvested: PackageCheck,
  exhausted: Ban,
  unavailable: CircleX,
  cancelled: CircleX,
  planned: Clock3,
};

function formatDate(value) {
  if (!value) return "Non disponible";
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatQuantity(value, unit = "kg") {
  if (value == null) return "Non disponible";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value))} ${unit}`;
}

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ culture: "", region: "", statut: "" });
  const [crops, setCrops] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [cropOptions, setCropOptions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [contacting, setContacting] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [requestNotice, setRequestNotice] = useState("");

  const loadCrops = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      setError("");
      const response = await buyerService.getCrops({ ...filters, page });
      setCrops(response.results || []);
      setIndicators(response.indicators || null);
      setHasNext(page * response.page_size < response.count);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger le catalogue agricole.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadCrops(true);
    const interval = window.setInterval(() => loadCrops(false), 60_000);
    return () => window.clearInterval(interval);
  }, [loadCrops]);

  useEffect(() => {
    Promise.all([cultureService.getCultureReferences(), api.regions()])
      .then(([cropData, regionData]) => {
        setCropOptions(Array.isArray(cropData) ? cropData : cropData.results || []);
        setRegions(Array.isArray(regionData) ? regionData : regionData.results || []);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function contactFarmer(cropId) {
    setContacting(cropId);
    setError("");
    try {
      const conversation = await buyerService.startConversation(cropId);
      navigate(`/messages/${conversation.id}`);
    } catch (contactError) {
      setError(contactError.message || "Impossible de démarrer la conversation.");
    } finally {
      setContacting(null);
    }
  }

  function updateFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  if (loading) return <Loading>Chargement des récoltes agricoles…</Loading>;

  return (
    <main className="min-h-screen bg-sand">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-primary px-5 py-4 text-white sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Espace acheteur</p>
          <h1 className="mt-1 font-display text-2xl">Bonjour {user?.first_name || "Acheteur"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <MessagesNavLink label="Mes messages" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 font-semibold text-white hover:bg-white/20" />
          <Link to="/transactions" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 font-semibold hover:bg-white/20"><ClipboardList size={16} /> Mes demandes</Link>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-primary">
            <LogOut size={17} /> Se déconnecter
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
        {requestNotice ? <p role="status" className="rounded-xl border border-primary/20 bg-soft px-4 py-3 text-sm font-semibold text-primary">{requestNotice}</p> : null}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs du catalogue">
          {[
            ["Cultures visibles", indicators?.cultures_visibles ?? 0, Sprout],
            ["Récoltes prévues", indicators?.recoltes_prevues ?? 0, CalendarDays],
            ["Récoltes disponibles", indicators?.recoltes_disponibles ?? 0, Leaf],
            ["Nouvelles cultures · 7 jours", indicators?.nouvelles_cultures ?? 0, MessageCircle],
          ].map(([label, value, Icon]) => (
            <article key={label} className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm font-semibold text-muted">
                {label}<span className="rounded-xl bg-soft p-2 text-primary"><Icon size={19} /></span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-primary">{value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">Filtrer le catalogue</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium">Culture
              <select value={filters.culture} onChange={(event) => updateFilter("culture", event.target.value)} className="mt-1 block w-full rounded-xl border border-earth bg-white px-3 py-2.5">
                <option value="">Toutes les cultures</option>
                {cropOptions.map((crop) => <option key={crop.id} value={crop.code}>{crop.nom}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Région
              <select value={filters.region} onChange={(event) => updateFilter("region", event.target.value)} className="mt-1 block w-full rounded-xl border border-earth bg-white px-3 py-2.5">
                <option value="">Toutes les régions</option>
                {regions.map((region) => <option key={region.id} value={region.id}>{region.nom}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Statut
              <select value={filters.statut} onChange={(event) => updateFilter("statut", event.target.value)} className="mt-1 block w-full rounded-xl border border-earth bg-white px-3 py-2.5">
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4" aria-label="Cultures des agriculteurs">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Catalogue agricole</p>
              <h2 className="mt-1 font-display text-3xl">Cultures et récoltes</h2>
            </div>
            <p className="text-sm text-muted">Actualisation automatique toutes les minutes</p>
          </div>
          {crops.length === 0 ? (
            <div className="rounded-2xl border border-earth bg-white p-10 text-center text-muted">
              Aucune culture ne correspond à ces filtres.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {crops.map((crop) => (
                <article key={crop.id} className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">{STATUS_LABELS[crop.statut]}</span>
                      {crop.nouvelle && <span className="ml-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Nouveau</span>}
                      <h3 className="mt-3 text-xl font-bold">{crop.culture_nom}</h3>
                      <p className="mt-1 text-sm text-muted">{crop.agriculteur_nom_complet || "Agriculteur non renseigné"}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Phone size={14} />{crop.agriculteur_telephone || "Téléphone non renseigné"}</p>
                    </div>
                    <span className="rounded-xl bg-soft p-3 text-primary"><Leaf size={22} /></span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="rounded-xl bg-sand p-3 text-sm"><span className="block text-muted">Production totale estimée · indicative</span><strong>{formatQuantity(crop.recolte_estimee_kg)}</strong></p>
                    <p className="rounded-xl bg-sand p-3 text-sm"><span className="block text-muted">Période prévisionnelle</span><strong>{crop.date_recolte_debut ? formatDate(crop.date_recolte_debut) : "Non disponible"}{crop.date_recolte_fin && crop.date_recolte_fin !== crop.date_recolte_debut ? ` – ${formatDate(crop.date_recolte_fin)}` : ""}</strong></p>
                  </div>
                  {crop.statut_recolte === "available" ? <p className="mt-3 rounded-xl border border-primary/15 bg-soft p-3 text-sm"><span className="block text-muted">Stock réel disponible à la vente</span><strong>{formatQuantity(crop.recolte_disponible_kg)}</strong></p> : null}
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted"><MapPin size={16} />{[crop.localisation, crop.departement, crop.region].filter(Boolean).join(", ") || "Localisation non renseignée"}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setExpanded(expanded === crop.id ? null : crop.id)} className="inline-flex items-center gap-2 rounded-xl border border-earth px-4 py-2.5 text-sm font-semibold hover:border-primary">
                      <Eye size={16} />
                      {expanded === crop.id ? "Masquer les détails" : "Voir les détails"}
                    </button>
                    <button type="button" disabled={contacting === crop.id} onClick={() => contactFarmer(crop.id)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                      <MessageCircle size={16} />
                      {contacting === crop.id ? "Ouverture…" : "Contacter l’agriculteur"}
                    </button>
                    {getMarketAction(crop) === "order" ? (
                      <button type="button" onClick={() => setTransaction({ crop, mode: "order" })} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white"><ShoppingCart size={16} /> Commander</button>
                    ) : getMarketAction(crop) === "reservation" ? (
                      <button type="button" onClick={() => setTransaction({ crop, mode: "reservation" })} className="inline-flex items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary"><CalendarClock size={16} /> Réserver</button>
                    ) : (
                      <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl border border-earth px-4 py-2.5 text-sm font-semibold text-muted disabled:cursor-not-allowed">{(() => { const StatusIcon = STATUS_ICONS[crop.statut] || CircleX; return <StatusIcon size={16} />; })()}{STATUS_LABELS[crop.statut] || "Action indisponible"}</button>
                    )}
                  </div>
                  {expanded === crop.id && (
                    <div className="mt-4 grid gap-3 border-t border-earth pt-4 text-sm sm:grid-cols-2">
                      <p><span className="text-muted">Superficie :</span> {crop.superficie ? `${crop.superficie} ${crop.unite_superficie === "ha" ? "ha" : "m²"}` : "Non renseignée"}</p>
                      <p><span className="text-muted">Prénom :</span> {crop.agriculteur_prenom || "Non renseigné"}</p>
                      <p><span className="text-muted">Nom :</span> {crop.agriculteur_nom || "Non renseigné"}</p>
                      <p><span className="text-muted">Téléphone :</span> {crop.agriculteur_telephone || "Non renseigné"}</p>
                      <p><span className="text-muted">Rendement estimé :</span> {crop.rendement_estime_kg_ha ? formatQuantity(crop.rendement_estime_kg_ha, "kg/ha") : "Estimation indisponible"}</p>
                      <p><span className="text-muted">Récolte déclarée :</span> {formatQuantity(crop.recolte_reelle_kg)}</p>
                      <p><span className="text-muted">Quantité à vendre renseignée :</span> {formatQuantity(crop.recolte_disponible, crop.unite_recolte_disponible || "kg")}</p>
                      <p><span className="text-muted">Ajoutée le :</span> {formatDate(crop.date_ajout?.slice(0, 10))}</p>
                      <p><span className="text-muted">Contact :</span> via la messagerie sécurisée</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-xl border border-earth bg-white px-4 py-2 text-sm disabled:opacity-50"><ChevronLeft size={16} /> Précédent</button>
            <button type="button" disabled={!hasNext} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-xl border border-earth bg-white px-4 py-2 text-sm disabled:opacity-50">Suivant <ChevronRight size={16} /></button>
          </div>
        </section>
      </div>
      {transaction ? <CropTransactionForm crop={transaction.crop} mode={transaction.mode} onClose={() => setTransaction(null)} onSuccess={(notice) => { setTransaction(null); setRequestNotice(notice); loadCrops(true); }} /> : null}
    </main>
  );
}
