import { createContext, useContext, useEffect, useState } from "react";
import { getSessionProfile, clearSessionProfile } from "../lib/localStore";
import { clearToken } from "../lib/auth";

const AuthContext = createContext({
  me: null,
  isLoading: true,
  signOut: () => {},
  refreshProfile: () => {},
});

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  function refreshProfile() {
    const profile = getSessionProfile();
    setMe(profile ?? null);
    setIsLoading(false);
  }

  useEffect(() => {
    refreshProfile();
    window.addEventListener("focus", refreshProfile);
    window.addEventListener("storage", refreshProfile);
    return () => {
      window.removeEventListener("focus", refreshProfile);
      window.removeEventListener("storage", refreshProfile);
    };
  }, []);

  function signOut() {
    clearToken();
    clearSessionProfile();
    setMe(null);
  }

  return (
    <AuthContext.Provider value={{ me, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
