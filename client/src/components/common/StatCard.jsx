import Card from "@/components/ui/Card";
import CountUp from "./CountUp";

export default function StatCard({ label, value, icon: Icon, tone = "" }) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-olive/15 text-olive">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      )}
      <div>
        <p className="text-sm text-ink/60">{label}</p>
        <CountUp value={value} className={`text-xl font-extrabold ${tone}`} />
      </div>
    </Card>
  );
}
