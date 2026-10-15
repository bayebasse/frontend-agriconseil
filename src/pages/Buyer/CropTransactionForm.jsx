import { useState } from "react";
import { ArrowLeft, CalendarClock, ClipboardList, ShoppingCart, X } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { transactionService } from "../../services/transactionService";
import { buildTransactionPayload } from "../../utils/transactionPayload";

function localDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function CropTransactionForm({ crop, mode, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [reservationType, setReservationType] = useState("indicative");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const isOrder = mode === "order";

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const payload = buildTransactionPayload(mode, { quantity, date, message, reservationType });
      if (isOrder) {
        await transactionService.createOrder(crop.id, payload);
      } else {
        await transactionService.createReservation(crop.id, payload);
      }
      onSuccess(isOrder ? "Commande envoyée à l’agriculteur." : "Réservation envoyée à l’agriculteur.");
    } catch (submitError) {
      setError(submitError.message || "La demande n’a pas pu être envoyée.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="transaction-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">{isOrder ? <ClipboardList size={15} /> : <CalendarClock size={15} />}{isOrder ? "Nouvelle commande" : "Nouvelle réservation"}</p>
            <h2 id="transaction-title" className="mt-1 font-display text-2xl">{crop.culture_nom}</h2>
            <p className="mt-1 text-sm text-muted">{crop.agriculteur_nom_complet || "Agriculteur non renseigné"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-muted hover:bg-sand"><X size={20} /></button>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl bg-sand p-4 text-sm sm:grid-cols-2">
          <p>Stock réel disponible : <strong>{isOrder && crop.recolte_disponible_kg != null ? `${crop.recolte_disponible_kg} kg` : "Non disponible"}</strong></p>
          <p>Prix indicatif : <strong>{crop.prix_kg_fcfa ? `${crop.prix_kg_fcfa} FCFA/kg` : "Non renseigné"}</strong></p>
          {!isOrder ? <p className="sm:col-span-2">Prévision encore réservable : <strong>{crop.quantite_previsionnelle_reservable_kg != null ? `${crop.quantite_previsionnelle_reservable_kg} kg (indicatif)` : "Estimation indisponible"}</strong></p> : null}
        </div>
        {!isOrder ? <p className="mt-3 text-xs text-muted">Une réservation ferme ne devient effective qu’après confirmation par l’agriculteur et vérification de la prévision disponible. Une estimation n’est pas un stock récolté.</p> : null}
        <ErrorMessage message={error} />

        <form onSubmit={submit} className="mt-4 space-y-4">
          <label className="block text-sm font-semibold">Quantité souhaitée (kg)
            <input type="number" min="0.001" step="0.001" required value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 w-full rounded-xl border border-earth px-3 py-2.5" />
          </label>
          <label className="block text-sm font-semibold">{isOrder ? "Date souhaitée de livraison ou retrait" : "Date souhaitée de disponibilité"}
            <input type="date" min={localDate()} required value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-xl border border-earth px-3 py-2.5" />
          </label>
          {!isOrder ? (
            <label className="block text-sm font-semibold">Type de réservation
              <select value={reservationType} onChange={(event) => setReservationType(event.target.value)} className="mt-1 w-full rounded-xl border border-earth bg-white px-3 py-2.5">
                <option value="indicative">Indicative · ne bloque pas de quantité</option>
                <option value="firm" disabled={crop.quantite_previsionnelle_reservable_kg == null}>Ferme · soumise à confirmation et au stock prévisionnel</option>
              </select>
            </label>
          ) : null}
          <label className="block text-sm font-semibold">Message (facultatif)
            <textarea value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-earth px-3 py-2.5" />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl border border-earth px-4 py-2.5 font-semibold"><ArrowLeft size={16} /> Retour</button>
            <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white disabled:opacity-60">{isOrder ? <ShoppingCart size={16} /> : <CalendarClock size={16} />}{sending ? "Envoi…" : isOrder ? "Envoyer la commande" : "Envoyer la réservation"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
