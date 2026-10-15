import { useState } from "react";
import { BookOpen, LoaderCircle, Send } from "lucide-react";
import { iaService } from "../services/iaService";
import { getAgriculturalChatPresentation } from "../utils/agriculturalChat";

const EXAMPLES = [
  "Comment irriguer le riz ?",
  "Mon mil jaunit, que dois-je observer ?",
  "Comment conserver les oignons après la récolte ?",
];

export default function AgriculturalChat() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await iaService.askAgriculturalQuestion(question.trim()));
    } catch (err) {
      setError(err?.message || "Impossible de joindre l’assistant. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="rounded-[24px] border border-earth bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary">
          <BookOpen size={24} aria-hidden="true" />
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">Assistant agricole documenté</span>
          <h2 className="text-2xl font-bold">Posez votre question agricole</h2>
        </div>
      </div>
      <p className="mt-3 leading-7 text-muted">
        Les réponses s’appuient sur des références agricoles vérifiées. Si aucune source ne répond à votre question, l’assistant vous le dira.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Exemples de questions">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => setQuestion(example)} className="rounded-full border border-earth px-3 py-1.5 text-left text-sm text-primary hover:bg-soft">
            {example}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <label htmlFor="agricultural-question" className="block text-sm font-semibold">Votre question</label>
        <textarea id="agricultural-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1500} rows={3} required placeholder="Ex. : quels signes observer sur mes plants de riz ?" className="w-full rounded-xl border border-earth p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <button type="submit" disabled={loading || !question.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          {loading ? "Recherche dans les références…" : "Poser la question"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {result && (
        <div className={`mt-5 rounded-xl p-4 ${getAgriculturalChatPresentation(result).isGrounded ? "bg-soft" : "bg-amber-50"}`} aria-live="polite">
          <h3 className="mb-2 text-sm font-bold">{getAgriculturalChatPresentation(result).label}</h3>
          <p className="whitespace-pre-wrap leading-7">{result.answer}</p>
          {getAgriculturalChatPresentation(result).sources.length > 0 && (
            <div className="mt-4 border-t border-earth/70 pt-3">
              <h3 className="text-sm font-bold">Références utilisées</h3>
              <ul className="mt-2 space-y-2">
                {getAgriculturalChatPresentation(result).sources.map((source, index) => (
                  <li key={`${source.url}-${index}`} className="text-sm">
                    <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">{source.title}</a>
                    <span className="text-muted"> — {source.organization}{source.date ? `, ${source.date}` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
