import { useEffect, useState } from "react";
import { CloudSun, MapPin } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import { meteoService } from "../../services/meteoService";

export default function Meteo({ culture }) {
  if (!culture?.id) return null;

  return <MeteoForCulture key={culture.id} culture={culture} />;
}

function MeteoForCulture({ culture }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      try {
        const data = await meteoService.getWeather(culture.id);
        if (active) setWeather(data);
      } catch (err) {
        if (active) setError(err.message || "Impossible de charger la météo.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWeather();
    return () => {
      active = false;
    };
  }, [culture?.id, retry]);

  if (loading) return <Loading />;

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

  return (
    <section className="rounded-[10px] border border-earth bg-sand p-6 shadow-[0_12px_35px_rgba(31,31,27,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-bold text-ink">
          <MapPin size={18} className="text-primary" />
          {culture.localisation}
        </span>
        <CloudSun size={24} className="text-primary" />
      </div>

      {!weather ? (
        <p className="mt-8 text-muted">Aucune donnée météo disponible pour cette culture.</p>
      ) : (
        <div className="mt-8 flex items-end justify-between gap-5">
          <div>
            <div className="font-display text-[58px] font-medium leading-none text-ink">
              {weather.temperature ?? "—"}°
            </div>
            <p className="mt-2 text-muted">Météo locale</p>
          </div>
          <div className="grid gap-2 text-sm text-muted">
            <span>💧 {weather.humidite ?? "—"}% humidité</span>
            <span>💨 {weather.vent_kmh ?? "—"} km/h</span>
            <span>🌧️ {weather.precipitation_mm ?? "—"} mm</span>
          </div>
        </div>
      )}
    </section>
  );
}
