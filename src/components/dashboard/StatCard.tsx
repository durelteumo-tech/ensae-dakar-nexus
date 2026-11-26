import type { LucideIcon } from "lucide-react";

type AccentColor = "cyan" | "mint" | "violet" | "amber";

const ACCENT_MAP: Record<
  AccentColor,
  { border: string; iconBg: string; text: string; bar: string }
> = {
  cyan: {
    border: "hover:border-neon-cyan/50",
    iconBg: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
    text: "text-neon-cyan",
    bar: "bg-neon-cyan",
  },
  mint: {
    border: "hover:border-neon-mint/50",
    iconBg: "bg-neon-mint/10 text-neon-mint border-neon-mint/30",
    text: "text-neon-mint",
    bar: "bg-neon-mint",
  },
  violet: {
    border: "hover:border-neon-violet/50",
    iconBg: "bg-neon-violet/10 text-neon-violet border-neon-violet/30",
    text: "text-neon-violet",
    bar: "bg-neon-violet",
  },
  amber: {
    border: "hover:border-neon-amber/50",
    iconBg: "bg-neon-amber/10 text-neon-amber border-neon-amber/30",
    text: "text-neon-amber",
    bar: "bg-neon-amber",
  },
};

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  accent?: AccentColor;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "cyan",
}: StatCardProps) {
  const styles = ACCENT_MAP[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-5 shadow-card-dark transition-all ${styles.border}`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${styles.bar} opacity-75`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${styles.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className={`mt-4 font-mono text-xs font-medium ${styles.text}`}>
        {delta}
      </p>
    </div>
  );
}
