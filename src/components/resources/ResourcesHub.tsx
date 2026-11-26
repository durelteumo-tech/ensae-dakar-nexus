"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Download,
  FileCode2,
  FileText,
  FolderKanban,
  Plus,
  Search,
  ThumbsUp,
  UploadCloud,
  X,
} from "lucide-react";
import type {
  ResourceCategory,
  ResourceFileType,
  ResourceItem,
} from "@/types";
import { useAuth } from "@/lib/auth-context";
import { ENSAE_SUBJECTS } from "@/lib/constants";
import { IMG } from "@/lib/images";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { PageHeader } from "@/components/ui/PageHeader";

const SUBJECTS: ("Toutes" | ResourceCategory)[] = ["Toutes", ...ENSAE_SUBJECTS];
const FILE_TYPES: ResourceFileType[] = ["PDF", "R", "Python", "Notebook"];

interface ResourcesHubProps {
  initialResources: ResourceItem[];
}

export function ResourcesHub({ initialResources }: ResourcesHubProps) {
  const { user } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [selectedSubject, setSelectedSubject] = useState<
    "Toutes" | ResourceCategory
  >("Toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<ResourceCategory>("Économétrie");
  const [fileType, setFileType] = useState<ResourceFileType>("PDF");
  const [fileName, setFileName] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});
  const [voteNotice, setVoteNotice] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return resources.filter((item) => {
      const matchesSubject =
        selectedSubject === "Toutes" || item.subject === selectedSubject;
      const matchesQuery =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query);
      return matchesSubject && matchesQuery;
    });
  }, [resources, selectedSubject, searchQuery]);

  function handleDownload(item: ResourceItem) {
    const extMap: Record<ResourceFileType, string> = {
      PDF: "txt",
      R: "R",
      Python: "py",
      Notebook: "ipynb",
    };
    const content = `# ENSAE Dakar Nexus — Ressource Certifiée (${item.badge})\n# Titre: ${item.title}\n# Matière: ${item.subject}\n# Auteur: ${item.author} (${item.promo})\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.title.replace(/\s+/g, "_")}.${extMap[item.fileType]}`;
    link.click();
    URL.revokeObjectURL(url);

    setResources((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, downloads: r.downloads + 1 } : r
      )
    );
  }

  async function handleUploadSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || fileName || "Nouvelle_Ressource_ENSAE",
          subject,
          fileType,
          fileSize: fileName ? "420 KB" : "1.1 MB",
          author: user?.name ?? "Étudiant ENSAE",
          promo: user?.promo ?? "ISE2",
          badge: "100% Validé",
        }),
      });
      const data = await res.json();
      if (res.ok && data.resource) {
        setResources((prev) => [data.resource as ResourceItem, ...prev]);
      }
    } finally {
      setIsSubmitting(false);
      setTitle("");
      setFileName(null);
      setIsUploadOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hub de ressources"
        subtitle="Annales, fiches PDF et scripts R & Python par matière."
        icon={FolderKanban}
        image={IMG.resources}
        action={
          <button
            type="button"
            onClick={() => setIsUploadOpen((v) => !v)}
            className="minuto-btn inline-flex min-h-[38px] shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            Déposer un fichier
          </button>
        }
      />

      {/* Upload Sheet */}
      {isUploadOpen ? (
        <form
          onSubmit={handleUploadSubmit}
          className="rounded-xl border border-telemetry/40 bg-panel p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
              <UploadCloud className="h-4 w-4 text-telemetry" />
              Publier une ressource académique
            </h2>
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="rounded-md p-1.5 text-ink-muted hover:bg-panel-raised hover:text-ink"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Titre de la ressource
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Correction_TD_Panel_ISE2.R"
                className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Matière
              </label>
              <select
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value as ResourceCategory)
                }
                className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
              >
                {SUBJECTS.filter((s) => s !== "Toutes").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Format
              </label>
              <select
                value={fileType}
                onChange={(e) =>
                  setFileType(e.target.value as ResourceFileType)
                }
                className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm text-ink outline-none focus:border-telemetry"
              >
                {FILE_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border border-dashed border-hairline bg-obsidian px-3.5 py-2 text-xs font-medium text-ink-muted hover:border-telemetry hover:text-telemetry">
              <UploadCloud className="h-4 w-4" />
              <span>
                {fileName
                  ? `Fichier : ${fileName}`
                  : "Choisir un fichier (.pdf, .R, .py)"}
              </span>
              <input
                type="file"
                accept=".pdf,.r,.R,.py,.ipynb,.txt"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFileName(f.name);
                    if (!title) setTitle(f.name);
                  }
                }}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[38px] rounded-lg bg-telemetry px-5 py-2 text-xs font-semibold text-primary-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Publication..." : "Publier dans le Hub"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Filter Bar */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((subj) => {
            const active = selectedSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`min-h-[32px] rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-telemetry text-primary-ink"
                    : "border border-hairline bg-panel text-ink-muted hover:bg-panel-raised hover:text-ink"
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un cours, script..."
            className="w-full rounded-lg border border-hairline bg-panel py-2 pl-9 pr-3 text-xs text-ink placeholder-ink-muted/60 outline-none focus:border-telemetry"
          />
        </div>
      </div>

      {voteNotice ? (
        <div className="animate-enter rounded-xl border border-volt/40 bg-volt/10 px-4 py-2.5 text-xs font-semibold text-volt">
          {voteNotice}
        </div>
      ) : null}

      {/* Grouped List */}
      {filteredResources.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-panel p-8 text-center text-xs text-ink-muted">
          Aucune ressource ne correspond à votre recherche.
        </div>
      ) : (
        <div className="divide-y divide-hairline rounded-xl border border-hairline bg-panel">
          {filteredResources.map((item) => {
            const Icon = item.fileType === "PDF" ? FileText : FileCode2;
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between gap-4 px-5 py-4 transition hover:bg-panel-raised/50 md:flex-row md:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-panel-raised px-2 py-0.5 font-mono text-[10px] font-semibold text-telemetry">
                      <Icon className="h-3 w-3" />
                      {item.fileType} • {item.fileSize}
                    </span>
                    <NeonBadge label={item.badge} />
                    <span className="text-xs font-medium text-ink-muted">
                      {item.subject}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Par {item.author} ({item.promo}) •{" "}
                    <span className="font-mono tabular-nums">
                      {item.downloads}
                    </span>{" "}
                    téléchargements
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVotedIds((v) => ({ ...v, [item.id]: true }));
                      setVoteNotice(`Merci — +1 karma attribué à ${item.author}.`);
                      setTimeout(() => setVoteNotice(null), 2500);
                    }}
                    className={`tactile-btn inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      votedIds[item.id]
                        ? "border-volt bg-volt/12 text-volt"
                        : "border-hairline bg-obsidian text-ink-muted hover:text-ink"
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{votedIds[item.id] ? "Utile ✓" : "Utile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="tactile-btn inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-hairline bg-obsidian px-4 py-1.5 text-xs font-semibold text-ink hover:bg-panel-raised"
                  >
                    <Download className="h-3.5 w-3.5 text-telemetry" />
                    Télécharger
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
