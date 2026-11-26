"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MessageCircle, MessageSquare, Search } from "lucide-react";
import type { StudentProfile } from "@/types";
import { NeonBadge } from "@/components/ui/NeonBadge";

const SKILL_FILTERS = [
  "Tous",
  "Python",
  "R",
  "Économétrie",
  "PyTorch",
  "Stata",
  "Docker",
] as const;

interface MatchmakingBoardProps {
  initialStudents: StudentProfile[];
}

export function MatchmakingBoard({ initialStudents }: MatchmakingBoardProps) {
  const [students, setStudents] = useState<StudentProfile[]>(initialStudents);
  const [selectedSkill, setSelectedSkill] = useState<string>("Tous");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedDiscordId, setCopiedDiscordId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.students)) {
          setStudents(data.students);
        }
      })
      .catch(() => {});
  }, []);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesAvail = !onlyAvailable || s.availability === "Disponible";
      const matchesSkill =
        selectedSkill === "Tous" ||
        s.skills.some((sk) =>
          sk.toLowerCase().includes(selectedSkill.toLowerCase())
        ) ||
        s.lookingFor.some((lf) =>
          lf.toLowerCase().includes(selectedSkill.toLowerCase())
        );
      const matchesQuery =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q) ||
        s.projectIdea.toLowerCase().includes(q);
      return matchesAvail && matchesSkill && matchesQuery;
    });
  }, [students, selectedSkill, onlyAvailable, query]);

  function copyDiscord(student: StudentProfile) {
    navigator.clipboard?.writeText(student.discordHandle).catch(() => {});
    setCopiedDiscordId(student.id);
    setTimeout(() => setCopiedDiscordId(null), 1800);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              Matchmaking Projets
            </h1>
            <NeonBadge label="Vérifié Club Info" />
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">
            Profils recommandés selon la complémentarité de vos compétences
            (Data Science, Économétrie, Développement).
          </p>
        </div>

        <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border border-hairline bg-panel px-3.5 py-2 text-xs font-medium text-ink">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="h-4 w-4 accent-telemetry"
          />
          <span>Disponibles uniquement</span>
        </label>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {SKILL_FILTERS.map((skill) => {
            const active = selectedSkill === skill;
            return (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className={`min-h-[32px] rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-telemetry text-primary-ink"
                    : "border border-hairline bg-panel text-ink-muted hover:bg-panel-raised hover:text-ink"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, spécialité, idée..."
            className="w-full rounded-lg border border-hairline bg-panel py-2 pl-9 pr-3 text-xs text-ink placeholder-ink-muted/60 outline-none focus:border-telemetry"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-panel p-8 text-center text-xs text-ink-muted">
          Aucun profil étudiant ne correspond à ces critères.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const isCopied = copiedDiscordId === student.id;
            return (
              <article
                key={student.id}
                className="tactile-card flex flex-col justify-between rounded-xl border border-hairline bg-panel p-5 hover:border-telemetry/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-hairline pb-3">
                    <span
                      className={`font-mono text-[11px] font-semibold uppercase ${
                        student.availability === "Disponible"
                          ? "text-volt"
                          : "text-signal-amber"
                      }`}
                    >
                      {student.promo} • {student.availability}
                    </span>

                    <span className="rounded-md bg-telemetry/12 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-telemetry">
                      {student.matchScore}% match
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-lg font-bold text-ink">
                    {student.name}
                  </h2>
                  <p className="text-xs font-medium text-telemetry">
                    {student.specialty}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                    {student.projectIdea}
                  </p>

                  <div className="mt-4">
                    <p className="mb-1.5 text-[11px] font-semibold text-ink-muted">
                      Maîtrise
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-panel-raised px-2 py-0.5 font-mono text-[11px] text-ink"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-semibold text-telemetry">
                      Recherche
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {student.lookingFor.map((lf) => (
                        <span
                          key={lf}
                          className="rounded-md bg-telemetry/12 px-2 py-0.5 font-mono text-[11px] text-telemetry"
                        >
                          + {lf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Messaging CTAs */}
                <div className="mt-5 space-y-2 border-t border-hairline pt-4">
                  <a
                    href={`https://wa.me/${student.whatsappHandle}?text=${encodeURIComponent(
                      `Salut ${student.name}, je viens de voir ton profil sur ENSAE Nexus et je suis intéressé(e) par ton projet !`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-telemetry px-4 py-2 text-xs font-semibold text-primary-ink transition hover:opacity-90"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contacter sur WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => copyDiscord(student)}
                    className="flex min-h-[34px] w-full items-center justify-center gap-2 rounded-lg border border-hairline bg-obsidian px-4 py-1.5 font-mono text-xs text-ink-muted transition hover:bg-panel-raised hover:text-ink"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-volt" />
                        <span className="text-volt">
                          Copié : {student.discordHandle}
                        </span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Discord : {student.discordHandle}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
