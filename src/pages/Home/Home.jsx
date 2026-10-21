import { useState } from "react";
import {
  CalendarDays,
  Camera,
  CloudSun,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: CalendarDays,
    title: "Calendrier agricole intelligent",
    text: "Suivez automatiquement les étapes de vos cultures et les opérations à réaliser au bon moment.",
  },
  {
    icon: CloudSun,
    title: "Météo locale",
    text: "Consultez les prévisions météorologiques pour mieux anticiper les conditions dans votre région.",
  },
  {
    icon: Camera,
    title: "Analyse IA des plantes",
    text: "Prenez ou importez une photo pour obtenir une analyse et des conseils agronomiques adaptés.",
  },
];

const cultures = [
  { name: "Riz", image: "/images/cultures/riz.jpg" },
  { name: "Mil", image: "/images/cultures/mil.jpg" },
  { name: "Maïs", image: "/images/cultures/mais.jpg" },
  { name: "Sorgho", image: "/images/cultures/sorgho.jpg" },
  { name: "Arachide", image: "/images/cultures/arachide.jpg" },
  { name: "Niébé", image: "/images/cultures/niebe.jpg" },
  { name: "Manioc", image: "/images/cultures/manioc.jpg" },
  { name: "Oignon", image: "/images/cultures/oignon.jpg" },
  { name: "Mangue", image: "/images/cultures/mangue.jpg" },
  { name: "Pastèque", image: "/images/cultures/pasteque.jpg" },
];

const steps = [
  "Créez votre compte",
  "Enregistrez vos cultures",
  "Suivez votre calendrier",
  "Analysez vos plantes avec l’IA",
];

