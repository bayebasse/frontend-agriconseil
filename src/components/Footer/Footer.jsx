import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="scroll-mt-24 bg-primary px-5 pt-10 text-white sm:px-8 lg:px-[6%] lg:pt-12"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 pb-9 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:gap-10 lg:pb-10">

        {/* Présentation */}
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Agriculture et conseils
          </h3>

          <p className="mt-4 max-w-[340px] text-sm leading-6 text-white/75">
            Des outils et des conseils pour accompagner les agriculteurs au Sénégal.
          </p>
        </div>

        {/* Plateforme */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-white">
            Plateforme
          </h4>

          <ul className="space-y-2.5 text-sm leading-6 text-white/75">
            <li>
              <Link to="/" className="transition hover:text-white">
                Accueil
              </Link>
            </li>
            <li>
              <a
                href="/#comment-ca-marche"
                className="transition hover:text-white"
              >
                Comment ça marche
              </a>
            </li>
            <li>
              <a
                href="/#fonctionnalites"
                className="transition hover:text-white"
              >
                Découvrir Agri-Conseil
              </a>
            </li>
          </ul>
        </div>

        {/* Services agricoles */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-white">
            Services agricoles
          </h4>

          <ul className="space-y-2.5 text-sm leading-6 text-white/75">
            <li>
              <a
                href="/#fonctionnalites"
                className="transition hover:text-white"
              >
                Calendrier agricole
              </a>
            </li>
            <li>
              <a
                href="/#fonctionnalites"
                className="transition hover:text-white"
              >
                Météo localisée
              </a>
            </li>
            <li>
              <a
                href="/#fonctionnalites"
                className="transition hover:text-white"
              >
                Analyse des plantes par photo
              </a>
            </li>
          </ul>
        </div>

        {/* Ressources */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-white">
            Ressources
          </h4>

          <ul className="space-y-2.5 text-sm leading-6 text-white/75">
            <li>
              <Link
                to="/connexion"
                className="transition hover:text-white"
              >
                Se connecter
              </Link>
            </li>
            <li>
              <Link
                to="/inscription"
                className="transition hover:text-white"
              >
                Créer un compte
              </Link>
            </li>
            <li>
              <Link
                to="/inscription"
                className="transition hover:text-white"
              >
                Publier votre récolte
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas du footer */}
      <div className="mx-auto max-w-[1400px] border-t border-white/15 py-5 text-center text-xs leading-6 text-white/70 sm:text-sm">
        <p>
          © {new Date().getFullYear()} Agri-Conseil
          <span className="mx-2 text-white/40">|</span>
          <Link
            to="/politique-confidentialite"
            className="underline underline-offset-4 transition hover:text-white"
          >
            Politique de confidentialité
          </Link>
        </p>

        <p className="mt-1 text-xs text-white/50">
          Les recommandations agricoles constituent une aide à la décision.
        </p>
      </div>
    </footer>
  );
}