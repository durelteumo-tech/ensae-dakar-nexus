"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  FolderKanban,
  LayoutDashboard,
  Lock,
  Users,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    sublabel: "Activité & KPIs",
    icon: LayoutDashboard,
  },
  {
    href: "/resources",
    label: "Hub Ressources",
    sublabel: "PDF, R & Python",
    icon: FolderKanban,
  },
  {
    href: "/qcm",
    label: "Générateur QCM",
    sublabel: "IA Académique",
    icon: BrainCircuit,
  },
  {
    href: "/matchmaking",
    label: "Matchmaking",
    sublabel: "Binômes & Projets",
    icon: Users,
  },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border-subtle bg-surface/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-5">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-neon-cyan/40 bg-obsidian p-1 shadow-neon-cyan">
              <Image
                src="/Logo_ensae.png"
                alt="Logo ENSAE Dakar"
                width={38}
                height={38}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-display text-base font-bold tracking-tight text-white">
                ENSAE <span className="text-neon-cyan">NEXUS</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Dakar • Club Info
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-elevated hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label="Navigation principale">
          <div className="px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Espace Étudiant
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 rounded-xl border px-3.5 py-3 transition-all ${
                  isActive
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-white shadow-[0_0_20px_rgba(0,240,255,0.12)]"
                    : "border-transparent text-slate-400 hover:border-border-subtle hover:bg-surface-elevated hover:text-slate-100"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    isActive
                      ? "border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan"
                      : "border-border-subtle bg-obsidian text-slate-400 group-hover:text-neon-cyan"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold leading-tight">
                    {item.label}
                  </div>
                  <div className="truncate text-xs text-slate-500 group-hover:text-slate-400">
                    {item.sublabel}
                  </div>
                </div>
                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-neon-cyan" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Student Session / Auth Link */}
        <div className="border-t border-border-subtle p-4">
          <div className="mb-3 rounded-xl border border-border-subtle bg-obsidian/80 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neon-mint">
                ● Session Active
              </span>
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                ISE 2
              </span>
            </div>
            <p className="mt-1.5 font-display text-sm font-bold text-white">
              Moussa Diop
            </p>
            <p className="truncate font-mono text-xs text-slate-400">
              m.diop@ensae.sn
            </p>
          </div>

          <Link
            href="/login"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-neon-violet/60 hover:text-neon-violet"
          >
            <Lock className="h-3.5 w-3.5" />
            Écran Connexion
          </Link>
        </div>
      </aside>
    </>
  );
}
