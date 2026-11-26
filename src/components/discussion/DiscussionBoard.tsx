"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CheckCheck,
  Info,
  ListTodo,
  MessageSquareText,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import type { ChatMessage, StudentGroup } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { ENSAE_PROMOS, ENSAE_SUBJECTS } from "@/lib/constants";
import { IMG } from "@/lib/images";
import { PageHeader } from "@/components/ui/PageHeader";

interface GroupTask {
  id: string;
  groupId: string;
  title: string;
  status: "todo" | "doing" | "done";
  assignee?: string;
}

const KANBAN_COLS: Array<{
  key: GroupTask["status"];
  label: string;
  dot: string;
}> = [
  { key: "todo", label: "À faire", dot: "bg-ink-muted" },
  { key: "doing", label: "En cours", dot: "bg-signal-amber" },
  { key: "done", label: "Terminé", dot: "bg-volt" },
];

interface DiscussionBoardProps {
  initialGroups: StudentGroup[];
  initialMessages: ChatMessage[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function DiscussionBoard({
  initialGroups,
  initialMessages,
}: DiscussionBoardProps) {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Moussa Diop";
  const currentUserPromo = user?.promo ?? "ISE2";
  const currentUserSpecialty = user?.specialty ?? "Data Science";

  const [groups, setGroups] = useState<StudentGroup[]>(initialGroups);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [roomView, setRoomView] = useState<"chat" | "kanban">("chat");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>(
    initialGroups[0]?.id ?? "grp-1"
  );
  const [tab, setTab] = useState<"mine" | "campus">("mine");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubject, setNewGroupSubject] = useState<string>(
    ENSAE_SUBJECTS[0]
  );
  const [newGroupPromo, setNewGroupPromo] = useState<string>(currentUserPromo);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Live multi-device polling every 3 seconds
  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const [msgRes, grpRes, tskRes] = await Promise.all([
          fetch("/api/discussions", { cache: "no-store" }),
          fetch("/api/groups", { cache: "no-store" }),
          fetch("/api/tasks", { cache: "no-store" }),
        ]);
        if (!active) return;
        const msgData = await msgRes.json();
        const grpData = await grpRes.json();
        const tskData = await tskRes.json();
        if (Array.isArray(msgData.messages)) {
          setMessages(msgData.messages);
        }
        if (Array.isArray(grpData.groups)) {
          setGroups(grpData.groups);
        }
        if (Array.isArray(tskData.tasks)) {
          setTasks(tskData.tasks);
        }
      } catch {
        // Ignore transient poll errors
      }
    }

    poll();
    const timer = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter((g) => {
      const matchesTab =
        tab === "campus" || g.members.includes(currentUserName);
      const matchesSearch =
        q === "" ||
        g.name.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [groups, tab, search, currentUserName]);

  const activeGroup =
    groups.find((g) => g.id === activeGroupId) ?? groups[0] ?? null;

  const roomMessages = useMemo(
    () => messages.filter((m) => m.groupId === activeGroup?.id),
    [messages, activeGroup?.id]
  );

  const roomTasks = useMemo(
    () => tasks.filter((t) => t.groupId === activeGroup?.id),
    [tasks, activeGroup?.id]
  );

  async function handleAddTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeGroup) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        groupId: activeGroup.id,
        title: newTaskTitle.trim(),
        assignee: newTaskAssignee || currentUserName,
      }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.tasks)) {
      setTasks(data.tasks);
      setNewTaskTitle("");
    }
  }

  async function handleMoveTask(taskId: string, status: GroupTask["status"]) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", taskId, status }),
    });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages.length, activeGroup?.id]);

  async function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim() || !activeGroup) return;
    const text = draft.trim();
    setDraft("");
    setChatError(null);
    setIsSending(true);

    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: activeGroup.id,
          author: currentUserName,
          promo: currentUserPromo,
          specialty: currentUserSpecialty,
          content: text,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatError(
          data.error || "Impossible d'envoyer le message (vérifiez Supabase)."
        );
        setDraft(text);
        return;
      }
      if (data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessage]);
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleCreateGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        name: newGroupName.trim(),
        subject: newGroupSubject,
        promo: newGroupPromo,
        memberName: currentUserName,
      }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.groups)) {
      setGroups(data.groups);
      if (data.group?.id) setActiveGroupId(data.group.id);
      setNewGroupName("");
      setShowNewGroup(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projets & Salons de discussion"
        subtitle="Messagerie de groupe temps réel et tableau Kanban des tâches."
        icon={MessageSquareText}
        image={IMG.projects}
        action={
          <button
            type="button"
            onClick={() => setShowNewGroup((v) => !v)}
            className="minuto-btn inline-flex min-h-[38px] items-center gap-2 rounded-full px-5 py-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            Nouveau salon
          </button>
        }
      />
      <div className="flex h-[calc(100vh-15rem)] min-h-[500px] flex-col overflow-hidden rounded-[20px] border border-hairline bg-panel shadow-sm lg:flex-row">
      {/* Left Pane: Groups & Channels List */}
      <aside className="flex w-full shrink-0 flex-col border-b border-hairline bg-panel lg:w-80 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-display text-lg font-bold text-ink">
              Groupes &amp; Salons
            </h1>
            <p className="text-xs text-ink-muted">
              Salons de travail en temps réel
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewGroup((v) => !v)}
            title="Créer un salon"
            aria-label="Créer un salon"
            className="tactile-btn flex h-9 w-9 items-center justify-center rounded-full bg-telemetry text-primary-ink hover:opacity-90"
          >
            {showNewGroup ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Inline New Group Form */}
        {showNewGroup ? (
          <form
            onSubmit={handleCreateGroup}
            className="animate-enter mx-3 mb-3 space-y-2.5 rounded-xl border border-hairline bg-obsidian p-3"
          >
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nom du salon (ex: Projet ML)"
              className="w-full rounded-lg border border-hairline bg-panel px-3 py-1.5 text-xs text-ink outline-none focus:border-telemetry"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newGroupSubject}
                onChange={(e) => setNewGroupSubject(e.target.value)}
                className="rounded-lg border border-hairline bg-panel px-2 py-1.5 text-xs text-ink outline-none"
              >
                {ENSAE_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={newGroupPromo}
                onChange={(e) => setNewGroupPromo(e.target.value)}
                className="rounded-lg border border-hairline bg-panel px-2 py-1.5 text-xs text-ink outline-none"
              >
                {ENSAE_PROMOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-telemetry py-1.5 text-xs font-semibold text-primary-ink"
            >
              Créer le salon
            </button>
          </form>
        ) : null}

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une discussion..."
              className="w-full rounded-full border border-hairline bg-obsidian py-2 pl-9 pr-3 text-xs text-ink placeholder-ink-muted/70 outline-none focus:border-telemetry"
            />
          </div>
        </div>

        {/* Segmented Tabs: Mes groupes / Campus */}
        <div className="mx-3 mb-2 grid grid-cols-2 rounded-full bg-panel-raised p-1">
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={`rounded-full py-1.5 text-xs font-semibold transition ${
              tab === "mine"
                ? "bg-telemetry text-primary-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Mes groupes ({groups.filter((g) => g.members.includes(currentUserName)).length})
          </button>
          <button
            type="button"
            onClick={() => setTab("campus")}
            className={`rounded-full py-1.5 text-xs font-semibold transition ${
              tab === "campus"
                ? "bg-telemetry text-primary-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Campus ({groups.length})
          </button>
        </div>

        {/* Group List */}
        <div className="flex-1 divide-y divide-hairline/60 overflow-y-auto">
          {filteredGroups.map((grp) => {
            const isActive = grp.id === activeGroup?.id;
            const lastMsg = messages
              .filter((m) => m.groupId === grp.id)
              .slice(-1)[0];

            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => setActiveGroupId(grp.id)}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition ${
                  isActive
                    ? "bg-telemetry/10"
                    : "hover:bg-panel-raised/50"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-telemetry text-xs font-bold text-primary-ink">
                  {getInitials(grp.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-ink">
                      {grp.name}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                      {lastMsg?.createdAt ?? ""}
                    </span>
                  </div>
                  <span className="mt-0.5 inline-block rounded bg-panel-raised px-1.5 py-0.5 text-[11px] font-medium text-telemetry">
                    {grp.subject}
                  </span>
                  <p className="mt-1 truncate text-xs text-ink-muted">
                    {lastMsg
                      ? `${lastMsg.author} : ${lastMsg.content}`
                      : "Cliquez pour ouvrir le salon de discussion"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Pane: Active Chat Room */}
      <section className="flex min-w-0 flex-1 flex-col bg-obsidian">
        {activeGroup ? (
          <>
            {/* Room Header */}
            <header className="flex items-center justify-between gap-3 border-b border-hairline bg-panel px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-telemetry text-xs font-bold text-primary-ink">
                  {getInitials(activeGroup.name)}
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-ink">
                    {activeGroup.name}
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {activeGroup.members.length} participant(s) •{" "}
                    {activeGroup.subject} ({activeGroup.promo})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRoomView((v) => (v === "chat" ? "kanban" : "chat"))
                  }
                  className={`tactile-btn inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    roomView === "kanban"
                      ? "border-telemetry bg-telemetry text-primary-ink"
                      : "border-hairline bg-obsidian text-ink hover:bg-panel-raised"
                  }`}
                >
                  {roomView === "kanban" ? (
                    <>
                      <MessageSquareText className="h-3.5 w-3.5" />
                      <span>Discussion</span>
                    </>
                  ) : (
                    <>
                      <ListTodo className="h-3.5 w-3.5 text-telemetry" />
                      <span>Tâches ({roomTasks.length})</span>
                    </>
                  )}
                </button>

                <span className="hidden items-center gap-1.5 rounded-full border border-hairline bg-obsidian px-3 py-1 text-xs font-medium text-ink-muted sm:inline-flex">
                  <Users className="h-3.5 w-3.5 text-telemetry" />
                  Code : <strong className="font-mono text-ink">{activeGroup.code}</strong>
                </span>
                <span
                  title="Synchronisation multi-appareils active"
                  className="inline-flex items-center gap-1.5 rounded-full bg-volt/12 px-2.5 py-1 text-xs font-semibold text-volt"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-volt" />
                  En ligne
                </span>
              </div>
            </header>

            {roomView === "kanban" ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <form
                  onSubmit={handleAddTask}
                  className="flex flex-wrap gap-2 rounded-xl border border-hairline bg-panel p-3"
                >
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nouvelle tâche à faire..."
                    className="min-w-[180px] flex-1 rounded-lg border border-hairline bg-obsidian px-3 py-1.5 text-xs text-ink outline-none focus:border-telemetry"
                  />
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="rounded-lg border border-hairline bg-obsidian px-2.5 py-1.5 text-xs text-ink outline-none"
                  >
                    <option value="">Assigner à moi</option>
                    {activeGroup.members.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="minuto-btn rounded-full px-4 py-1.5 text-xs font-bold"
                  >
                    + Ajouter
                  </button>
                </form>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {KANBAN_COLS.map((col) => {
                    const colTasks = roomTasks.filter(
                      (t) => t.status === col.key
                    );
                    return (
                      <div
                        key={col.key}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragTaskId) {
                            handleMoveTask(dragTaskId, col.key);
                            setDragTaskId(null);
                          }
                        }}
                        className="min-h-[260px] rounded-xl border border-hairline bg-panel p-3.5"
                      >
                        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${col.dot}`}
                          />
                          <span>{col.label}</span>
                          <span className="ml-auto font-mono">
                            {colTasks.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {colTasks.map((t) => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={() => setDragTaskId(t.id)}
                              className="cursor-grab rounded-xl border border-hairline bg-obsidian p-3 text-xs transition hover:border-telemetry/60"
                            >
                              <div className="font-semibold text-ink">
                                {t.title}
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
                                <span>{t.assignee || "Non assignée"}</span>
                                {col.key !== "done" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveTask(
                                        t.id,
                                        col.key === "todo" ? "doing" : "done"
                                      )
                                    }
                                    className="font-semibold text-telemetry hover:underline"
                                  >
                                    Avancer
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
            {/* Messages Feed */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              <div className="flex justify-center pb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3.5 py-1 text-xs text-ink-muted">
                  <Info className="h-3.5 w-3.5 text-telemetry" />
                  Salon de discussion • {activeGroup.name}
                </span>
              </div>

              {roomMessages.length === 0 ? (
                <div className="py-12 text-center text-sm text-ink-muted">
                  Aucun message dans ce salon. Lancez la discussion ci-dessous.
                </div>
              ) : (
                roomMessages.map((msg) => {
                  const isMine =
                    msg.author.toLowerCase() === currentUserName.toLowerCase();

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "rounded-br-sm bg-telemetry text-primary-ink"
                            : "rounded-bl-sm border border-hairline bg-panel text-ink"
                        }`}
                      >
                        {!isMine ? (
                          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-bold text-telemetry">
                              {msg.author}
                            </span>
                            <span className="text-ink-muted">
                              • {msg.promo}
                              {msg.specialty ? ` (${msg.specialty})` : ""}
                            </span>
                          </div>
                        ) : null}

                        <p className="text-sm leading-relaxed">{msg.content}</p>

                        <div
                          className={`mt-1 flex items-center justify-end gap-1 font-mono text-[11px] ${
                            isMine ? "text-primary-ink/80" : "text-ink-muted"
                          }`}
                        >
                          <span>{msg.createdAt}</span>
                          {isMine ? <CheckCheck className="h-3.5 w-3.5" /> : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {chatError ? (
              <div className="mx-4 mt-2 rounded-xl border border-signal-rose/40 bg-signal-rose/10 px-3.5 py-2 text-xs font-medium text-signal-rose">
                {chatError}
              </div>
            ) : null}

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3 border-t border-hairline bg-panel px-4 py-3"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Écrire un message dans ${activeGroup.name}...`}
                className="flex-1 rounded-full border border-hairline bg-obsidian px-4 py-2.5 text-sm text-ink placeholder-ink-muted/70 outline-none focus:border-telemetry"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="tactile-btn inline-flex min-h-[40px] items-center gap-2 rounded-full bg-telemetry px-5 py-2 text-sm font-semibold text-primary-ink hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>
              </>
            )}
          </>
        ) : null}
      </section>
      </div>
    </div>
  );
}
