// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiSignup, apiMe } from "../api/auth";
import { setToken, getToken, removeToken, decodeToken, isTokenExpired } from "../utils/jwtHelper";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Bootstrap user from localStorage token
  useEffect(() => {
    const init = async () => {
      const t = getToken();
      if (t && !isTokenExpired(t)) {
        setTok(t);
        try {
          // Fetch user from /me endpoint
          const data = await apiMe(); // returns { user }
          const fetchedUser = data.user;
          if (fetchedUser) {
            // Ensure role exists
            setUser({
              role: "user", // default fallback
              ...fetchedUser,
            });
          } else {
            throw new Error("User not found");
          }
        } catch {
          // fallback to decoded token claims
          const claims = decodeToken(t);
          if (claims) {
            setUser({
              id: claims.sub,
              email: claims.email,
              first_name: claims.first_name || "",
              last_name: claims.last_name || "",
              role: claims.role || "user", // fallback role
            });
          } else {
            removeToken(); // invalid token
          }
        }
      } else {
        removeToken(); // expired or missing token
      }
      setLoading(false);
    };

    init();

    // Global 401 handler
    const handleUnauthorized = () => logout(false); // don't redirect immediately
    window.addEventListener("gi-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("gi-unauthorized", handleUnauthorized);
  }, []);

  // Login
  const login = async (credentials) => {
    const data = await apiLogin(credentials); // { token, user }
    setTok(data.token);
    setToken(data.token);

    const loggedInUser = data.user;
    setUser({
      role: "user", // default fallback
      ...loggedInUser,
    });

    return loggedInUser;
  };

  // Signup
  const signup = async (payload) => {
    const data = await apiSignup(payload); // { token, user }
    setTok(data.token);
    setToken(data.token);

    const newUser = data.user;
    setUser({
      role: "user", // default fallback
      ...newUser,
    });

    return newUser;
  };

  // Logout
  const logout = (redirect = true) => {
    removeToken();
    setTok(null);
    setUser(null);
    if (redirect) window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      token,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin", // convenient helper
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
