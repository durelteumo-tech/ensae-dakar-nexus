import { ArrowUpRight, BrainCircuit, Download, Upload, Users } from "lucide-react";
import type { ActivityItem } from "@/types";
import { NeonBadge } from "@/components/ui/NeonBadge";

const ACTIVITY_ICON_MAP: Record<
  ActivityItem["type"],
  { icon: typeof Upload; color: string }
> = {
  upload: { icon: Upload, color: "text-neon-mint border-neon-mint/30 bg-neon-mint/10" },
  download: { icon: Download, color: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10" },
  qcm: { icon: BrainCircuit, color: "text-neon-violet border-neon-violet/30 bg-neon-violet/10" },
  match: { icon: Users, color: "text-neon-amber border-neon-amber/30 bg-neon-amber/10" },
};

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-card-dark">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Historique d&apos;activité
          </h2>
          <p className="text-xs text-slate-400">
            Vos dernières interactions sur le campus numérique
          </p>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-xs text-neon-cyan">
          Temps réel <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const meta = ACTIVITY_ICON_MAP[activity.type];
          const Icon = meta.icon;

          return (
            <div
              key={activity.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border-subtle bg-obsidian/70 p-4 transition hover:border-neon-cyan/40 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-sm font-semibold text-white">
                      {activity.title}
                    </h3>
                    {activity.badge === "100% Validé" ||
                    activity.badge === "Vérifié Club Info" ? (
                      <NeonBadge label={activity.badge} />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {activity.detail}
                  </p>
                </div>
              </div>

              <span className="shrink-0 font-mono text-[11px] text-slate-500">
                {activity.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
