
export default function ChatbotLauncher({
  imageSrc = "/images/agriculteur-chatbot.png",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Question ?"
      className="fixed bottom-5 right-5 z-[60] flex h-[62px] w-[118px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#036A38] shadow-[0_5px_18px_rgba(0,69,47,0.25)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#036A38] focus:ring-offset-2"
      style={{
        backgroundImage: `url("${imageSrc}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Voile discret pour garder le texte lisible */}
      <span className="absolute inset-0 bg-[#00452F]/35" />

      <span className="relative z-10 rounded-full bg-[#00452F]/75 px-3 py-1 text-xs font-bold text-white">
        question ?
      </span>
    </button>
  );
}
