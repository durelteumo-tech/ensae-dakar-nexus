"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Check,
  Copy,
  Download,
  FolderKanban,
  FolderPlus,
  LogIn,
  Plus,
  Star,
  Users,
} from "lucide-react";
import type { ActivityItem, ResourceItem, StudentGroup } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { ENSAE_PROMOS, ENSAE_SUBJECTS } from "@/lib/constants";
import { IMG } from "@/lib/images";

interface PersonalDashboardProps {
  activities: ActivityItem[];
  resources: ResourceItem[];
  initialGroups: StudentGroup[];
}

export function PersonalDashboard({
  resources,
  initialGroups,
}: PersonalDashboardProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudentGroup[]>(initialGroups);
  const [groupMode, setGroupMode] = useState<"create" | "join">("create");

  const [groupName, setGroupName] = useState("");
  const [groupSubject, setGroupSubject] = useState<string>(ENSAE_SUBJECTS[0]);
  const [groupPromo, setGroupPromo] = useState<string>(user?.promo ?? "ISE2");
  const [joinCode, setJoinCode] = useState("");

  const [groupStatus, setGroupStatus] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/groups", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.groups)) {
          setGroups(data.groups);
        }
      })
      .catch(() => {});
  }, []);

  const currentName = user?.name || "Étudiant";
  const currentPromo = user?.promo ?? "ISE2";

  // Profile completion ring (exact logic from ensae-hub)
  const filledFields = [
    user?.promo,
    user?.specialty,
    user?.skills?.length,
    user?.projectIdea,
  ].filter(Boolean).length;
  const profilePct = user ? Math.round((filledFields / 4) * 100) : 75;

  const totalDownloads = resources.reduce(
    (sum, r) => sum + (r.downloads || 0),
    0
  );

  const stats = [
    {
      n: "120",
      l: "Karma",
      pastel: "var(--pastel1)",
      tint: "rgb(var(--c-primary))",
      icon: Star,
    },
    {
      n: String(resources.length),
      l: "Ressources partagées",
      pastel: "var(--pastel2)",
      tint: "#5b82ff",
      icon: FolderKanban,
    },
    {
      n: String(totalDownloads),
      l: "Téléchargements reçus",
      pastel: "var(--pastel3)",
      tint: "rgb(var(--c-emerald))",
      icon: Download,
    },
    {
      n: String(groups.length),
      l: "Projets & Groupes",
      pastel: "var(--pastel4)",
      tint: "rgb(var(--c-violet))",
      icon: Users,
    },
  ];

  const shortcuts = [
    {
      t: "Hub de ressources",
      d: "Annales et cours par matière",
      h: "/resources",
      img: IMG.resources,
      icon: FolderKanban,
    },
    {
      t: "Réseau étudiant",
      d: "Trouve des coéquipiers",
      h: "/matchmaking",
      img: IMG.network,
      icon: Users,
    },
    {
      t: "Studio IA",
      d: "QCM, Smart Reader, assistant",
      h: "/qcm",
      img: IMG.ai,
      icon: BrainCircuit,
    },
  ];

  async function handleCreateGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setIsSubmitting(true);
    setGroupStatus(null);
    setGroupError(null);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: groupName.trim(),
          subject: groupSubject,
          promo: groupPromo,
          memberName: currentName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGroupError(data.error || "Erreur lors de la création.");
        return;
      }
      if (Array.isArray(data.groups)) {
        setGroups(data.groups);
      }
      setGroupName("");
      setGroupStatus(
        `Groupe "${data.group?.name}" créé (code : ${data.group?.code}).`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoinGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsSubmitting(true);
    setGroupStatus(null);
    setGroupError(null);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          code: joinCode.trim(),
          memberName: currentName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGroupError(data.error || "Code introuvable.");
        return;
      }
      if (Array.isArray(data.groups)) {
        setGroups(data.groups);
      }
      setJoinCode("");
      setGroupStatus(`Vous avez rejoint "${data.group?.name}".`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyCode(grp: StudentGroup) {
    navigator.clipboard?.writeText(grp.code).catch(() => {});
    setCopiedCodeId(grp.id);
    setTimeout(() => setCopiedCodeId(null), 1600);
  }

  return (
    <div className="space-y-5">
      {/* HERO avec image de fond + voile (exact style ensae-hub) */}
      <section
        className="relative overflow-hidden rounded-[20px] shadow-sm"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(10,12,20,.80), rgba(10,12,20,.38)), url(${IMG.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-6 px-7 py-8 sm:px-8">
          <div className="max-w-md text-white">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
              Bonjour {currentName}
            </h1>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-white/85">
              {currentPromo} — Prêt à apprendre et collaborer aujourd&apos;hui ?
              Voici où tu en es.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/resources"
                className="minuto-btn inline-flex min-h-[40px] items-center rounded-full px-5 py-2 text-xs font-bold"
              >
                Explorer les ressources
              </Link>
              <Link
                href="/discussion"
                className="tactile-btn inline-flex min-h-[40px] items-center rounded-full border border-white/30 bg-white/15 px-5 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/25"
              >
                Mes projets &amp; salons
              </Link>
            </div>
          </div>

          <Link
            href="/account"
            className="tactile-card flex items-center gap-4 rounded-2xl border border-white/20 bg-white/12 px-5 py-4 backdrop-blur-md"
          >
            <div
              className="completion-ring"
              style={{ ["--p" as string]: profilePct }}
            >
              <span className="completion-ring-inner font-mono text-ink">
                {profilePct}%
              </span>
            </div>
            <div className="text-white">
              <div className="font-display text-sm font-bold text-white">
                Profil complété
              </div>
              <div className="max-w-[150px] text-xs text-white/80">
                {profilePct < 100
                  ? "Complète-le pour le matchmaking."
                  : "Profil complet."}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4 STATS PASTEL (exact layout ensae-hub) */}
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.l}
              className="tactile-card rounded-[20px] border border-hairline bg-panel p-5"
            >
              <div
                className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: s.pastel }}
              >
                <Icon className="h-5 w-5" style={{ color: s.tint }} />
              </div>
              <div className="font-display text-3xl font-extrabold tabular-nums text-ink">
                {s.n}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-ink-muted">
                {s.l}
              </div>
            </div>
          );
        })}
      </section>

      {/* 3 RACCOURCIS avec image de fond (exact layout ensae-hub) */}
      <section className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {shortcuts.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.h} href={c.h} className="group block">
              <div
                className="tactile-card relative flex min-h-[155px] flex-col justify-end overflow-hidden rounded-[20px] p-5"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(10,12,20,.25), rgba(10,12,20,.82)), url(${c.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="mb-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="font-display text-base font-bold text-white">
                  {c.t}
                </div>
                <div className="text-xs text-white/80">{c.d}</div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Créer ou rejoindre un groupe (directement accessible sur l'accueil) */}
      <section className="rounded-[20px] border border-hairline bg-panel p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
          <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <FolderPlus className="h-4 w-4 text-telemetry" />
            <span>Créer ou rejoindre un groupe</span>
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-panel-raised p-1">
            <button
              type="button"
              onClick={() => {
                setGroupMode("create");
                setGroupError(null);
                setGroupStatus(null);
              }}
              className={`flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                groupMode === "create"
                  ? "bg-panel text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Créer
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupMode("join");
                setGroupError(null);
                setGroupStatus(null);
              }}
              className={`flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                groupMode === "join"
                  ? "bg-panel text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              Rejoindre (code)
            </button>
          </div>
        </div>

        {groupError ? (
          <div className="mt-3 rounded-xl border border-signal-rose/40 bg-signal-rose/10 px-3 py-2 text-xs text-signal-rose">
            {groupError}
          </div>
        ) : null}

        {groupStatus ? (
          <div className="mt-3 rounded-xl border border-volt/40 bg-volt/10 px-3 py-2 text-xs font-medium text-volt">
            {groupStatus}
          </div>
        ) : null}

        {groupMode === "create" ? (
          <form
            onSubmit={handleCreateGroup}
            className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end"
          >
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                Nom du groupe
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Révision Économétrie ISE2"
                className="w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                Matière
              </label>
              <select
                value={groupSubject}
                onChange={(e) => setGroupSubject(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-obsidian px-2.5 py-2 text-xs text-ink outline-none focus:border-telemetry"
              >
                {ENSAE_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <select
                value={groupPromo}
                onChange={(e) => setGroupPromo(e.target.value)}
                aria-label="Classe"
                className="rounded-xl border border-hairline bg-obsidian px-2.5 py-2 text-xs text-ink outline-none focus:border-telemetry"
              >
                {ENSAE_PROMOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isSubmitting}
                className="minuto-btn flex-1 rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Créer"}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleJoinGroup}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Code d'invitation (ex: ENSAE-PNL2)"
              className="flex-1 rounded-xl border border-hairline bg-obsidian px-3.5 py-2 font-mono text-sm uppercase text-ink outline-none focus:border-telemetry"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="minuto-btn rounded-full px-6 py-2 text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Vérification..." : "Rejoindre"}
            </button>
          </form>
        )}

        <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-hairline pt-4 md:grid-cols-2">
          {groups.map((grp) => {
            const isCopied = copiedCodeId === grp.id;
            return (
              <div
                key={grp.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-obsidian px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink">
                    {grp.name}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {grp.subject} • {grp.promo} • {grp.members.length} membre(s)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyCode(grp)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-hairline bg-panel px-2.5 py-1 font-mono text-xs font-semibold text-telemetry hover:bg-panel-raised"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 text-volt" />
                      <span className="text-volt">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>{grp.code}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
