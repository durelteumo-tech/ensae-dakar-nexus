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
  Pin,
  PinOff,
  Sun,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/resources", label: "Ressources", icon: FolderKanban },
  {
    href: "/discussion",
    label: "Projets",
    icon: MessageSquareText,
    badge: "3",
  },
  { href: "/matchmaking", label: "Réseau", icon: Users },
  { href: "/qcm", label: "Studio IA", icon: BrainCircuit },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const handleRailPin = (e: Event) => {
      const custom = e as CustomEvent<{ pinned: boolean }>;
      if (typeof custom.detail?.pinned === "boolean") {
        setPinned(custom.detail.pinned);
      }
    };
    window.addEventListener("ensae:set-rail-pinned", handleRailPin);
    return () =>
      window.removeEventListener("ensae:set-rail-pinned", handleRailPin);
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, user, pathname, router]);

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
      // ignore
    }
  }

  if (pathname === "/login") {
    return (
      <div className="relative min-h-screen bg-obsidian text-ink">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Basculer le thème"
          className="tactile-btn fixed right-5 top-5 z-50 inline-flex min-h-[36px] items-center gap-2 rounded-full border border-hairline bg-panel px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-panel-raised"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 text-signal-amber" />
              <span>Thème clair</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-telemetry" />
              <span>Thème sombre</span>
            </>
          )}
        </button>
        {children}
      </div>
    );
  }

  if (pathname !== "/login" && (loading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian text-sm text-ink-muted">
        Redirection vers la création de compte...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-obsidian text-ink lg:flex-row">
      {/* Desktop Expandable Icon-Rail Sidebar (ensae-hub rail + ENSAE logo + Account switcher) */}
      <aside
        className={`rail hidden shrink-0 flex-col border-r border-hairline bg-panel px-3.5 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen ${
          pinned ? "rail-expanded" : ""
        }`}
      >
        {/* Brand Crest with ENSAE Logo */}
        <div className="mb-4 flex min-h-[44px] items-center justify-between gap-2 px-1">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-telemetry/12 p-1.5">
              <Image
                src="/Logo_ensae.png"
                alt="Logo ENSAE Dakar"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div className="lbl leading-tight">
              <span className="block font-display text-base font-bold tracking-tight text-ink">
                ENSAE Hub
              </span>
              <span className="block font-luckymoon text-[11px] uppercase tracking-wider text-ink-muted">
                ENSAE DAKAR
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setPinned((v) => !v)}
            title={pinned ? "Réduire en rail d'icônes" : "Épingler le menu"}
            aria-label={pinned ? "Réduire le menu" : "Épingler le menu"}
            className="lbl tactile-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-panel-raised hover:text-ink"
          >
            {pinned ? (
              <PinOff className="h-3.5 w-3.5" />
            ) : (
              <Pin className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 space-y-1.5"
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
                className={`group relative flex min-h-[44px] items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-telemetry/12 text-telemetry"
                    : "text-ink-muted hover:bg-panel-raised hover:text-ink"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute -left-3.5 bottom-2 top-2 w-1 rounded-r-full bg-telemetry"
                  />
                ) : null}

                <span className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? "text-telemetry" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <span className="lbl">{item.label}</span>
                </span>

                {badge ? (
                  <span className="lbl inline-flex h-5 min-w-[22px] items-center justify-center rounded-full bg-telemetry px-1.5 font-mono text-[11px] font-bold text-primary-ink">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Controls: Theme + Account Name + Switch/Logout */}
        <div className="mt-auto space-y-1.5 border-t border-hairline pt-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="tactile-btn flex min-h-[42px] w-full items-center gap-3.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted hover:bg-panel-raised hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 shrink-0 text-signal-amber" />
            ) : (
              <Moon className="h-5 w-5 shrink-0 text-telemetry" />
            )}
            <span className="lbl">
              {theme === "dark" ? "Thème clair" : "Thème sombre"}
            </span>
          </button>

          {user ? (
            <>
              <Link
                href="/account"
                className="flex min-h-[46px] items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-panel-raised"
              >
                <div className="minuto-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold">
                  {(user.name || user.email || "E")[0].toUpperCase()}
                </div>
                <div className="lbl min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-ink">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-ink-muted">{user.promo}</div>
                </div>
              </Link>

              <div className="lbl grid grid-cols-2 gap-1.5 pt-1">
                <Link
                  href="/login"
                  className="tactile-btn inline-flex min-h-[32px] items-center justify-center gap-1 rounded-lg border border-hairline bg-obsidian px-2 py-1 text-xs font-semibold text-ink hover:bg-panel-raised"
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
                  className="tactile-btn inline-flex min-h-[32px] items-center justify-center gap-1 rounded-lg border border-signal-rose/40 bg-signal-rose/10 px-2 py-1 text-xs font-semibold text-signal-rose hover:bg-signal-rose hover:text-primary-ink"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Quitter</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="minuto-btn flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
            >
              <UserCircle2 className="h-4 w-4 shrink-0" />
              <span className="lbl">Se connecter</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-hairline bg-panel px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/Logo_ensae.png"
            alt="Logo ENSAE Dakar"
            width={26}
            height={26}
            className="object-contain"
            priority
          />
          <span className="font-display text-base font-bold text-ink">
            ENSAE Hub
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="rounded-full border border-hairline bg-obsidian p-2 text-ink"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-signal-amber" />
            ) : (
              <Moon className="h-4 w-4 text-telemetry" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-xl border border-hairline bg-obsidian p-2 text-ink"
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
        <nav className="animate-enter border-b border-hairline bg-panel px-4 py-3 lg:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-[42px] items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold ${
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
            <div className="mt-2 flex gap-2 border-t border-hairline pt-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 rounded-xl border border-hairline px-3 py-2 text-center text-xs font-semibold text-ink"
              >
                {user ? `${user.name} (${user.promo})` : "Mon compte"}
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-telemetry px-3 py-2 text-xs font-semibold text-primary-ink"
              >
                Changer
              </Link>
            </div>
          </div>
        </nav>
      ) : null}

      {/* Content Canvas */}
      <main
        key={pathname}
        className="animate-enter mx-auto w-full max-w-6xl flex-1 px-5 py-7 sm:px-9 sm:py-8"
      >
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-hairline bg-pastel1 px-3.5 py-2.5 text-xs text-ink-muted">
          <span className="rounded-md bg-panel px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-telemetry">
            Démo
          </span>
          <p>Phase de démonstration · les profils et contenus affichés sont des exemples.</p>
        </div>
        {children}
      </main>
    </div>
  );
}
