import Card from "@/components/ui/Card";
import CountUp from "./CountUp";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, tone = "", iconBg = "bg-olive/15", iconColor = "text-olive" }) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", iconBg, iconColor)}>
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink/60">{label}</p>
        <CountUp value={value} className={`truncate text-xl font-extrabold ${tone}`} />
      </div>
    </Card>
  );
}
