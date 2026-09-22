import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-white text-ink font-sans">
      <Navbar
        user={user}
        menuOpen={menuOpen}
        onToggleMenu={setMenuOpen}
        onLogout={handleLogout}
      />

      {children}

      <Footer />
    </div>
  );
}