import { CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

type BadgeVariant = "100% Validé" | "Vérifié Club Info" | "IA Ready";

const BADGE_STYLES: Record<
  BadgeVariant,
  { container: string; icon: typeof CheckCircle2 }
> = {
  "100% Validé": {
    container: "bg-volt/12 text-volt",
    icon: CheckCircle2,
  },
  "Vérifié Club Info": {
    container: "bg-telemetry/12 text-telemetry",
    icon: ShieldCheck,
  },
  "IA Ready": {
    container: "bg-signal-violet/12 text-signal-violet",
    icon: Cpu,
  },
};

interface NeonBadgeProps {
  label: BadgeVariant;
  className?: string;
}

export function NeonBadge({ label, className = "" }: NeonBadgeProps) {
  const style = BADGE_STYLES[label];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${style.container} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
