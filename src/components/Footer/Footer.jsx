import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="scroll-mt-24 bg-primary px-0 py-[70px] text-white lg:py-[92px]"
    >
      <div className="mx-auto grid w-[calc(100%-24px)] max-w-[1180px] grid-cols-1 gap-10 lg:w-[calc(100%-36px)] lg:grid-cols-[2.2fr_1fr_1fr] lg:gap-14">
        <div className="min-h-0 lg:min-h-[170px]">
          <div className="flex items-center gap-2.5 font-bold">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white text-primary">
              <Leaf size={19} />
            </span>

            <span>Agri-Conseil</span>
          </div>

          <p className="mt-5 max-w-[420px] text-base leading-7 text-soft lg:text-[17px]">
            Votre agriculture, guidée par la bonne information.
          </p>
        </div>

        <div className="min-h-0 lg:min-h-[170px]">
          <h4 className="mb-5 text-base font-bold tracking-wide">
            Plateforme
          </h4>

          <div className="space-y-3">
            <Link
              to="/"
              className="block text-white transition hover:text-soft"
            >
              Accueil
            </Link>

            <Link
              to="/dashboard"
              className="block text-white transition hover:text-soft"
            >
              Mon espace
            </Link>
          </div>
        </div>

        <div className="min-h-0 lg:min-h-[170px]">
          <h4 className="mb-5 text-base font-bold tracking-wide">
            Fonctionnalités
          </h4>

          <div className="space-y-3">
            <a
              href="/#fonctionnalites"
              className="block text-white transition hover:text-soft"
            >
              Calendrier
            </a>

            <a
              href="/#fonctionnalites"
              className="block text-white transition hover:text-soft"
            >
              Météo
            </a>

            <a
              href="/#fonctionnalites"
              className="block text-white transition hover:text-soft"
            >
              IA
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 w-[calc(100%-24px)] max-w-[1180px] border-t border-soft/50 pt-8 text-sm leading-6 text-soft lg:mt-16 lg:w-[calc(100%-36px)]">
        © {new Date().getFullYear()} Agri-Conseil · Les recommandations
        constituent une aide à la décision.
      </div>
    </footer>
  );
}