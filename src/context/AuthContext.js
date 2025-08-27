"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token and user from localStorage on first load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("authUser");

      if (savedToken) setToken(savedToken);
      if (savedUser && savedUser !== "undefined")
        setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error("❌ Error restoring auth from localStorage:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  const role = user?.role || "user";
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{ token, user, role, isAdmin, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
