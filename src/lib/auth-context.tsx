"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { UserSession } from "@/types";

interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  isCloudMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    name: string;
    promo: UserSession["promo"];
  }) => Promise<{ error?: string; notice?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Omit<UserSession, "id" | "email" | "provider">>
  ) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_STORAGE_KEY = "ensae_nexus_active_account_v2";

const DEFAULT_FALLBACK_USER: UserSession = {
  id: "stu-demo",
  email: "m.diop@ensae.sn",
  name: "Moussa Diop",
  promo: "ISE2",
  specialty: "Économétrie & Data Science",
  skills: ["Python", "R", "Économétrie"],
  lookingFor: ["Deep Learning", "Frontend"],
  projectIdea: "Tableau de bord prédictif sur les séries macroéconomiques UEMOA.",
  whatsappHandle: "221770001122",
  discordHandle: "moussa.diop#2026",
  availability: "Disponible",
  provider: "server-demo",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const isCloudMode = isSupabaseConfigured();

  const loadSupabaseProfile = useCallback(async (userId: string, email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUser({
        id: userId,
        email: String(data.email ?? email),
        name: String(data.full_name ?? email.split("@")[0]),
        promo: (data.promo as UserSession["promo"]) ?? "ISE 2",
        specialty: String(data.specialty ?? "Statistique & Data Science"),
        skills: Array.isArray(data.skills) ? data.skills : ["Python", "R"],
        lookingFor: Array.isArray(data.looking_for)
          ? data.looking_for
          : ["Économétrie"],
        projectIdea: String(data.project_idea ?? ""),
        whatsappHandle: String(data.whatsapp_handle ?? ""),
        discordHandle: String(data.discord_handle ?? ""),
        availability:
          (data.availability as UserSession["availability"]) ?? "Disponible",
        provider: "supabase",
      });
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      const supabase = getSupabaseClient();
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && active) {
          await loadSupabaseProfile(
            session.user.id,
            session.user.email ?? "etudiant@ensae.sn"
          );
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (newSession?.user) {
            await loadSupabaseProfile(
              newSession.user.id,
              newSession.user.email ?? "etudiant@ensae.sn"
            );
          } else {
            setUser(null);
          }
        });

        if (active) setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      }

      // Fallback serveur local si Supabase n'est pas encore configuré
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved && active) {
          setUser(JSON.parse(saved) as UserSession);
        } else if (active) {
          setUser(DEFAULT_FALLBACK_USER);
        }
      } catch {
        if (active) setUser(DEFAULT_FALLBACK_USER);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, [loadSupabaseProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { error: "Veuillez saisir une adresse email valide (ex: prenom.nom@gmail.com)." };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) return { error: error.message };
      return {};
    }

    // Fallback serveur via /api/students
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const payload = await res.json();
    if (!res.ok) return { error: payload.error || "Échec de connexion." };

    const sessionUser: UserSession = {
      ...payload.student,
      email: cleanEmail,
      provider: "server-demo",
    };
    setUser(sessionUser);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch {
      // ignore
    }
    return {};
  }, []);

  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      name: string;
      promo: UserSession["promo"];
    }) => {
      const cleanEmail = params.email.trim().toLowerCase();
      if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        return { error: "Veuillez saisir une adresse email valide (ex: prenom.nom@gmail.com)." };
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              full_name: params.name.trim(),
              promo: params.promo,
            },
          },
        });
        if (error) return { error: error.message };
        if (!data.session) {
          return {
            notice:
              "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse.",
          };
        }
        return {};
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: params.name.trim(),
          promo: params.promo,
        }),
      });
      const payload = await res.json();
      if (!res.ok) return { error: payload.error || "Erreur d'inscription." };

      const sessionUser: UserSession = {
        ...payload.student,
        email: cleanEmail,
        provider: "server-demo",
      };
      setUser(sessionUser);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
      } catch {
        // ignore
      }
      return {};
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Omit<UserSession, "id" | "email" | "provider">>
    ) => {
      if (!user) return { error: "Aucune session active." };

      const merged: UserSession = { ...user, ...updates };
      const supabase = getSupabaseClient();

      if (supabase && user.provider === "supabase") {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: merged.name,
            promo: merged.promo,
            specialty: merged.specialty,
            skills: merged.skills,
            looking_for: merged.lookingFor,
            project_idea: merged.projectIdea,
            whatsapp_handle: merged.whatsappHandle,
            discord_handle: merged.discordHandle,
            availability: merged.availability,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) return { error: error.message };
        setUser(merged);
        return {};
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      if (!res.ok) {
        return { error: "Erreur lors de la sauvegarde du profil." };
      }
      setUser(merged);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return {};
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudMode,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return ctx;
}
