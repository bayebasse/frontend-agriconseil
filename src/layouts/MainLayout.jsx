import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = ["/dashboard", "/admin", "/acheteur", "/messages", "/transactions"].some((path) =>
    location.pathname.startsWith(path)
  );

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-white text-ink font-sans">
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
