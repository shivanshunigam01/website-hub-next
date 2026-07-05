"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, apiPublic } from "@/lib/api";
import type { AuthRole, AuthSession, AuthUser, ProfileUpdateResult } from "@/lib/auth-types";
import { clearWhatsappVerifiedPhone, persistWhatsappVerifiedPhone } from "@/lib/whatsapp-verified-phone";

type Theme = "light" | "dark";

interface AppState {
  role: AuthRole | null;
  user: AuthUser | null;
  theme: Theme;
  loading: boolean;
  profileComplete: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AuthSession>;
  loginWithGoogle: (credential: string, role?: "student" | "teacher") => Promise<AuthSession>;
  setWhatsappSession: (data: AuthSession) => Promise<AuthSession>;
  registerWithPassword: (data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "teacher";
  }) => Promise<AuthSession>;
  requestPasswordReset: (email: string) => Promise<{
    sent?: boolean;
    devResetToken?: string;
    emailError?: string;
    deliveredTo?: string;
  }>;
  resetPassword: (token: string, password: string) => Promise<{ message?: string }>;
  changePassword: (currentPassword: string, password: string) => Promise<{ message?: string }>;
  verifyEmail: (otp: string) => Promise<AuthSession>;
  resendVerificationEmail: () => Promise<{ sent?: boolean; devOtp?: string }>;
  refreshUser: () => Promise<AuthUser | null>;
  updateProfile: (body: Record<string, unknown>) => Promise<ProfileUpdateResult>;
  logout: () => void;
  toggleTheme: () => void;
}

const Ctx = createContext<AppState | null>(null);

const ACCESS_KEY = "tp_access_token";
const REFRESH_KEY = "tp_refresh_token";
const ROLE_KEY = "tp_role";
const USER_KEY = "tp_user";
const THEME_KEY = "tp_theme";

function applyThemeToDocument(next: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  root.dataset.theme = next;
  root.style.colorScheme = next;
}

