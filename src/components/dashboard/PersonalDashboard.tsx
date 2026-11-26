"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  Copy,
  Download,
  FolderPlus,
  LogIn,
  MessageSquare,
  Plus,
  UploadCloud,
  Users,
} from "lucide-react";
import type { ActivityItem, ResourceItem, StudentGroup } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { ENSAE_PROMOS, ENSAE_SUBJECTS } from "@/lib/constants";
import { NeonBadge } from "@/components/ui/NeonBadge";

const ACTIVITY_LABELS: Record<ActivityItem["type"], string> = {
  qcm: "QCM",
  upload: "Dépôt",
  download: "Téléchargement",
  match: "Groupe",
};

interface PersonalDashboardProps {
  activities: ActivityItem[];
  resources: ResourceItem[];
  initialGroups: StudentGroup[];
}

export function PersonalDashboard({
  activities,
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

  const currentName = user?.name ?? "Moussa Diop";
  const currentPromo = user?.promo ?? "ISE2";
  const featuredResources = resources.slice(0, 3);

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
    <div className="space-y-10">
      {/* Personal Welcome + Personal Telemetry */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-4 lg:col-span-7">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            Mon Espace — {currentName}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-ink-muted">
            {user
              ? `${user.promo} • ${user.specialty}`
              : "Promotion ISE2 • Centralisez vos groupes d'étude, vos fichiers et vos révisions QCM."}
          </p>

          {user?.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-panel-raised px-2.5 py-1 text-xs font-medium text-ink"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/qcm"
              className="tactile-btn inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-telemetry px-4 py-2 text-sm font-semibold text-primary-ink hover:opacity-90"
            >
              <BrainCircuit className="h-4 w-4" />
              Générer un QCM
            </Link>
            <Link
              href="/resources"
              className="tactile-btn inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-hairline bg-panel px-4 py-2 text-sm font-semibold text-ink hover:bg-panel-raised"
            >
              <UploadCloud className="h-4 w-4 text-telemetry" />
              Déposer une ressource
            </Link>
            <Link
              href="/discussion"
              className="tactile-btn inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-hairline bg-panel px-4 py-2 text-sm font-semibold text-ink hover:bg-panel-raised"
            >
              <MessageSquare className="h-4 w-4 text-telemetry" />
              Discussion
            </Link>
          </div>
        </div>

        {/* Personal Summary */}
        <dl className="tactile-card divide-y divide-hairline rounded-xl border border-hairline bg-panel lg:col-span-5">
          <div className="flex items-center justify-between px-4 py-3.5">
            <dt className="text-sm font-medium text-ink-muted">Ma promotion</dt>
            <dd className="font-mono text-sm font-semibold text-telemetry">
              {currentPromo}
            </dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <dt className="text-sm font-medium text-ink-muted">Mes groupes</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-ink">
              {String(groups.length).padStart(2, "0")}
            </dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <dt className="text-sm font-medium text-ink-muted">
              Ma moyenne QCM
            </dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-volt">
              89.4%
            </dd>
          </div>
        </dl>
      </section>

      {/* Main Workspace: Left Personal Activity & Resources | Right Prominent Group Creator/Joiner */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Right/Top Priority on Mobile: Create or Join a Group */}
        <div className="order-first space-y-5 lg:order-last lg:col-span-5">
          <div className="tactile-card rounded-xl border border-telemetry/40 bg-panel p-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <span className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <FolderPlus className="h-4 w-4 text-telemetry" />
                Groupes de travail
              </span>
              <span className="rounded-md bg-telemetry/12 px-2 py-0.5 text-xs font-semibold text-telemetry">
                {groups.length} actif(s)
              </span>
            </div>

            {/* Segmented Control: Create vs Join */}
            <div className="mt-4 grid grid-cols-2 rounded-lg bg-panel-raised p-1">
              <button
                type="button"
                onClick={() => {
                  setGroupMode("create");
                  setGroupError(null);
                  setGroupStatus(null);
                }}
                className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition ${
                  groupMode === "create"
                    ? "bg-panel text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Créer un groupe
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupMode("join");
                  setGroupError(null);
                  setGroupStatus(null);
                }}
                className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition ${
                  groupMode === "join"
                    ? "bg-panel text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                Rejoindre (code)
              </button>
            </div>

            {groupError ? (
              <div className="mt-3 rounded-lg border border-signal-rose/40 bg-signal-rose/10 px-3 py-2 text-xs text-signal-rose">
                {groupError}
              </div>
            ) : null}

            {groupStatus ? (
              <div className="mt-3 rounded-lg border border-volt/40 bg-volt/10 px-3 py-2 text-xs font-medium text-volt">
                {groupStatus}
              </div>
            ) : null}

            {groupMode === "create" ? (
              <form onSubmit={handleCreateGroup} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">
                    Nom du nouveau groupe
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ex: Révision Économétrie ISE2"
                    className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">
                      Matière
                    </label>
                    <select
                      value={groupSubject}
                      onChange={(e) => setGroupSubject(e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-obsidian px-2.5 py-2 text-xs text-ink outline-none focus:border-telemetry"
                    >
                      {ENSAE_SUBJECTS.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">
                      Classe
                    </label>
                    <select
                      value={groupPromo}
                      onChange={(e) => setGroupPromo(e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-obsidian px-2.5 py-2 text-xs text-ink outline-none focus:border-telemetry"
                    >
                      {ENSAE_PROMOS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tactile-btn flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-telemetry px-4 py-2 text-sm font-semibold text-primary-ink hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Création..." : "Créer le groupe"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinGroup} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">
                    Code d&apos;invitation du groupe
                  </label>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Ex: ENSAE-PNL2"
                    className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 font-mono text-sm uppercase text-ink outline-none focus:border-telemetry"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tactile-btn flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-telemetry px-4 py-2 text-sm font-semibold text-primary-ink hover:opacity-90 disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  {isSubmitting ? "Vérification..." : "Insérer / Rejoindre"}
                </button>
              </form>
            )}

            {/* Personal Groups List */}
            <div className="mt-5 space-y-2.5 border-t border-hairline pt-4">
              <div className="text-xs font-semibold text-ink-muted">
                Mes groupes
              </div>
              {groups.map((grp) => {
                const isCopied = copiedCodeId === grp.id;
                return (
                  <div
                    key={grp.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-obsidian px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">
                        {grp.name}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {grp.subject} • {grp.promo} •{" "}
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {grp.members.length}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCode(grp)}
                      title="Copier le code du groupe"
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-hairline bg-panel px-2.5 py-1 font-mono text-xs text-telemetry hover:bg-panel-raised"
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
          </div>
        </div>

        {/* Left: Personal Activity + Recent Resources */}
        <div className="space-y-8 lg:col-span-7">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">
                Mon activité récente
              </h2>
              <Link
                href="/account"
                className="inline-flex items-center gap-1 text-xs font-medium text-telemetry hover:underline"
              >
                Modifier mon profil <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-hairline rounded-xl border border-hairline bg-panel">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex flex-col justify-between gap-2 px-4 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-panel-raised px-2 py-0.5 text-xs font-semibold text-ink-muted">
                        {ACTIVITY_LABELS[act.type]}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {act.title}
                      </span>
                      {act.badge === "100% Validé" ||
                      act.badge === "Vérifié Club Info" ? (
                        <NeonBadge label={act.badge} />
                      ) : null}
                    </div>
                    <p className="text-xs text-ink-muted">{act.detail}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">
                Mes dernières ressources consultées
              </h2>
              <Link
                href="/resources"
                className="text-xs font-medium text-telemetry hover:underline"
              >
                Tout afficher
              </Link>
            </div>

            <div className="divide-y divide-hairline rounded-xl border border-hairline bg-panel">
              {featuredResources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-panel-raised px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                        {res.fileType}
                      </span>
                      <span className="truncate text-sm font-semibold text-ink">
                        {res.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {res.subject} • {res.promo}
                    </p>
                  </div>
                  <Link
                    href="/resources"
                    className="tactile-btn inline-flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-obsidian px-3 py-1 text-xs font-medium text-ink hover:bg-panel-raised"
                  >
                    <Download className="h-3.5 w-3.5 text-telemetry" />
                    Ouvrir
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
