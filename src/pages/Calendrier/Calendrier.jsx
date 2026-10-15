import { useEffect, useState } from "react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import { calendrierService } from "../../services/calendrierService";

export default function Calendrier({ culture }) {
  if (!culture?.id) return null;

  return <CalendrierPourCulture key={culture.id} culture={culture} />;
}

function CalendrierPourCulture({ culture }) {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCalendar() {
      try {
        const data = await calendrierService.getCalendar(culture.id);
        if (active) setCalendar(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Impossible de charger le calendrier.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCalendar();
    return () => {
      active = false;
    };
  }, [culture?.id, retry]);

  if (loading) return <Loading>Chargement du calendrier…</Loading>;

  if (error) {
    return (
      <section className="rounded-[10px] border border-earth bg-white p-6">
        <ErrorMessage message={error} />
        <button
          type="button"
          onClick={() => {
            setError("");
            setLoading(true);
            setRetry((value) => value + 1);
          }}
          className="mt-4 rounded-md border border-primary px-4 py-2 font-semibold text-primary"
        >
          Réessayer
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[10px] border border-earth bg-white p-6 shadow-[0_12px_35px_rgba(31,31,27,0.06)] sm:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
            Calendrier personnalisé
          </span>
          <h2 className="mt-2 font-display text-4xl font-medium tracking-[-0.045em] text-ink">
            {culture.culture_nom}
          </h2>
        </div>
        <span className="inline-flex rounded-full bg-soft px-3 py-1.5 text-xs font-extrabold text-primary">
          Stade : {calendar?.stade_actuel?.nom || "—"}
        </span>
      </div>

      <div className="max-w-[760px]">
        {!calendar ? (
          <p className="text-muted">Aucun calendrier disponible pour cette culture.</p>
        ) : calendar.operations?.length ? (
          calendar.operations.map((operation) => (
            <article
              key={operation.id}
              className="relative grid grid-cols-[18px_1fr] gap-[18px] pb-7"
            >
              <div className="relative">
                <div className="relative z-10 h-4 w-4 rounded-full bg-primary" />
              </div>
              <div className="border-b border-earth pb-7">
                <span className="text-xs font-extrabold text-primary">
                  {operation.date_debut} → {operation.date_fin}
                </span>
                <h3 className="mt-1 text-xl font-semibold text-ink">{operation.nom}</h3>
                <p className="mt-1 leading-7 text-muted">{operation.description}</p>
                <small className="mt-2 block text-sm text-muted">
                  Stade : {operation.stade_nom}
                </small>
              </div>
            </article>
          ))
        ) : (
          <p className="text-muted">Aucune opération n’est prévue pour cette culture.</p>
        )}
      </div>
    </section>
  );
}
