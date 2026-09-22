import { useEffect, useState } from "react";

import Loading from "../../components/Loading/Loading";
import { calendrierService } from "../../services/calendrierService";

export default function Calendrier({ culture }) {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!culture) return;

    setLoading(true);

    calendrierService
      .getCalendar(culture.id)
      .then(setCalendar)
      .finally(() => setLoading(false));
  }, [culture]);

  if (!culture) return null;

  if (loading) {
    return <Loading>Chargement du calendrier…</Loading>;
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
        {calendar?.operations?.map((operation) => (
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

              <h3 className="mt-1 text-xl font-semibold text-ink">
                {operation.nom}
              </h3>

              <p className="mt-1 leading-7 text-muted">
                {operation.description}
              </p>

              <small className="mt-2 block text-sm text-muted">
                Stade : {operation.stade_nom}
              </small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}