function persistSession(session: AuthSession) {
  localStorage.setItem(ACCESS_KEY, session.accessToken);
  localStorage.setItem(REFRESH_KEY, session.refreshToken);
  localStorage.setItem(ROLE_KEY, session.user.role);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AuthRole | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  const applyUser = useCallback((u: AuthUser) => {
    setUser(u);
    setRole(u.role);
    setProfileComplete(u.profileComplete ?? false);
    if (typeof window !== "undefined" && localStorage.getItem(ACCESS_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      localStorage.setItem(ROLE_KEY, u.role);
    }
    if (u.theme && !localStorage.getItem(THEME_KEY)) {
      setTheme(u.theme);
      applyThemeToDocument(u.theme);
      localStorage.setItem(THEME_KEY, u.theme);
    }
  }, []);

  const setSession = useCallback(
    (session: AuthSession) => {
      persistSession(session);
      applyUser({ ...session.user, profileComplete: session.profileComplete });
    },
    [applyUser],
  );

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) return null;
    try {
      const me = await api<AuthUser>("/auth/me");
      applyUser(me);
      return me;
    } catch {
      clearSession();
      setUser(null);
      setRole(null);
      return null;
    }
  }, [applyUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const t: Theme = stored === "dark" || stored === "light" ? stored : "light";
    setTheme(t);
    applyThemeToDocument(t);
    if (!stored) localStorage.setItem(THEME_KEY, t);

    const token = localStorage.getItem(ACCESS_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      try {
        applyUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    refreshUser().finally(() => setLoading(false));
  }, [refreshUser, applyUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let restoring = false;
    const restoreSavedTheme = () => {
      if (restoring) return;
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved !== "dark" && saved !== "light") return;
      const root = document.documentElement;
      const isDark = root.classList.contains("dark") || root.dataset.theme === "dark";
      if (
        (saved === "dark") === isDark &&
        root.dataset.theme === saved &&
        root.style.colorScheme === saved
      )
        return;
      restoring = true;
      applyThemeToDocument(saved);
      setTheme(saved);
      queueMicrotask(() => {
        restoring = false;
      });
    };

    // Watch data-theme/style only — GT mutates html.class and caused observer storms.
    const observer = new MutationObserver(restoreSavedTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-theme"],
    });
    let scrollTimer = 0;
    const onScroll = () => {
      if (scrollTimer) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0;
        restoreSavedTheme();
      }, 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("focus", restoreSavedTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focus", restoreSavedTheme);
      if (scrollTimer) window.clearTimeout(scrollTimer);
    };
  }, []);

  const loginWithPassword = async (email: string, password: string) => {
    const data = await apiPublic<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const session: AuthSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profileComplete: data.profileComplete ?? false,
      requiresEmailVerification: data.requiresEmailVerification,
    };
    setSession(session);
    return session;
  };

  const loginWithGoogle = async (credential: string, role?: "student" | "teacher") => {
    const data = await apiPublic<AuthSession>("/auth/google-login", {
      method: "POST",
      body: JSON.stringify({
        credential,
        ...(role ? { role } : {}),
      }),
    });
    const session: AuthSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profileComplete: data.profileComplete ?? false,
      requiresEmailVerification: data.requiresEmailVerification,
      welcomeEmailSent: data.welcomeEmailSent,
    };
    setSession(session);
    return session;
  };

  const setWhatsappSession = async (data: AuthSession) => {
    if (data.user.phone?.trim() || data.user.phoneCountryCode) {
      const e164 = `${(data.user.phoneCountryCode || "+91").replace(/\D/g, "")}${data.user.phone?.replace(/\D/g, "") || ""}`;
      if (e164.length >= 8) persistWhatsappVerifiedPhone(e164);
    }
    const session: AuthSession = {
      user: { ...data.user, provider: data.user.provider ?? "whatsapp" },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profileComplete: data.profileComplete ?? false,
      requiresEmailVerification: data.requiresEmailVerification ?? false,
    };
    setSession(session);
    return session;
  };

  const registerWithPassword = async (payload: {
    name: string;
    email: string;
    password: string;
    role: "student" | "teacher";
  }) => {
    const data = await api<AuthSession>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const session: AuthSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profileComplete: data.profileComplete ?? false,
      requiresEmailVerification: data.requiresEmailVerification,
      verificationEmailSent: data.verificationEmailSent,
      verificationEmailError: data.verificationEmailError,
      devOtp: data.devOtp,
      welcomeEmailSent: data.welcomeEmailSent,
      welcomeEmailError: data.welcomeEmailError,
    };
    setSession(session);
    return session;
  };

  const requestPasswordReset = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return apiPublic<{ sent?: boolean; devResetToken?: string; emailError?: string; deliveredTo?: string }>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      },
    );
  };

  const resetPassword = async (token: string, password: string) => {
    return api<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  };

  const changePassword = async (currentPassword: string, password: string) => {
    return api<{ message?: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, password }),
    });
  };

  const verifyEmail = async (otp: string) => {
    const data = await api<AuthSession>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
    const session: AuthSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profileComplete: data.profileComplete ?? false,
      requiresEmailVerification: false,
      welcomeEmailSent: data.welcomeEmailSent,
    };
    setSession(session);
    return session;
  };

  const resendVerificationEmail = async () => {
    return api<{ sent?: boolean; devOtp?: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({}),
    });
  };

  const updateProfile = async (body: Record<string, unknown>) => {
    const updated = await api<ProfileUpdateResult>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    applyUser(updated);
    return updated;
  };

  const logout = () => {
    clearWhatsappVerifiedPhone();
    clearSession();
    setUser(null);
    setRole(null);
    setProfileComplete(true);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, next);
      const root = document.documentElement;
      // Disable transitions during theme switch to avoid flicker
      const style = document.createElement("style");
      style.appendChild(
        document.createTextNode(
          `*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;}`,
        ),
      );
      document.head.appendChild(style);
      applyThemeToDocument(next);
      // Force reflow, then remove the override on next frame
      void window.getComputedStyle(root).opacity;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => style.remove());
      });
    }
    if (user) {
      updateProfile({ theme: next }).catch(() => {});
    }
  };

  return (
    <Ctx.Provider
      value={{
        role,
        user,
        theme,
        loading,
        profileComplete,
        loginWithPassword,
        loginWithGoogle,
        setWhatsappSession,
        registerWithPassword,
        requestPasswordReset,
        resetPassword,
        changePassword,
        verifyEmail,
        resendVerificationEmail,
        refreshUser,
        updateProfile,
        logout,
        toggleTheme,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
