import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  image: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  image,
  action,
}: PageHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] shadow-sm"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(10,12,20,.82), rgba(10,12,20,.42)), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-white/85">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}
