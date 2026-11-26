"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ENSAE_PROMOS } from "@/lib/constants";
import type { EnsaePromo } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, isCloudMode } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promo, setPromo] = useState<EnsaePromo>("ISE2");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsLoading(true);

    if (mode === "signin") {
      const res = await signIn(email, password);
      setIsLoading(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/");
      return;
    }

    if (name.trim().length < 2) {
      setIsLoading(false);
      setError("Veuillez saisir votre nom complet.");
      return;
    }

    const res = await signUp({ email, password, name, promo });
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.notice) {
      setNotice(res.notice);
      return;
    }
    router.push("/account");
  }

  async function handleQuickDemo() {
    setError(null);
    setIsLoading(true);
    const res = await signIn("moussa.diop@gmail.com", "ensae2026");
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-12">
      <div className="w-full max-w-md rounded-[20px] border border-hairline bg-panel p-7 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo_ensae.png"
              alt="Logo ENSAE Dakar"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <div>
              <div className="font-display text-base font-bold text-ink">
                ENSAE Hub
              </div>
              <div className="text-xs text-ink-muted">
                {isCloudMode ? "Connexion Cloud" : "Espace Collaboratif"}
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-panel-raised p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
              setNotice(null);
            }}
            className={`min-h-[34px] rounded-lg text-xs font-bold transition ${
              mode === "signin"
                ? "bg-panel text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setNotice(null);
            }}
            className={`min-h-[34px] rounded-lg text-xs font-bold transition ${
              mode === "signup"
                ? "bg-panel text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">
          {mode === "signin" ? "Se connecter" : "Inscription Étudiant"}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          {mode === "signin"
            ? "Utilisez votre adresse email classique (ex: Gmail) pour accéder à votre espace."
            : "Créez votre profil pour rejoindre les salons et le réseau étudiant."}
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-signal-rose/40 bg-signal-rose/10 p-3 text-xs text-signal-rose"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-volt/40 bg-volt/10 p-3 text-xs text-volt">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-muted">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aminata Ndiaye"
                  className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-muted">
                  Promotion
                </label>
                <select
                  value={promo}
                  onChange={(e) => setPromo(e.target.value as EnsaePromo)}
                  className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
                >
                  {ENSAE_PROMOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple.etudiant@gmail.com"
              className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="minuto-btn flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
          >
            {isLoading ? (
              <span>Traitement en cours...</span>
            ) : mode === "signin" ? (
              <>
                <span>Se connecter</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Créer mon compte</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
          {!isCloudMode ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleQuickDemo}
              className="rounded-xl border border-hairline bg-obsidian px-3 py-1.5 text-xs font-semibold text-telemetry transition hover:bg-panel-raised"
            >
              Accès démo rapide
            </button>
          ) : (
            <span className="text-xs font-medium text-volt">
              Supabase Auth actif
            </span>
          )}

          <Link
            href="/"
            className="text-xs font-semibold text-ink-muted hover:text-ink"
          >
            Retour
          </Link>
        </div>
      </div>
    </div>
  );
}
