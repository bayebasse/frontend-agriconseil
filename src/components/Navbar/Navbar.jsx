
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

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
    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-white">
      <div className="relative mx-auto flex min-h-[72px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="Agri-Conseil, accueil"
          className="flex shrink-0 items-center gap-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
        >
          <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
            Agri-Conseil
          </span>
        </Link>

        <button
          type="button"
          onClick={() => onToggleMenu(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <nav
          aria-label="Navigation principale"
          className={
            menuOpen
              ? "absolute left-0 right-0 top-full flex flex-col items-stretch gap-1 border-b border-white/10 bg-primary px-4 pb-4 pt-2 shadow-xl sm:px-6 lg:static lg:ml-auto lg:flex lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
              : "ml-auto hidden items-center gap-1 lg:flex"
          }
        >
          <Link
            to="/"
            onClick={closeMenu}
            className={linkClass}
          >
            Accueil
          </Link>

          <a
            href="/#comment-ca-marche"
            onClick={closeMenu}
            className={linkClass}
          >
            Comment ça marche
          </a>

          <a
            href="/#fonctionnalites"
            onClick={closeMenu}
            className={linkClass}
          >
            Découvrir
          </a>

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
                className="whitespace-nowrap rounded-lg border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-primary"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                onClick={closeMenu}
                className={linkClass}
              >
                Se connecter
              </Link>

              <Link
                to="/inscription"
                onClick={closeMenu}
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#D4E7A5] px-4 py-2 text-sm font-bold text-[#123B2C] transition hover:bg-white"
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
