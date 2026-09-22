import { Link } from "react-router-dom";
import {
  Leaf,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export default function Navbar({
  user,
  menuOpen,
  onToggleMenu,
  onLogout,
}) {
  function closeMenu() {
    onToggleMenu(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-earth bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[78px] w-[calc(100%-24px)] max-w-[1180px] items-center justify-between lg:w-[calc(100%-36px)]">
        <Link
          to="/"
          onClick={() => closeMenu()}
          className="flex items-center gap-2.5 font-bold text-ink"
        >
          <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-primary text-white">
            <Leaf size={19} />
          </span>

          <span>Agri-Conseil</span>
        </Link>

        <button
          type="button"
          onClick={() => onToggleMenu(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="block border-0 bg-transparent text-primary lg:hidden"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <nav
          className={
            menuOpen
              ? "absolute left-3 right-3 top-[72px] flex flex-col items-start gap-4 rounded-lg border border-earth bg-white p-5 shadow-xl lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
              : "hidden items-center gap-6 lg:flex"
          }
        >
          <a
            href="/#fonctionnalites"
            onClick={closeMenu}
            className="text-sm text-ink transition hover:text-primary"
          >
            Fonctionnalités
          </a>

          <a
            href="/#comment-ca-marche"
            onClick={closeMenu}
            className="text-sm text-ink transition hover:text-primary"
          >
            Comment ça marche
          </a>

          <a
            href="#footer"
            onClick={closeMenu}
            className="text-sm text-ink transition hover:text-primary"
          >
            À propos
          </a>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="text-sm text-ink transition hover:text-primary"
              >
                Mon espace
              </Link>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center rounded-md border border-primary bg-transparent px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                onClick={closeMenu}
                className="inline-flex items-center gap-1.5 text-sm text-ink transition hover:text-primary"
              >
                <LogIn size={16} />
                Se connecter
              </Link>

              <Link
                to="/inscription"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
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