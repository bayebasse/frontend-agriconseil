import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import { clearFarmerMessagingAccess } from "../utils/farmerMessagingAccess";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("agri_token")) {
      setLoading(false);
      return;
    }

    authService
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("agri_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(form) {
    const authenticatedUser = await authService.login(form);
    setUser(authenticatedUser);
    return authenticatedUser;
  }

  async function register(form) {
    return authService.register(form);
  }

  const logout = useCallback(async () => {
    clearFarmerMessagingAccess(user);
    await authService.logout();
    setUser(null);
  }, [user]);

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    clearFarmerMessagingAccess(user);
    localStorage.removeItem("agri_token");
    setUser(null);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      deleteAccount,
      setUser,
    }),
    [user, loading, logout, deleteAccount]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
}
