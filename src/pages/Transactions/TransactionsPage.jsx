import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Ban, CalendarClock, CalendarDays, Check, CircleCheck, CircleX, ClipboardList, Clock3, PackageCheck } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { useAuth } from "../../contexts/AuthContext";
import { transactionService } from "../../services/transactionService";

const ORDER_STATUS = {
  pending: "En attente",
  confirmed: "Validée",
  refused: "Refusée",
  cancelled: "Annulée",
  delivered: "Livrée",
};
const RESERVATION_STATUS = {
  pending: "En attente de confirmation",
  confirmed: "Confirmée",
  refused: "Refusée",
  cancelled: "Annulée",
};
const STATUS_ICONS = {
  pending: Clock3,
  confirmed: CircleCheck,
  refused: CircleX,
  cancelled: Ban,
  delivered: PackageCheck,
};

function formatDate(value) {
  if (!value) return "Non renseignée";
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? "Non renseignée" : parsed.toLocaleDateString("fr-FR", { dateStyle: "long" });
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const farmer = user.role === "farmer";
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "reservations" ? "reservations" : "orders";
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [orderData, reservationData] = await Promise.all([
        transactionService.getOrders(),
        transactionService.getReservations(),
      ]);
      setOrders(orderData);
      setReservations(reservationData);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger vos commandes et réservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function runAction(kind, id, action, successText) {
    setBusy(`${kind}-${id}-${action}`);
    setError("");
    setNotice("");
    try {
      if (kind === "order") await transactionService.orderAction(id, action);
      else await transactionService.reservationAction(id, action);
      setNotice(successText);
      await load();
    } catch (actionError) {
      setError(actionError.message || "Cette action n’a pas pu être effectuée.");
    } finally {
      setBusy(null);
    }
  }

  const entries = tab === "orders" ? orders : reservations;

  return (
    <main className="min-h-screen bg-sand">
      <header className="bg-primary px-5 py-5 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Agri-Conseil</p>
            <h1 className="mt-1 font-display text-2xl">{farmer ? "Mes commandes et réservations" : "Mes demandes"}</h1>
          </div>
          <Link to={farmer ? "/dashboard" : "/acheteur"} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold"><ArrowLeft size={16} /> Mon espace</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
        {notice ? <p role="status" className="rounded-xl border border-primary/20 bg-soft px-4 py-3 text-sm font-semibold text-primary">{notice}</p> : null}

        <nav className="flex gap-2" aria-label="Commandes et réservations">
          <button type="button" onClick={() => setSearchParams({ tab: "orders" })} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${tab === "orders" ? "bg-primary text-white" : "border border-earth bg-white text-ink"}`}><ClipboardList size={17} /> Mes commandes <span>({orders.length})</span></button>
          <button type="button" onClick={() => setSearchParams({ tab: "reservations" })} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${tab === "reservations" ? "bg-primary text-white" : "border border-earth bg-white text-ink"}`}><CalendarClock size={17} /> Mes réservations <span>({reservations.length})</span></button>
        </nav>

        {loading ? <p className="rounded-2xl border border-earth bg-white p-8 text-center text-muted">Chargement…</p> : entries.length === 0 ? (
          <div className="rounded-2xl border border-earth bg-white p-10 text-center text-muted">Aucune {tab === "orders" ? "commande" : "réservation"} pour le moment.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {entries.map((item) => {
              const isOrder = tab === "orders";
              const status = item.statut;
              const StatusIcon = STATUS_ICONS[status] || Clock3;
              const actionable = `${tab === "orders" ? "order" : "reservation"}-${item.id}`;
              return (
                <article key={item.id} className="rounded-2xl border border-earth bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary"><StatusIcon size={14} />{(isOrder ? ORDER_STATUS : RESERVATION_STATUS)[status] || status}</span>
                      <h2 className="mt-3 text-xl font-bold">{item.culture_nom}</h2>
                      <p className="mt-1 text-xs font-semibold text-muted">{isOrder ? "Commande" : "Réservation"} n° {item.id}</p>
                      <p className="mt-1 text-sm text-muted">{farmer ? `Acheteur : ${item.buyer_name}` : `Agriculteur : ${item.farmer_name}`}</p>
                    </div>
                    {isOrder ? <ClipboardList aria-label="Commande" className="text-primary" /> : <CalendarClock aria-label="Réservation" className="text-primary" />}
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <p className="rounded-xl bg-sand p-3">Quantité : <strong>{item.quantite_kg} kg</strong></p>
                    <p className="rounded-xl bg-sand p-3"><CalendarDays className="mr-1 inline" size={15} />Date : <strong>{formatDate(isOrder ? item.date_souhaitee : item.date_disponibilite_souhaitee)}</strong></p>
                    <p className="rounded-xl bg-sand p-3">Demande créée le : <strong>{formatDate(item.created_at)}</strong></p>
                    {!isOrder ? <>
                      <p className="rounded-xl bg-sand p-3 sm:col-span-2">Type : <strong>{item.type_reservation === "firm" ? "Ferme · à confirmer par l’agriculteur" : "Indicative · ne bloque pas de quantité"}</strong></p>
                      <p className="rounded-xl bg-sand p-3 sm:col-span-2">Période prévisionnelle de récolte : <strong>{item.recolte_prevue?.date_debut ? `${formatDate(item.recolte_prevue.date_debut)}${item.recolte_prevue.date_fin && item.recolte_prevue.date_fin !== item.recolte_prevue.date_debut ? ` – ${formatDate(item.recolte_prevue.date_fin)}` : ""}` : "Non disponible"}</strong> <span className="text-muted">(indicative)</span></p>
                    </> : item.prix_kg_fcfa ? <p className="rounded-xl bg-sand p-3">Prix saisi à la demande : <strong>{item.prix_kg_fcfa} FCFA/kg</strong></p> : null}
                    {item.message ? <p className="rounded-xl bg-sand p-3 sm:col-span-2">Message : {item.message}</p> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {farmer && status === "pending" ? <>
                      <button disabled={Boolean(busy)} onClick={() => runAction(isOrder ? "order" : "reservation", item.id, "confirm", isOrder ? "Commande validée." : "Réservation confirmée.")} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check size={16} /> {isOrder ? "Valider" : "Confirmer"}</button>
                      <button disabled={Boolean(busy)} onClick={() => runAction(isOrder ? "order" : "reservation", item.id, "refuse", "Demande refusée.")} className="inline-flex items-center gap-1 rounded-xl border border-earth px-3 py-2 text-sm font-semibold disabled:opacity-50"><CircleX size={16} /> Refuser</button>
                    </> : null}
                    {farmer && isOrder && status === "confirmed" ? <button disabled={Boolean(busy)} onClick={() => runAction("order", item.id, "deliver", "Commande marquée comme livrée.")} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><PackageCheck size={16} /> Marquer livrée</button> : null}
                    {(status === "pending" || status === "confirmed") ? <button disabled={Boolean(busy)} onClick={() => runAction(isOrder ? "order" : "reservation", item.id, "cancel", "Demande annulée.")} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"><Ban size={16} /> Annuler</button> : null}
                    {busy?.startsWith(actionable) ? <span className="self-center text-sm text-muted">Mise à jour…</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
