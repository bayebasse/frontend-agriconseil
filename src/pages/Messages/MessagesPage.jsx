import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Mic, MicOff, Send, Square } from "lucide-react";

import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { useAuth } from "../../contexts/AuthContext";
import { buyerService } from "../../services/buyerService";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

function conversationPartner(conversation, role) {
  return role === "buyer" ? conversation.agriculteur_nom : conversation.acheteur_nom;
}

function formatTime(value) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function getInitials(value) {
  return (value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase("fr-FR"))
    .join("") || "?";
}

function chooseAudioType() {
  if (!window.MediaRecorder) return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]
    .find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export default function MessagesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [audioUrls, setAudioUrls] = useState({});
  const [text, setText] = useState("");
  const [voiceFile, setVoiceFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const refreshConversations = useCallback(async () => {
    try {
      const data = await buyerService.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger vos conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      const data = await buyerService.getMessages(conversationId);
      setMessages(Array.isArray(data) ? data : []);
      await refreshConversations();
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger les messages.");
    }
  }, [conversationId, refreshConversations]);

  useEffect(() => {
    refreshConversations();
    const interval = window.setInterval(refreshConversations, 20_000);
    return () => window.clearInterval(interval);
  }, [refreshConversations]);

  useEffect(() => {
    refreshMessages();
    if (!conversationId) return undefined;
    const interval = window.setInterval(refreshMessages, 8_000);
    return () => window.clearInterval(interval);
  }, [refreshMessages, conversationId]);

  const audioIds = useMemo(
    () => messages.filter((message) => message.has_audio).map((message) => message.id).join(","),
    [messages]
  );

  useEffect(() => {
    let active = true;
    const urls = {};
    async function loadAudio() {
      await Promise.all(audioIds.split(",").filter(Boolean).map(async (id) => {
        try {
          const blob = await buyerService.getMessageAudio(id);
          if (active) urls[id] = URL.createObjectURL(blob);
        } catch {
          // Le lecteur reste désactivé si le fichier n'est plus disponible.
        }
      }));
      if (active) setAudioUrls(urls);
      else Object.values(urls).forEach(URL.revokeObjectURL);
    }
    loadAudio();
    return () => {
      active = false;
      Object.values(urls).forEach(URL.revokeObjectURL);
    };
  }, [audioIds]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const activeConversation = conversations.find((item) => String(item.id) === String(conversationId));

  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("L’enregistrement vocal n’est pas pris en charge par ce navigateur.");
      return;
    }
    const mimeType = chooseAudioType();
    if (!mimeType) {
      setError("Aucun format vocal compatible n’est disponible.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        if (blob.size > MAX_AUDIO_BYTES) {
          setVoiceFile(null);
          setError("Le vocal dépasse la limite de 10 Mo. Enregistrez un message plus court.");
          return;
        }
        const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
        setVoiceFile(new File([blob], `message-vocal.${extension}`, { type: blob.type }));
        setPreviewUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError("Accès au microphone refusé ou indisponible. Autorisez le microphone puis réessayez.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!conversationId || sending || (!text.trim() && !voiceFile)) return;
    setSending(true);
    setError("");
    try {
      if (voiceFile) {
        const data = new FormData();
        data.append("message_type", "audio");
        data.append("audio_file", voiceFile);
        await buyerService.sendMessage(conversationId, data);
      } else {
        await buyerService.sendMessage(conversationId, { message_type: "text", content: text.trim() });
      }
      setText("");
      setVoiceFile(null);
      setPreviewUrl("");
      await Promise.all([refreshMessages(), refreshConversations()]);
    } catch (sendError) {
      setError(sendError.message || "Impossible d’envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-sand">
      <header className="flex items-center justify-between gap-4 bg-primary px-5 py-4 text-white sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Agri-Conseil</p>
          <h1 className="mt-1 font-display text-2xl">{user.role === "farmer" ? "Mes acheteurs" : "Mes messages"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to={user.role === "buyer" ? "/acheteur" : "/dashboard"} className="rounded-xl bg-white/10 px-4 py-2.5 font-semibold">Mon espace</Link>
          <button type="button" onClick={handleLogout} className="rounded-xl bg-white px-4 py-2.5 font-semibold text-primary">Se déconnecter</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
        <div className="mt-5 grid min-h-[68vh] overflow-hidden rounded-2xl border border-earth bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          <aside className={`${conversationId ? "hidden lg:block" : "block"} border-b border-earth p-4 lg:border-b-0 lg:border-r`}>
            <h2 className="mb-3 font-bold">{user.role === "farmer" ? "Acheteurs qui vous ont contacté" : "Mes conversations"}</h2>
            {loading && conversations.length === 0 ? <p className="text-sm text-muted">Chargement…</p> : null}
            {conversations.length === 0 && !loading ? <p className="text-sm text-muted">Aucune conversation pour le moment.</p> : null}
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button key={conversation.id} type="button" onClick={() => navigate(`/messages/${conversation.id}`)} className={`w-full rounded-xl p-3 text-left ${String(conversation.id) === String(conversationId) ? "bg-soft" : "hover:bg-sand"}`}>
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-bold text-primary" aria-hidden="true">{getInitials(conversationPartner(conversation, user.role))}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{conversationPartner(conversation, user.role)}</span>
                      <span className="block truncate text-sm text-muted">{conversation.culture_nom} · {conversation.localisation || "Localisation non renseignée"}</span>
                    </span>
                  </span>
                  <span className="mt-2 block truncate text-sm text-muted">{conversation.dernier_message?.contenu || "Nouvelle conversation"}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{formatTime(conversation.dernier_message?.date || conversation.updated_at)}</span>
                    {conversation.messages_non_lus > 0 ? <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-white">{conversation.messages_non_lus} non lu(s)</span> : null}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className={`${conversationId ? "flex" : "hidden lg:flex"} min-h-[60vh] flex-col`}>
            {activeConversation ? (
              <>
                <div className="border-b border-earth px-5 py-4">
                  <Link to="/messages" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-primary lg:hidden"><ArrowLeft size={16} /> Toutes les conversations</Link>
                  <h2 className="font-bold">{activeConversation.culture_nom}</h2>
                  <p className="text-sm text-muted">{conversationPartner(activeConversation, user.role)} · {activeConversation.localisation || "Localisation non renseignée"}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-sand/60 p-4 sm:p-6">
                  {messages.length === 0 ? <p className="text-center text-sm text-muted">Démarrez la discussion au sujet de cette culture.</p> : null}
                  {messages.map((message) => {
                    const mine = message.sender === user.id;
                    return (
                      <article key={message.id} className={`max-w-[90%] rounded-2xl p-3 sm:max-w-[75%] ${mine ? "ml-auto bg-primary text-white" : "bg-white text-ink shadow-sm"}`}>
                        <p className={`mb-1 text-xs ${mine ? "text-white/70" : "text-muted"}`}>{message.sender_name} · {formatTime(message.created_at)}</p>
                        {message.message_type === "audio" ? (
                          audioUrls[message.id] ? <audio controls preload="none" src={audioUrls[message.id]} className="max-w-full" /> : <span className="text-sm">Chargement du vocal…</span>
                        ) : <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                        {mine && message.read_at ? <p className="mt-1 text-right text-xs text-white/70">Lu</p> : null}
                      </article>
                    );
                  })}
                </div>
                <form onSubmit={sendMessage} className="space-y-3 border-t border-earth p-4">
                  {previewUrl && voiceFile ? <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sand p-3"><audio controls src={previewUrl} /><span className="text-sm text-muted">Aperçu du vocal · {Math.ceil(voiceFile.size / 1024)} Ko</span><button type="button" onClick={() => { setVoiceFile(null); setPreviewUrl(""); }} className="text-sm font-semibold text-red-700">Retirer</button></div> : null}
                  <div className="flex items-end gap-2">
                    <textarea value={text} onChange={(event) => setText(event.target.value)} disabled={Boolean(voiceFile) || recording} maxLength={5000} rows={2} placeholder="Écrire un message…" className="min-w-0 flex-1 resize-y rounded-xl border border-earth px-3 py-2.5 disabled:bg-sand" />
                    {recording ? (
                      <button type="button" onClick={stopRecording} aria-label="Arrêter l’enregistrement" className="rounded-xl bg-red-600 p-3 text-white"><Square size={19} /></button>
                    ) : (
                      <button type="button" disabled={!conversationId || Boolean(text.trim()) || Boolean(voiceFile)} onClick={startRecording} aria-label="Enregistrer un vocal" className="rounded-xl border border-earth p-3 text-primary disabled:opacity-40"><Mic size={19} /></button>
                    )}
                    <button type="submit" disabled={sending || recording || (!text.trim() && !voiceFile)} aria-label="Envoyer" className="rounded-xl bg-primary p-3 text-white disabled:opacity-50">{sending ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}</button>
                  </div>
                  <p className="text-xs text-muted">Messages vocaux jusqu’à 10 Mo. Le navigateur demandera l’accès au microphone.</p>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted">
                <MicOff size={34} className="text-primary" />
                <p className="mt-3 font-semibold">Choisissez une conversation dans la liste.</p>
                <Link to={user.role === "buyer" ? "/acheteur" : "/dashboard"} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={15} />Retour à mon espace</Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
