"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api";

interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin?: boolean;
}

export type LoginResult =
  | { status: "ok"; user: User }
  | { status: "admin_otp_required"; email: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyAdminLogin: (email: string, otp: string) => Promise<User>;
  register: (email: string, full_name: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persistSession = (access_token: string, userData: User) => {
    setToken(access_token);
    setUser(userData);
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const res = await authApi.login(email, password);
    if (res.data?.admin_otp_required) {
      return { status: "admin_otp_required", email: res.data.email };
    }
    const { access_token, user: userData } = res.data;
    persistSession(access_token, userData);
    return { status: "ok", user: userData };
  };

  const verifyAdminLogin = async (email: string, otp: string): Promise<User> => {
    const res = await authApi.verifyAdminLogin(email, otp);
    const { access_token, user: userData } = res.data;
    persistSession(access_token, userData);
    return userData;
  };

  const register = async (email: string, full_name: string, password: string) => {
    const res = await authApi.register({ email, full_name, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, verifyAdminLogin, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
