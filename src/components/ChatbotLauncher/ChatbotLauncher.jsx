import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, X } from "lucide-react";
import { api } from "../../services/api";

const WELCOME = {
  role: "assistant",
  text: "Bonjour ! Je peux vous aider à utiliser Agri-Conseil ou répondre aux questions agricoles sur les dix cultures prises en charge.",
};

export default function ChatbotLauncher({
  imageSrc = "/images/agriculteur-chatbot.png",
  onClick,
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  function toggle() {
    setOpen((value) => !value);
    onClick?.();
  }

  async function send(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;

    setMessages((items) => [...items, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      // Only the latest message is sent: an unrelated earlier crop cannot
      // change the backend's authorization decision for this question.
      const result = await api.chatbot({ question: text });
      setMessages((items) => [...items, {
        role: "assistant",
        text: result.answer || "Information indisponible.",
        sources: Array.isArray(result.sources) ? result.sources : [],
        status: result.status,
      }]);
    } catch (requestError) {
      setError(requestError?.message || "Le chatbot est momentanément indisponible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <section
          aria-label="Chatbot Agri-Conseil"
          className="fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border border-[#D8E5DA] bg-white shadow-[0_12px_40px_rgba(0,69,47,0.24)]"
          style={{
            position: "fixed",
            display: "flex",
            flexDirection: "column",
            right: "20px",
            bottom: "6rem",
            width: "min(calc(100vw - 2rem), 390px)",
            height: "min(70vh, 560px)",
            maxHeight: "calc(100vh - 8rem)",
            zIndex: 9999,
          }}
        >
          <header className="flex items-center justify-between bg-[#036A38] px-4 py-3 text-white">
            <div>
              <p className="font-bold">Assistant Agri-Conseil</p>
              <p className="text-xs text-white/80">Plateforme et conseils agricoles vérifiés</p>
            </div>
            <button type="button" onClick={toggle} aria-label="Fermer le chatbot" className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7FAF7] p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm leading-6 ${message.role === "user" ? "ml-auto rounded-br-sm bg-[#036A38] text-white" : "mr-auto rounded-bl-sm border border-[#E4EBDD] bg-white text-[#18382A]"}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.sources?.length > 0 && (
                  <div className="mt-2 border-t border-[#E4EBDD] pt-2 text-xs">
                    <p className="mb-1 font-bold">Sources</p>
                    <ul className="space-y-1">
                      {message.sources.map((source, sourceIndex) => (
                        <li key={`${source.url}-${sourceIndex}`}>
                          {source.url?.startsWith("https://") ? (
                            <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-[#036A38] underline">{source.title}</a>
                          ) : (
                            <span className="font-semibold">{source.title}</span>
                          )}
                          {source.organization && <span className="text-[#53675B]"> — {source.organization}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-sm text-[#53675B]" role="status"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Recherche en cours…</div>}
            <div ref={endRef} />
          </div>

          {error && <p role="alert" className="bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>}
          <form onSubmit={send} className="flex items-end gap-2 border-t border-[#E4EBDD] bg-white p-3">
            <textarea id="chatbot-question" aria-label="Votre question" rows={2} maxLength={1500} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Écrivez votre question…" className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-[#D8E5DA] px-3 py-2 text-sm outline-none focus:border-[#036A38] focus:ring-2 focus:ring-[#036A38]/15" />
            <button type="submit" disabled={loading || !question.trim()} aria-label="Envoyer la question" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#036A38] text-white hover:bg-[#02532C] disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Fermer le chatbot" : "Ouvrir le chatbot"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] flex h-[62px] w-[118px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#036A38] shadow-[0_5px_18px_rgba(0,69,47,0.25)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#036A38] focus:ring-offset-2"
        style={{ backgroundImage: `url("${imageSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <span className="absolute inset-0 bg-[#00452F]/35" />
        <span className="relative z-10 rounded-full bg-[#00452F]/75 px-3 py-1 text-xs font-bold text-white">{open ? "Fermer" : "question ?"}</span>
      </button>
    </>
  );
}
