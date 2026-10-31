import { HEALTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function HealthBadge({ level = "safe", className }) {
  const h = HEALTH[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        h.soft,
        h.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", h.bar)} aria-hidden />
      {h.label}
    </span>
  );
}
