"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Cloud, LogOut, Save, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ENSAE_PROMOS } from "@/lib/constants";
import type { EnsaePromo, UserSession } from "@/types";

export default function AccountPage() {
  const { user, loading, isCloudMode, signOut, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [promo, setPromo] = useState<EnsaePromo>("ISE2");
  const [specialty, setSpecialty] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [lookingForText, setLookingForText] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [whatsappHandle, setWhatsappHandle] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [availability, setAvailability] =
    useState<UserSession["availability"]>("Disponible");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPromo(user.promo);
      setSpecialty(user.specialty);
      setSkillsText(user.skills.join(", "));
      setLookingForText(user.lookingFor.join(", "));
      setProjectIdea(user.projectIdea);
      setWhatsappHandle(user.whatsappHandle);
      setDiscordHandle(user.discordHandle);
      setAvailability(user.availability);
    }
  }, [user]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const parseTags = (raw: string) =>
      raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const result = await updateProfile({
      name: name.trim(),
      promo,
      specialty: specialty.trim(),
      skills: parseTags(skillsText),
      lookingFor: parseTags(lookingForText),
      projectIdea: projectIdea.trim(),
      whatsappHandle: whatsappHandle.trim(),
      discordHandle: discordHandle.trim(),
      availability,
    });

    setSaving(false);
    if (result.error) {
      setStatusMessage(`Erreur : ${result.error}`);
    } else {
      setStatusMessage(
        "Profil mis à jour et synchronisé avec le Matchmaking."
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-hairline bg-panel p-6 text-sm text-ink-muted">
        Chargement du profil étudiant...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-hairline bg-panel p-8">
        <h1 className="font-display text-2xl font-bold text-ink">
          Aucune session active
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Connectez-vous avec votre compte @ensae.sn pour gérer votre profil et
          apparaître dans le Matchmaking.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-telemetry px-4 py-2 text-xs font-semibold text-primary-ink transition hover:opacity-90"
        >
          Ouvrir le portail de connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Compte &amp; Profil Étudiant
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            <span className="font-mono text-telemetry">{user.email}</span> •{" "}
            {isCloudMode
              ? "Synchronisation Cloud Supabase active"
              : "Mode Serveur Local (ajoutez Supabase dans .env.local pour le cloud)"}
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-signal-rose/40 px-4 py-2 text-xs font-semibold text-signal-rose transition hover:bg-signal-rose hover:text-primary-ink"
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </button>
      </div>

      {statusMessage ? (
        <div className="flex items-center gap-2 rounded-xl border border-volt/40 bg-volt/10 px-4 py-3 text-xs font-medium text-volt">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      ) : null}

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 gap-5 rounded-xl border border-hairline bg-panel p-6 md:grid-cols-2"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">
              Promotion
            </label>
            <select
              value={promo}
              onChange={(e) => setPromo(e.target.value as EnsaePromo)}
              className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
            >
              {ENSAE_PROMOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">
              Disponibilité
            </label>
            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as UserSession["availability"])
              }
              className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
            >
              <option value="Disponible">Disponible</option>
              <option value="En projet">En projet</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Spécialité académique
          </label>
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Ex: Économétrie Spatiale, ML..."
            className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Compétences (séparées par des virgules)
          </label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Python, R, Stata, QGIS"
            className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 font-mono text-xs text-ink outline-none focus:border-telemetry"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Compétences recherchées en binôme
          </label>
          <input
            type="text"
            value={lookingForText}
            onChange={(e) => setLookingForText(e.target.value)}
            placeholder="Deep Learning, Frontend, LaTeX"
            className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 font-mono text-xs text-ink outline-none focus:border-telemetry"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">
              WhatsApp (indicatif)
            </label>
            <input
              type="text"
              value={whatsappHandle}
              onChange={(e) => setWhatsappHandle(e.target.value)}
              placeholder="221770001122"
              className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 font-mono text-xs text-ink outline-none focus:border-telemetry"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">
              Discord
            </label>
            <input
              type="text"
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
              placeholder="pseudo#1234"
              className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 font-mono text-xs text-ink outline-none focus:border-telemetry"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Idée de projet ou sujet de mémoire
          </label>
          <textarea
            rows={3}
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-4 md:col-span-2">
          <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
            {isCloudMode ? (
              <Cloud className="h-4 w-4 text-telemetry" />
            ) : (
              <UserCheck className="h-4 w-4 text-volt" />
            )}
            Visible dans Matchmaking dès l&apos;enregistrement
          </span>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-telemetry px-5 py-2 text-xs font-semibold text-primary-ink transition hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Synchronisation..." : "Enregistrer le profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
