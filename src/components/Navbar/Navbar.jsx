
import { Link } from "react-router-dom";
import { House, LogIn, Menu, X } from "lucide-react";

export default function Navbar({
  user,
  menuOpen,
  onToggleMenu,
  onLogout,
}) {
  function closeMenu() {
    onToggleMenu(false);
  }

  const linkClass =
    "whitespace-nowrap text-sm font-medium text-white transition-colors hover:text-white/75";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#00452F] text-white">
      <div className="flex min-h-[52px] w-full items-center px-4 sm:px-6 lg:px-[5%]">
        {/* Menu mobile */}
        <button
          type="button"
          onClick={() => onToggleMenu(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          className="ml-auto flex items-center justify-center bg-transparent p-2 text-white lg:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation pleine largeur */}
        <nav
          className={
            menuOpen
              ? "absolute left-0 right-0 top-[52px] flex flex-col items-stretch gap-1 border-b border-white/10 bg-[#00452F] p-4 shadow-xl lg:static lg:flex lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
              : "hidden flex-1 items-center justify-between gap-5 lg:flex"
          }
        >
          {/* Accueil : icône + texte */}
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Accueil"
            className="flex shrink-0 items-center gap-3 rounded-md px-2 py-2 text-white transition hover:bg-white/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <House size={21} strokeWidth={2} />
            </span>
            <span className={linkClass}>Accueil</span>
          </Link>

          {/* Comment ça marche */}
          <a
            href="/#comment-ca-marche"
            onClick={closeMenu}
            className={linkClass}
          >
            Comment ça marche
          </a>

          {/* Découvrir */}
          <a
            href="/#fonctionnalites"
            onClick={closeMenu}
            className={linkClass}
          >
            Découvrir
          </a>

          {/* Connexion / espace utilisateur */}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={linkClass}
              >
                Mon espace
              </Link>

              <button
                type="button"
                onClick={onLogout}
                className="whitespace-nowrap rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#00452F]"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                onClick={closeMenu}
                className={`inline-flex shrink-0 items-center gap-2 ${linkClass}`}
              >
               {/* <LogIn size={16} /> */}
                Se connecter
              </Link>

              <Link
                to="/inscription"
                onClick={closeMenu}
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#00452F]"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
