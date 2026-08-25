"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StaffProfile } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  staff: StaffProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  isReceptionist: boolean;
  isStylist: boolean;
  login: (payload: { identifier: string; credential: string; login_type?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "tarjeel_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.staff) {
          setToken(parsed.token);
          setStaff(parsed.staff);
        }
      }
    } catch (e) {
      console.warn("Failed to parse auth session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: { identifier: string; credential: string; login_type?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(payload);
      setToken(res.token);
      setStaff(res.staff);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: res.token, staff: res.staff }));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setStaff(null);
      setToken(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsLoading(false);
      router.push("/");
    }
  };

  const isOwner = staff?.role === "owner";
  const isReceptionist = staff?.role === "receptionist" || isOwner;
  const isStylist = staff?.role === "stylist" || isOwner;

  return (
    <AuthContext.Provider
      value={{
        staff,
        token,
        isLoading,
        isAuthenticated: !!staff && !!token,
        isOwner,
        isReceptionist,
        isStylist,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
