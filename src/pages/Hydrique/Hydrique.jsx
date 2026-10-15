import { useEffect, useState } from "react";
import { Droplets, Sprout } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import { hydriqueService } from "../../services/hydriqueService";

export default function Hydrique({ culture }) {
  if (!culture?.id) return null;

  return <HydriqueForCulture key={culture.id} culture={culture} />;
}

function HydriqueForCulture({ culture }) {
  const [hydrique, setHydrique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadHydrique() {
      try {
        const data = await hydriqueService.getHydrique(culture.id);
        if (active) setHydrique(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Impossible de charger le conseil hydrique.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHydrique();
    return () => {
      active = false;
    };
  }, [culture?.id, retry]);

  if (loading) return <Loading>Chargement du conseil hydrique…</Loading>;

  if (error) {
    return (
      <section className="rounded-[10px] border border-earth bg-sand p-6">
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

  if (!hydrique) {
    return (
      <section className="rounded-[10px] border border-earth bg-sand p-6 text-muted">
        Aucune donnée hydrique disponible pour cette culture.
      </section>
    );
  }

  return (
    <section className="rounded-[10px] border border-earth bg-sand p-6 shadow-[0_12px_35px_rgba(31,31,27,0.06)]">
      <div className="flex items-center gap-2 font-bold text-ink">
        <Droplets size={18} className="text-primary" />
        Conseil hydrique
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 font-bold text-ink">
          <Sprout size={18} className="text-primary" />
          Stade actuel
        </div>
        <h2 className="mt-4 font-display text-4xl font-medium text-ink">
          {hydrique.stage?.nom || "—"}
        </h2>
        <p className="mt-3 leading-7 text-muted">
          Calculé automatiquement à partir de la date de semis et du cycle de la culture.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-earth pt-5 text-sm text-muted">
        <span>Kc <strong className="text-primary">{hydrique.stage?.kc ?? "—"}</strong></span>
        <span>ETo <strong className="text-primary">{hydrique.eto ?? "—"} mm</strong></span>
      </div>

      <div className="mt-7 border-t border-earth pt-5">
        <p className="leading-7 text-muted">
          {hydrique.conseil || "Aucun conseil disponible."}
        </p>
        <div className="mt-4 text-sm text-muted">
          Besoin estimé (ETc) : <strong className="text-primary">{hydrique.etc ?? "—"} mm</strong>
        </div>
      </div>
    </section>
  );
}
