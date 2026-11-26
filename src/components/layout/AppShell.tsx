"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  BrainCircuit,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/", label: "Accueil", icon: Home },
  {
    href: "/discussion",
    label: "Discussion",
    icon: MessageSquareText,
    badge: "3",
  },
  { href: "/resources", label: "Hub ressources", icon: FolderKanban },
  { href: "/qcm", label: "Studio QCM IA", icon: BrainCircuit },
  { href: "/matchmaking", label: "Réseau étudiant", icon: Users },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("ensae-nexus-theme", next);
    } catch {
      // ignore storage errors
    }
  }

  if (pathname === "/login") {
    return (
      <div className="relative min-h-screen bg-obsidian text-ink">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Basculer le thème"
          className="tactile-btn fixed right-5 top-5 z-50 inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-hairline bg-panel/85 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-xl hover:bg-panel-raised"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 text-signal-amber" />
              <span>Clair</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-telemetry" />
              <span>Sombre</span>
            </>
          )}
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-obsidian text-ink lg:flex-row">
      {/* Desktop Left Sidebar — Reference-inspired airy vertical menu with Nexus colors */}
      {sidebarOpen ? (
        <aside className="animate-enter-left hidden w-64 shrink-0 flex-col border-r border-hairline bg-panel/85 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen">
          {/* Brand Crest */}
          <div className="flex items-center justify-between px-5 pb-4 pt-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-telemetry/15 p-1.5 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/Logo_ensae.png"
                  alt="Logo ENSAE Dakar"
                  width={26}
                  height={26}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="leading-tight">
                <span className="block font-display text-base font-bold tracking-tight text-ink">
                  ENSAE Nexus
                </span>
                <span className="block font-luckymoon text-[11px] uppercase tracking-wider text-ink-muted">
                  ENSAE DAKAR
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Masquer la barre latérale"
              title="Masquer la barre latérale"
              className="tactile-btn flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-panel-raised hover:text-ink"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav
            className="flex-1 space-y-1.5 px-3 py-3"
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const badge = "badge" in item ? item.badge : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex min-h-[42px] items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] transition-all duration-200 ${
                    active
                      ? "bg-telemetry/12 font-semibold text-telemetry"
                      : "font-medium text-ink-muted hover:translate-x-1 hover:bg-panel-raised/60 hover:text-ink"
                  }`}
                >
                  {/* Left active indicator bar (like reference) */}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute -left-3 bottom-2 top-2 w-1 rounded-r-full bg-telemetry"
                    />
                  ) : null}

                  <span className="flex items-center gap-3">
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-telemetry" : "text-ink-muted group-hover:text-ink"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </span>

                  {badge ? (
                    <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-full bg-telemetry px-1.5 font-mono text-[11px] font-bold text-primary-ink">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Account Switcher & Logout Block (replaces Serveur ENSAE actif) */}
          <div className="space-y-2.5 border-t border-hairline px-4 py-4">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2.5 rounded-xl bg-obsidian px-3 py-2 transition hover:bg-panel-raised"
                >
                  <UserCircle2 className="h-5 w-5 shrink-0 text-telemetry" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-ink">
                      {user.name}
                    </div>
                    <div className="text-xs text-ink-muted">{user.promo}</div>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="tactile-btn inline-flex min-h-[32px] items-center justify-center gap-1 rounded-lg border border-hairline bg-obsidian px-2 py-1.5 text-xs font-medium text-ink hover:bg-panel-raised"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 text-telemetry" />
                    <span>Changer</span>
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      router.push("/login");
                    }}
                    className="tactile-btn inline-flex min-h-[32px] items-center justify-center gap-1 rounded-lg border border-signal-rose/40 bg-signal-rose/10 px-2 py-1.5 text-xs font-medium text-signal-rose hover:bg-signal-rose hover:text-primary-ink"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Quitter</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="tactile-btn flex min-h-[38px] w-full items-center justify-center gap-2 rounded-xl bg-telemetry px-3 py-2 text-xs font-semibold text-primary-ink hover:opacity-90"
              >
                <UserCircle2 className="h-4 w-4" />
                <span>Se connecter</span>
              </Link>
            )}
          </div>
        </aside>
      ) : null}

      {/* Main Column with Translucent Toolbar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-hairline bg-panel/80 px-4 py-2.5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-2.5">
            {!sidebarOpen ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Afficher la barre latérale"
                title="Afficher la barre latérale"
                className="tactile-btn hidden h-8 w-8 items-center justify-center rounded-xl border border-hairline bg-panel text-ink hover:bg-panel-raised lg:flex"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            ) : null}

            {/* Mobile Logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <Image
                src="/Logo_ensae.png"
                alt="Logo ENSAE Dakar"
                width={22}
                height={22}
                className="object-contain"
                priority
              />
              <span className="font-display text-sm font-bold text-ink">
                ENSAE Nexus
              </span>
            </Link>
          </div>

          {/* Right Toolbar Controls: Theme Switcher + Account */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Basculer le thème clair ou sombre"
              className="tactile-btn inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-hairline bg-panel px-3 py-1.5 text-xs font-medium text-ink hover:bg-panel-raised"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-signal-amber" />
                  <span className="hidden sm:inline">Mode clair</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-telemetry" />
                  <span className="hidden sm:inline">Mode sombre</span>
                </>
              )}
            </button>

            {user ? (
              <Link
                href="/account"
                className={`tactile-btn inline-flex min-h-[34px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${
                  pathname === "/account"
                    ? "border-telemetry bg-telemetry/10 text-telemetry"
                    : "border-hairline bg-panel text-ink hover:bg-panel-raised"
                }`}
              >
                <UserCircle2 className="h-4 w-4 text-telemetry" />
                <span className="hidden sm:inline">{user.name}</span>
                <span className="rounded-md bg-panel-raised px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-muted">
                  {user.promo}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="tactile-btn inline-flex min-h-[34px] items-center rounded-xl bg-telemetry px-3.5 py-1.5 text-xs font-semibold text-primary-ink hover:opacity-90"
              >
                Connexion
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="tactile-btn flex h-8 w-8 items-center justify-center rounded-xl border border-hairline bg-panel text-ink lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen ? (
          <nav className="animate-enter border-b border-hairline bg-panel/95 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="space-y-1">
              {NAV_LINKS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-telemetry/12 text-telemetry"
                        : "text-ink-muted hover:bg-panel-raised hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}

        {/* Content Layer with smooth page entrance on route change */}
        <main
          key={pathname}
          className="animate-enter mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
