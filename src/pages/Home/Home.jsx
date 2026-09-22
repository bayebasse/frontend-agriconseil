import {
  CalendarDays,
  Camera,
  CloudSun,
  Leaf,
  MapPin,
  Sprout,
} from "lucide-react";

import { Link } from "react-router-dom";

const features = [
  {
    icon: CalendarDays,
    title: "Calendrier agricole intelligent",
    text: "Culture + date de semis : le stade est calculé automatiquement et les opérations sont organisées.",
  },
  {
    icon: CloudSun,
    title: "Météo locale & conseil hydrique",
    text: "Commune/localité → coordonnées géographiques → météo locale → conseil adapté.",
  },
  {
    icon: Camera,
    title: "Analyse IA des plantes",
    text: "Prenez ou importez une photo pour obtenir une analyse et une orientation agronomique.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="bg-sand px-0 py-14 sm:py-16 lg:py-[88px]">
        <div className="mx-auto grid w-[calc(100%-24px)] max-w-[1180px] items-center gap-12 lg:w-[calc(100%-36px)] lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Agriculture sénégalaise · aide à la décision
            </span>

            <h1 className="mt-5 max-w-[720px] font-display text-[40px] font-medium leading-[1.05] tracking-[-0.045em] text-ink sm:text-[48px] lg:text-[62px]">
              Votre agriculture, guidée par la bonne information.
            </h1>

            <p className="mt-5 max-w-[650px] text-base leading-7 text-muted sm:text-lg">
              Un calendrier agricole intelligent, une météo locale, des
              conseils hydriques et une assistance IA pour mieux suivre vos
              cultures.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/inscription"
                className="inline-flex items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 font-bold text-white transition hover:opacity-90"
              >
                Commencer maintenant
              </Link>

              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center rounded-md border border-primary bg-transparent px-5 py-3 font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                Découvrir les fonctionnalités
              </a>
            </div>
          </div>

          <div className="relative h-[360px] overflow-hidden rounded-[10px] border border-earth bg-white sm:h-[420px] lg:h-[460px]">
            <div className="absolute right-[12%] top-[11%] h-[85px] w-[85px] rounded-full bg-earth sm:h-[105px] sm:w-[105px]" />

            <div className="absolute -bottom-[1%] -left-[10%] -right-[10%] h-[62%] skew-y-[-4deg] border-t-[14px] border-primary bg-soft sm:border-t-[16px]" />

            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-lg bg-white px-4 py-4 shadow-lg">
              <Sprout size={24} className="text-primary" />

              <div className="flex flex-col">
                <strong className="text-ink">Agri-Conseil</strong>
                <span className="text-xs text-muted">
                  Culture · météo · conseil
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="scroll-mt-24 px-0 py-16 sm:py-20 lg:py-[90px]"
      >
        <div className="mx-auto w-[calc(100%-24px)] max-w-[1180px] lg:w-[calc(100%-36px)]">
          <div className="mb-9 max-w-[760px]">
            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Les trois piliers
            </span>

            <h2 className="mt-3 font-display text-[36px] font-medium leading-[1.05] tracking-[-0.045em] text-ink sm:text-[42px] lg:text-[46px]">
              Tout ce dont l’agriculteur a besoin, au même endroit.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-lg border border-earth bg-white p-7 shadow-[0_12px_35px_rgba(31,31,27,0.06)]"
              >
                <div className="grid h-[50px] w-[50px] place-items-center rounded-full bg-soft text-primary">
                  <Icon size={25} />
                </div>

                <h3 className="mt-[22px] text-2xl font-semibold leading-tight text-ink">
                  {title}
                </h3>

                <p className="mt-3 text-base leading-7 text-muted lg:min-h-[90px]">
                  {text}
                </p>

                <Link
                  to="/inscription"
                  className="mt-5 inline-block font-extrabold text-primary"
                >
                  Découvrir →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className="scroll-mt-24 bg-sand px-0 py-16 sm:py-20 lg:py-[90px]"
      >
        <div className="mx-auto w-[calc(100%-24px)] max-w-[1180px] lg:w-[calc(100%-36px)]">
          <div className="mb-9 max-w-[760px]">
            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Simple en quatre étapes
            </span>

            <h2 className="mt-3 font-display text-[36px] font-medium leading-[1.05] tracking-[-0.045em] text-ink sm:text-[42px] lg:text-[46px]">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Créez votre culture",
              "Le système calcule votre stade",
              "Consultez météo et conseil",
              "Analysez une plante avec l’IA",
            ].map((title, index) => (
              <div key={title} className="relative">
                <span className="font-extrabold tracking-[0.1em] text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-2 max-w-[190px] text-xl font-semibold leading-snug text-ink">
                  {title}
                </h3>

                {index < 3 && (
                  <span className="absolute right-0 top-2 hidden text-2xl text-earth lg:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-0 py-16 sm:py-20 lg:py-[90px]">
        <div className="mx-auto grid w-[calc(100%-24px)] max-w-[1180px] gap-8 rounded-[10px] border border-earth bg-white p-6 shadow-[0_12px_35px_rgba(31,31,27,0.06)] sm:p-8 lg:w-[calc(100%-36px)] lg:grid-cols-[1fr_.8fr] lg:p-9">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Exemple météo locale
            </span>

            <h2 className="mt-3 flex items-center gap-2 font-display text-[30px] font-medium tracking-[-0.04em] text-ink sm:text-[34px]">
              <MapPin size={22} className="text-primary" />
              Tivaouane Peulh-Niaga
            </h2>

            <div className="mt-5 font-display text-[64px] font-medium leading-none tracking-[-0.05em] text-ink sm:text-[76px]">
              34°
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted sm:text-base">
              <span>💧 45% humidité</span>
              <span>💨 20 km/h</span>
              <span>🌧️ 15 mm</span>
            </div>
          </div>

          <div className="rounded-lg bg-sand p-6 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-soft px-3 py-1.5 text-xs font-extrabold text-primary">
                Mil
              </span>

              <span className="inline-flex rounded-full bg-soft px-3 py-1.5 text-xs font-extrabold text-primary">
                Développement
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-ink">
              Conseil agricole
            </h3>

            <p className="mt-2 text-base leading-7 text-muted">
              Le conseil combine culture, stade, météo, Kc, ETo et pluie pour
              aider à décider du bon moment d’irriguer.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sand px-0 py-16 sm:py-20">
        <div className="mx-auto flex w-[calc(100%-24px)] max-w-[1180px] flex-col items-start justify-between gap-8 lg:w-[calc(100%-36px)] lg:flex-row lg:items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.11em] text-primary">
              Agri-Conseil
            </span>

            <h2 className="mt-2 font-display text-[34px] font-medium leading-tight tracking-[-0.045em] text-ink sm:text-[38px] lg:text-[42px]">
              Commencez à mieux suivre vos cultures.
            </h2>
          </div>

          <Link
            to="/inscription"
            className="inline-flex items-center justify-center rounded-md border border-white bg-white px-5 py-3 font-bold text-primary transition hover:bg-soft"
          >
            Créer mon compte
          </Link>
        </div>
      </section>
    </main>
  );
}