import { useEffect, useState } from "react";
import { CloudSun, MapPin } from "lucide-react";

import Loading from "../../components/Loading/Loading";
import { meteoService } from "../../services/meteoService";

export default function Meteo({ culture }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!culture) return;

    setLoading(true);

    meteoService
      .getWeather(culture.id)
      .then(setWeather)
      .finally(() => setLoading(false));
  }, [culture]);

  if (!culture) {
    return null;
  }

  if (loading) {
    return <Loading />;
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

      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <div className="font-display text-[58px] font-medium leading-none text-ink">
            {weather?.temperature ?? "—"}°
          </div>

          <p className="mt-2 text-muted">Météo locale</p>
        </div>

        <div className="grid gap-2 text-sm text-muted">
          <span>
            💧 {weather?.humidite ?? "—"}% humidité
          </span>

          <span>
            💨 {weather?.vent_kmh ?? "—"} km/h
          </span>

          <span>
            🌧️ {weather?.precipitation_mm ?? "—"} mm
          </span>
        </div>
      </div>
    </section>
  );
}