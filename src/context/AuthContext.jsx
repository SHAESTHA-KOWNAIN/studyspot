import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch((error) => { console.error("Unable to restore the saved session.", error); })
      .finally(() => { if (active) setLoading(false); });
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("studyspot:unauthorized", handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("studyspot:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (values) => {
    const newUser = await authApi.register(values);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isModerator: user?.role === "moderator",
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
