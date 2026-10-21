import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  CloudSun,
  History,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import CalendarReminderCenter from "../components/CalendarReminderCenter/CalendarReminderCenter";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = ["/dashboard", "/admin", "/acheteur", "/messages", "/transactions"].some((path) =>
    location.pathname.startsWith(path)
  ) || (user?.role === "farmer" && location.pathname.startsWith("/culture/nouvelle"));
  const isFarmerWorkspace = user?.role === "farmer" && isWorkspace;
  const farmerMenuItems = [
    ["overview", "Vue d'ensemble", LayoutDashboard],
    ["cultures", "Mes cultures", Leaf],
    ["calendar", "Calendrier", CalendarDays],
    ["weather", "Météo", CloudSun],
    ["ai", "Assistant IA", Sparkles],
    ["history", "Historiques", History],
    ["buyers", "Mes acheteurs", MessageCircle],
    ["orders", "Mes commandes", ClipboardList],
  ];

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  function openFarmerSection(section) {
    navigate("/dashboard", { state: { dashboardSection: section } });
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-white text-ink font-sans">
      {isFarmerWorkspace && (
        <>
        <header className="sticky top-0 z-50 border-b border-earth bg-white shadow-sm">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <span className="font-display text-lg font-bold text-primary sm:text-xl">
              Agri-Conseil
            </span>
            <nav
              aria-label="Menu agriculteur"
              className="fixed inset-x-0 bottom-0 z-[70] flex h-16 w-full items-center justify-between border-t border-earth bg-white/95 px-4 shadow-[0_-4px_16px_rgba(31,31,27,0.08)] backdrop-blur lg:static lg:ml-auto lg:h-auto lg:w-auto lg:justify-start lg:gap-4 lg:border-0 lg:bg-transparent lg:px-0 lg:shadow-none lg:backdrop-blur-none lg:z-auto"
            >
              <div className="order-2 lg:order-1">
                <CalendarReminderCenter
                  key={user?.id || user?.username || "farmer"}
                  userId={user?.id || user?.username || "farmer"}
                />
              </div>
              <div className="order-1 flex items-center gap-1 lg:order-2 lg:gap-4">
                <button
                  type="button"
                  onClick={() => openFarmerSection("profile")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-soft hover:text-primary lg:px-4"
                >
                  <UserRound size={18} aria-hidden="true" />
                  <span>Mon profil</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                  className="hidden h-11 w-11 items-center justify-center rounded-full border border-earth bg-white text-muted shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 lg:inline-flex lg:h-11 lg:w-auto lg:gap-2 lg:rounded-xl lg:px-4 lg:text-sm lg:font-semibold lg:text-ink lg:shadow-none"
                >
                  <LogOut size={18} aria-hidden="true" />
                  <span className="hidden lg:inline">Se déconnecter</span>
                </button>
              </div>
            </nav>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary transition hover:bg-soft lg:hidden"
            >
              {menuOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
            </button>
          </div>
          {menuOpen && (
            <nav aria-label="Navigation de l’espace agriculteur" className="absolute inset-x-0 top-full z-50 grid max-h-[calc(100dvh-5rem)] gap-1 overflow-y-auto border-t border-earth bg-white p-3 shadow-lg lg:hidden">
              {farmerMenuItems.map(([section, label, Icon]) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => openFarmerSection(section)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-soft hover:text-primary"
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </nav>
          )}
        </header>
        </>
      )}

      {!isWorkspace ? (
        <Navbar
          user={user}
          menuOpen={menuOpen}
          onToggleMenu={setMenuOpen}
          onLogout={handleLogout}
        />
      ) : null}

      {children}

      {!isWorkspace ? <Footer /> : null}
    </div>
  );
}
