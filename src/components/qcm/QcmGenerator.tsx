"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  FileUp,
  KeyRound,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { QcmQuestion } from "@/types";
import { ENSAE_SUBJECTS } from "@/lib/constants";
import { IMG } from "@/lib/images";
import { PageHeader } from "@/components/ui/PageHeader";

const PRESET_DOCS = [
  "Econometrie_Panel_Dynamique_ISE3.pdf",
  "Series_Temporelles_SARIMA.R",
  "Note_de_Synthese_Concours_ENSAE.pdf",
  "Academic_English_Statistical_Reporting.pdf",
];

const SUBJECT_OPTIONS = ["Auto", ...ENSAE_SUBJECTS] as const;
const DIFFICULTY_OPTIONS = ["Mixte", "Standard", "Avancé", "Concours"] as const;

export function QcmGenerator() {
  const [documentName, setDocumentName] = useState(
    "Econometrie_Panel_Dynamique_ISE3.pdf"
  );
  const [documentText, setDocumentText] = useState("");
  const [subject, setSubject] = useState<string>("Auto");
  const [difficulty, setDifficulty] = useState<string>("Mixte");
  const [count, setCount] = useState<number>(5);

  const [activeTool, setActiveTool] = useState<"qcm" | "reader" | "plan">("qcm");
  const [readerQuestion, setReaderQuestion] = useState("");
  const [readerAnswer, setReaderAnswer] = useState("");
  const [readerLoading, setReaderLoading] = useState(false);

  const [projectBrief, setProjectBrief] = useState("");
  const [projectPlan, setProjectPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  const [questions, setQuestions] = useState<QcmQuestion[]>([]);
  const [sourceMode, setSourceMode] = useState<
    "gemini-ai" | "dynamic-engine" | null
  >(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ensae-nexus-gemini-key");
      if (saved) setApiKey(saved);
    } catch {
      // ignore
    }
  }, []);
  const [extractionInfo, setExtractionInfo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  async function handleFileUpload(file: File) {
    setDocumentName(file.name);
    setError(null);
    setExtractionInfo(null);
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        text?: string;
        charCount?: number;
        pageCount?: number;
        error?: string;
      };

      if (!res.ok) {
        setDocumentText("");
        setError(data.error || "Impossible d'extraire le texte du fichier.");
        setIsExtracting(false);
        return;
      }

      const extracted = data.text ?? "";
      setDocumentText(extracted);
      const pagesLabel = data.pageCount ? ` • ${data.pageCount} page(s)` : "";
      setExtractionInfo(
        `${(data.charCount ?? extracted.length).toLocaleString("fr-FR")} caractères lus${pagesLabel}`
      );
      setIsExtracting(false);

      await generateQcm(file.name, extracted);
    } catch {
      setIsExtracting(false);
      setError("Erreur lors de la lecture du fichier.");
    }
  }

  async function generateQcm(overrideName?: string, overrideText?: string) {
    setIsGenerating(true);
    setError(null);
    setAnswers({});
    setSubmitted(false);

    try {
      const res = await fetch("/api/qcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentName: overrideName ?? documentName,
          documentText: overrideText ?? documentText,
          subject,
          difficulty,
          count,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de génération.");
        setIsGenerating(false);
        return;
      }

      setQuestions(data.questions ?? []);
      setSourceMode(data.source ?? "dynamic-engine");
      setNeedsApiKey(Boolean(data.needsApiKey));
    } catch {
      setError("Impossible de joindre le serveur de génération.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSelectOption(questionId: string, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );

  async function handleSmartReader() {
    setReaderLoading(true);
    setReaderAnswer("");
    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "reader",
          context: documentText || documentName,
          question: readerQuestion,
          apiKey: apiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      setReaderAnswer(data.text || data.error || "Aucune réponse.");
    } finally {
      setReaderLoading(false);
    }
  }

  async function handleProjectPlan() {
    setPlanLoading(true);
    setProjectPlan("");
    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "plan",
          brief: projectBrief || documentText || documentName,
          members: ["Moussa Diop", "Aminata Ndiaye", "Cheikh Fall"],
          apiKey: apiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      setProjectPlan(data.text || data.error || "Aucun plan généré.");
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Studio IA"
        subtitle="Smart Reader, QCM dynamique et assistant chef de projet propulsés par Gemini."
        icon={BrainCircuit}
        image={IMG.ai}
        action={
          <div className="grid grid-cols-3 rounded-full bg-white/15 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setActiveTool("qcm")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                activeTool === "qcm"
                  ? "bg-panel text-ink shadow-sm"
                  : "text-white/85 hover:text-white"
              }`}
            >
              QCM
            </button>
            <button
              type="button"
              onClick={() => setActiveTool("reader")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                activeTool === "reader"
                  ? "bg-panel text-ink shadow-sm"
                  : "text-white/85 hover:text-white"
              }`}
            >
              Smart Reader
            </button>
            <button
              type="button"
              onClick={() => setActiveTool("plan")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                activeTool === "plan"
                  ? "bg-panel text-ink shadow-sm"
                  : "text-white/85 hover:text-white"
              }`}
            >
              Chef de Projet
            </button>
          </div>
        }
      />

      {/* Split Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Control Rail */}
        <aside className="space-y-4 rounded-xl border border-hairline bg-panel p-5 lg:col-span-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-obsidian px-4 py-6 text-center transition hover:border-telemetry">
            <FileUp className="h-5 w-5 text-telemetry" />
            <span className="mt-2.5 text-xs font-bold text-ink">
              {isExtracting
                ? "Lecture du fichier en cours..."
                : "Importer un cours ou script"}
            </span>
            <span className="mt-1 font-mono text-[11px] text-ink-muted">
              .PDF, .R, .PY, .IPYNB, .TXT, .MD
            </span>
            <input
              type="file"
              accept=".pdf,.r,.R,.py,.ipynb,.txt,.md,.csv,.tex"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />
          </label>

          {extractionInfo ? (
            <div className="rounded-lg border border-volt/40 bg-volt/10 px-3 py-2 font-mono text-[11px] font-medium text-volt">
              Contenu lu : {extractionInfo}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Document actif
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 font-mono text-xs text-ink outline-none focus:border-telemetry"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Extrait de cours (optionnel)
            </label>
            <textarea
              rows={3}
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Collez un passage de cours ou code R/Python..."
              className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-xs text-ink placeholder-ink-muted/60 outline-none focus:border-telemetry"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Matière
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-obsidian px-2.5 py-2 text-xs text-ink outline-none focus:border-telemetry"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Difficulté
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-obsidian px-2.5 py-2 text-xs text-ink outline-none focus:border-telemetry"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Nombre de questions :{" "}
              <span className="font-mono font-semibold text-telemetry">
                {count}
              </span>
            </label>
            <div className="grid grid-cols-3 rounded-lg bg-panel-raised p-1">
              {[3, 5, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`min-h-[30px] rounded-md font-mono text-xs font-semibold transition ${
                    count === n
                      ? "bg-panel text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {n} Q
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={() => generateQcm()}
            className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-telemetry px-4 py-2 text-xs font-semibold text-primary-ink transition hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {isGenerating ? "Génération en cours..." : "Générer un QCM"}
          </button>

          <div className="border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setShowKeyInput((v) => !v)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold text-ink-muted hover:text-telemetry"
            >
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-telemetry" />
                Clé Gemini AI {apiKey ? "(configurée)" : "(optionnelle)"}
              </span>
              <span className="font-mono text-[10px]">
                {showKeyInput ? "Masquer" : "Configurer"}
              </span>
            </button>

            {showKeyInput ? (
              <div className="mt-2.5 space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setApiKey(val);
                    try {
                      localStorage.setItem("ensae-nexus-gemini-key", val);
                    } catch {
                      // ignore
                    }
                  }}
                  placeholder="AIzaSy..."
                  className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-1.5 font-mono text-xs text-ink outline-none focus:border-telemetry"
                />
                <p className="text-[11px] leading-relaxed text-ink-muted">
                  Permet d&apos;activer <span className="font-mono">gemini-2.5-flash</span> directement sur vos PDF.
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-hairline pt-4">
            <p className="mb-2 text-[11px] font-semibold text-ink-muted">
              Exemples rapides
            </p>
            <div className="space-y-1.5">
              {PRESET_DOCS.map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => {
                    setDocumentName(doc);
                    setDocumentText("");
                    generateQcm(doc, "");
                  }}
                  className="block w-full truncate rounded-lg border border-hairline bg-obsidian px-3 py-1.5 text-left font-mono text-[11px] text-ink-muted transition hover:border-telemetry hover:text-telemetry"
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Exam Sheet / Smart Reader / Chef de Projet */}
        <section className="lg:col-span-8">
          {error ? (
            <div className="mb-4 rounded-xl border border-signal-rose/40 bg-signal-rose/10 p-4 text-xs font-medium text-signal-rose">
              {error}
            </div>
          ) : null}

          {activeTool === "reader" ? (
            <div className="space-y-4 rounded-[20px] border border-hairline bg-panel p-6">
              <h2 className="font-display text-lg font-bold text-ink">
                Smart Reader (RAG sur votre document)
              </h2>
              <p className="text-xs text-ink-muted">
                Document chargé :{" "}
                <strong className="text-ink">{documentName}</strong> (
                {documentText ? `${documentText.length} caractères` : "aucun texte extrait"}).
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={readerQuestion}
                  onChange={(e) => setReaderQuestion(e.target.value)}
                  placeholder="Ex: Résume les hypothèses du modèle ou explique ce script..."
                  className="flex-1 rounded-xl border border-hairline bg-obsidian px-3.5 py-2.5 text-sm text-ink outline-none focus:border-telemetry"
                />
                <button
                  type="button"
                  disabled={readerLoading}
                  onClick={handleSmartReader}
                  className="minuto-btn rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {readerLoading ? "Analyse..." : "Interroger"}
                </button>
              </div>
              {readerAnswer ? (
                <div className="whitespace-pre-wrap rounded-xl border border-hairline bg-obsidian p-4 text-sm leading-relaxed text-ink">
                  {readerAnswer}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTool === "plan" ? (
            <div className="space-y-4 rounded-[20px] border border-hairline bg-panel p-6">
              <h2 className="font-display text-lg font-bold text-ink">
                Assistant Chef de Projet
              </h2>
              <p className="text-xs text-ink-muted">
                Collez l&apos;énoncé d&apos;un projet de groupe : l&apos;IA le
                découpe en tâches concrètes assignées à l&apos;équipe.
              </p>
              <textarea
                rows={5}
                value={projectBrief}
                onChange={(e) => setProjectBrief(e.target.value)}
                placeholder="Collez ici l'énoncé du projet ou laissez vide pour utiliser le document importé..."
                className="w-full rounded-xl border border-hairline bg-obsidian px-3.5 py-2.5 text-sm text-ink outline-none focus:border-telemetry"
              />
              <button
                type="button"
                disabled={planLoading}
                onClick={handleProjectPlan}
                className="minuto-btn rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-50"
              >
                {planLoading ? "Découpage..." : "Découper en tâches"}
              </button>
              {projectPlan ? (
                <div className="whitespace-pre-wrap rounded-xl border border-hairline bg-obsidian p-4 text-sm leading-relaxed text-ink">
                  {projectPlan}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTool === "qcm" && questions.length === 0 && !isGenerating ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-hairline bg-panel p-10 text-center">
              <BrainCircuit className="h-8 w-8 text-telemetry" />
              <h2 className="mt-4 font-display text-xl font-bold text-ink">
                Prêt pour l&apos;évaluation
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Importez un fichier, collez un extrait ou cliquez sur{" "}
                <strong className="text-ink">Générer un QCM</strong> pour lancer
                une série de questions inédites.
              </p>
            </div>
          ) : null}

          {activeTool === "qcm" && isGenerating ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-hairline bg-panel p-10 text-center">
              <RefreshCw className="h-7 w-7 animate-spin text-telemetry" />
              <p className="mt-4 font-mono text-xs text-telemetry">
                Synthèse de {count} questions pour {documentName}...
              </p>
            </div>
          ) : null}

          {activeTool === "qcm" && questions.length > 0 && !isGenerating ? (
            <div className="space-y-4">
              {needsApiKey ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-signal-amber/40 bg-signal-amber/10 px-4 py-3 text-xs text-ink">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal-amber" />
                  <div>
                    <span className="font-semibold">
                      Mode d&apos;analyse locale (aucune clé Gemini API configurée) :
                    </span>{" "}
                    ces questions sont extraites mécaniquement de votre texte.
                    Ajoutez votre clé Gemini API dans le panneau de gauche (ou
                    dans <span className="font-mono">.env.local</span>) pour que
                    l&apos;IA rédige des QCM complets et intelligents sur tout le
                    document.
                  </div>
                </div>
              ) : null}

              {/* Exam Action Bar + Animated Progress */}
              <div className="space-y-2.5 rounded-xl border border-hairline bg-panel px-5 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-ink-muted">
                    <span className="font-mono font-medium text-ink">
                      {documentName}
                    </span>{" "}
                    •{" "}
                    <span className="font-mono font-semibold tabular-nums text-telemetry">
                      {answeredCount}/{questions.length}
                    </span>{" "}
                    répondues
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => generateQcm()}
                      className="tactile-btn inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-hairline bg-obsidian px-3 py-1.5 text-xs font-medium text-ink hover:bg-panel-raised"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-telemetry" />
                      Régénérer
                    </button>

                    {submitted ? (
                      <span className="animate-enter rounded-lg bg-volt px-3.5 py-1.5 font-mono text-xs font-bold tabular-nums text-primary-ink">
                        Score : {score} / {questions.length}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={answeredCount < questions.length}
                        onClick={() => setSubmitted(true)}
                        className="tactile-btn min-h-[34px] rounded-lg bg-telemetry px-4 py-1.5 text-xs font-semibold text-primary-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Corriger
                      </button>
                    )}
                  </div>
                </div>

                {/* Smooth Animated Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-raised">
                  <div
                    className="h-full rounded-full bg-telemetry transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        questions.length > 0
                          ? Math.round((answeredCount / questions.length) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-hairline rounded-xl border border-hairline bg-panel">
                {questions.map((q, idx) => {
                  const userChoice = answers[q.id];
                  return (
                    <article key={q.id} className="p-5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-md bg-panel-raised px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-telemetry">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-base font-bold leading-snug text-ink">
                          {q.question}
                        </h3>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userChoice === optIdx;
                          const isCorrect = optIdx === q.correctIndex;

                          let style =
                            "border-hairline bg-obsidian text-ink-muted hover:border-telemetry hover:text-ink";
                          if (!submitted && isSelected) {
                            style =
                              "border-telemetry bg-telemetry/10 text-telemetry font-medium";
                          } else if (submitted && isCorrect) {
                            style =
                              "border-volt bg-volt/10 text-volt font-medium";
                          } else if (submitted && isSelected && !isCorrect) {
                            style =
                              "border-signal-rose bg-signal-rose/10 text-signal-rose";
                          }

                          return (
                            <button
                              key={`${q.id}-${optIdx}`}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`flex min-h-[40px] items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition ${style}`}
                            >
                              <span>{opt}</span>
                              {submitted && isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-volt" />
                              ) : null}
                              {submitted && isSelected && !isCorrect ? (
                                <XCircle className="h-4 w-4 shrink-0 text-signal-rose" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      {submitted ? (
                        <div className="mt-3 rounded-lg border border-hairline bg-obsidian px-3.5 py-2.5 text-xs leading-relaxed text-ink-muted">
                          <span className="font-mono font-semibold text-telemetry">
                            Corrigé :{" "}
                          </span>
                          {q.explanation}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
