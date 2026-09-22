import { useState } from "react";
import { Camera } from "lucide-react";

import { iaService } from "../../services/iaService";

export default function IA({ culture }) {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("image", file);

    if (culture) {
      formData.append("culture_suivie", culture.id);
    }

    try {
      const result = await iaService.analyze(formData);
      setAnalysis(result.analyse);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid grid-cols-1 gap-6 rounded-[10px] border border-earth bg-white p-6 shadow-[0_12px_35px_rgba(31,31,27,0.06)] sm:p-8 lg:grid-cols-[1fr_.9fr]">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
          Assistant IA
        </span>

        <h2 className="mt-2 font-display text-4xl font-medium tracking-[-0.045em] text-ink">
          Un problème sur votre plante ?
        </h2>

        <p className="mt-3 leading-7 text-muted">
          Choisissez une photo nette d’une feuille ou d’une plante. Le résultat
          est une aide à la décision.
        </p>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-dashed border-earth bg-sand p-6">
          <Camera size={30} className="shrink-0 text-primary" />

          <span className="truncate text-muted">
            {file ? file.name : "Choisir une photo"}
          </span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
          />
        </label>

        {error && (
          <div className="mt-4 border-l-4 border-primary bg-sand px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!file || loading}
          onClick={analyze}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyse en cours…" : "Analyser la photo"}
        </button>
      </div>

      {analysis && (
        <div className="rounded-[9px] bg-soft p-6">
          <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
            Résultat
          </span>

          <h3 className="mt-3 text-xl font-bold text-ink">
            {analysis.probleme}
          </h3>

          <p className="mt-2 leading-7 text-muted">
            {analysis.resultat}
          </p>

          <h4 className="mt-5 font-bold text-ink">Conseil</h4>

          <p className="mt-2 leading-7 text-muted">
            {analysis.conseil}
          </p>

          <span className="mt-4 block text-xs font-extrabold text-primary">
            Confiance indicative : {analysis.confiance}%
          </span>
        </div>
      )}
    </section>
  );
}