export default function Home() {
  const [visibleCultures, setVisibleCultures] = useState(3);

  function showMoreCultures() {
    setVisibleCultures((current) => {
      if (current === 3) return 6;
      if (current === 6) return 10;
      return 10;
    });
  }

  return (
    <main>
      {/* HERO */}
      
      {/* HERO — inspiration FarmRaise FSA Hub */}
      <section className="relative overflow-hidden bg-[#F3F8F2] px-4 py-12 sm:px-6 sm:py-16 lg:py-[52px]">
        {/* Motif décoratif discret en arrière-plan */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "repeating-radial-gradient(ellipse at 15% 20%, transparent 0, transparent 28px, #DCE9DE 29px, transparent 31px, transparent 48px)",
            backgroundSize: "560px 420px",
          }}
        />

        <div className="relative mx-auto grid max-w-[1110px] items-center gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          {/* Texte à gauche */}
          <div className="max-w-[640px]">
            <h1 className="font-display text-[36px] font-bold leading-[1.08] tracking-[-0.035em] text-black sm:text-[44px] lg:text-[46px]">
              Ressources en agriculture urbaine
            </h1>

            <p className="mt-6 text-base leading-7 text-black sm:text-lg sm:leading-8">
              L’agriculture urbaine transforme la production, la distribution
              et l’accès à l’alimentation dans les villes. Que vous cultiviez
              sur un toit, dans un jardin communautaire ou grâce à
              l’agriculture verticale, Agri-Conseil vous propose des outils et
              des conseils pour vous accompagner.
            </p>
          </div>

          {/* Image à droite */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -bottom-3 right-[-8px] h-full w-full rounded-[22px] bg-[#DCE9DE]"
            />

            <img
              src="/images/agriculture-urbaine.png"
              alt="Jardin urbain avec des plantes cultivées en pots"
              className="relative z-10 aspect-[1.45/1] w-full rounded-[18px] object-cover"
            />
          </div>
        </div>
      </section>


      {/* FONCTIONNALITÉS */}
      <section
        id="fonctionnalites"
        className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:py-[84px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[760px]">
            <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#036A38]">
              Les fonctionnalités
            </span>

            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#123D2B] sm:text-4xl lg:text-[44px]">
              Tout ce dont l’agriculteur a besoin, au même endroit.
            </h2>

            <p className="mt-4 text-base leading-7 text-[#475569]">
              Des outils simples pour mieux organiser et suivre vos cultures.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-xl border border-[#DCE9DE] bg-white p-6 shadow-[0_8px_28px_rgba(18,61,43,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(18,61,43,0.10)] sm:p-7"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#E5F4E9] text-[#036A38]">
                  <Icon size={24} strokeWidth={1.9} />
                </div>

                <h3 className="mt-5 text-xl font-bold leading-snug text-[#123D2B]">
                  {title}
                </h3>

                <p className="mt-3 min-h-[84px] text-sm leading-6 text-[#475569] sm:text-base">
                  {text}
                </p>

                <Link
                  to="/inscription"
                  className="mt-5 inline-flex items-center gap-2 font-bold text-[#036A38] transition hover:text-[#0B7950]"
                >
                  Découvrir
                  <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NOS 10 CULTURES */}
      <section
        id="cultures"
        className="scroll-mt-24 bg-[#F3F8F2] px-4 py-16 sm:px-6 sm:py-20 lg:py-[84px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#036A38]">
                Agriculture au Sénégal
              </span>

              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[#123D2B] sm:text-4xl lg:text-[44px]">
                Nos 10 cultures
              </h2>

              <p className="mt-3 max-w-[620px] text-base leading-7 text-[#475569]">
                Découvrez les cultures prises en charge par Agri-Conseil et
                accédez à des outils pour mieux les suivre.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-[#DCE9DE] bg-white px-4 py-2 text-sm font-semibold text-[#036A38]">
              {visibleCultures} sur 10 cultures
            </span>
          </div>

          {/* Cartes des cultures */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cultures.slice(0, visibleCultures).map((culture, index) => (
              <article
                key={culture.name}
                className="group overflow-hidden rounded-xl border border-[#DCE9DE] bg-white p-4 shadow-[0_6px_24px_rgba(18,61,43,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(18,61,43,0.10)]"
              >
                <div className="relative aspect-[1.65/1] overflow-hidden rounded-lg bg-[#E5F4E9]">
                  <img
                    src={culture.image}
                    alt={`Culture de ${culture.name}`}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>

                <h3 className="mt-4 min-h-[52px] text-xl font-semibold leading-snug text-[#123D2B]">
                  {culture.name}
                </h3>
              </article>
            ))}
          </div>

          {/* Progression et bouton Voir plus */}
          <div className="mt-9 flex flex-col items-center">
            {visibleCultures < 10 ? (
              <button
                type="button"
                onClick={showMoreCultures}
                className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-md bg-[#036A38] px-7 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#0B7950] focus:outline-none focus:ring-2 focus:ring-[#036A38] focus:ring-offset-2"
              >
                Voir plus
                <ChevronDown size={18} />
              </button>
            ) : (
              <p className="font-semibold text-[#036A38]">
                Vous avez découvert nos 10 cultures.
              </p>
            )}

            {/* Échelle de progression sur 10 */}
            <div
              className="mt-5 flex w-full max-w-[430px] flex-wrap items-center justify-center gap-2"
              aria-label={`${visibleCultures} cultures affichées sur 10`}
            >
              {Array.from({ length: 10 }, (_, index) => {
                const number = index + 1;
                const isCurrent = number === visibleCultures;
                const isVisible = number <= visibleCultures;

                return (
                  <span
                    key={number}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${number}${isCurrent ? ", étape actuelle" : ""}`}
                    className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-bold transition ${
                      isCurrent
                        ? "border-[#036A38] bg-[#036A38] text-white ring-4 ring-[#E5F4E9]"
                        : isVisible
                          ? "border-[#036A38] bg-[#E5F4E9] text-[#036A38]"
                          : "border-[#DCE9DE] bg-white text-[#475569]"
                    }`}
                  >
                    {number}
                  </span>
                );
              })}
            </div>

            <p className="mt-3 text-sm text-[#475569]">
              {visibleCultures} culture{visibleCultures > 1 ? "s" : ""} affichée
              {visibleCultures > 1 ? "s" : ""} sur 10
            </p>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section
        id="comment-ca-marche"
        className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:py-[84px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[760px]">
            <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#036A38]">
              Simple en quatre étapes
            </span>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[#123D2B] sm:text-4xl lg:text-[44px]">
              Comment ça marche ?
            </h2>

            <p className="mt-3 text-base leading-7 text-[#475569]">
              Quelques étapes simples pour accéder aux outils nécessaires au
              suivi de vos cultures.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((title, index) => (
              <article key={title} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#036A38] text-sm font-bold text-white">
                  {index + 1}
                </div>

                <h3 className="mt-4 text-lg font-bold leading-snug text-[#123D2B]">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#475569]">
                  {
                    [
                      "Inscrivez-vous pour créer votre espace personnel.",
                      "Renseignez votre localisation et les informations de vos cultures.",
                      "Consultez les étapes prévues et les informations météo.",
                      "Importez une photo pour obtenir une analyse et des conseils.",
                    ][index]
                  }
                </p>

                {index < 3 && (
                  <ArrowRight
                    size={21}
                    className="absolute right-0 top-3 hidden text-[#0B7950]/50 lg:block"
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU FINAL */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-xl bg-primary px-6 py-9 sm:px-10 sm:py-11">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] lg:block">
            <img
              src="/images/cultures/feuillage.jpg"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent" />
          </div>

          <div className="relative z-10 max-w-[650px]">
            <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#B7E4C7]">
              Agri-Conseil
            </span>

            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
              Commencez à mieux suivre vos cultures.
            </h2>

            <p className="mt-3 max-w-[540px] text-base leading-7 text-white/85">
              Retrouvez vos outils agricoles dans un espace simple, pratique
              et accessible.
            </p>

            <Link
              to="/inscription"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-bold text-[#036A38] transition hover:bg-[#E5F4E9]"
            >
              Créer mon compte
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
