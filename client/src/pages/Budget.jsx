import { useAuthStore } from "@/store/useAuthStore";
import { useBudget } from "@/hooks/useBudget";
import { formatMoney, formatDate } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import BudgetBar from "@/components/budget/BudgetBar";
import BudgetForm from "@/components/budget/BudgetForm";
import HealthBadge from "@/components/budget/HealthBadge";
import CountUp from "@/components/common/CountUp";

export default function Budget() {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const { data, loading, save } = useBudget();

  if (loading && !data) return <Skeleton className="h-80" />;
  const b = data?.budget;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Budget</h1>

      {b && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/60 capitalize">{b.period} budget</p>
              <p className="text-xs text-ink/50">
                {formatDate(data.window.from)} – {formatDate(data.window.to)}
              </p>
            </div>
            <HealthBadge level={data.level} />
          </div>

          <p className="mb-3 text-3xl font-extrabold">
            <CountUp value={data.spent} />
            <span className="text-base font-semibold text-ink/50"> / {formatMoney(b.limit_amount, currency)}</span>
          </p>
          <BudgetBar percent={data.percent} />
          <p className="mt-3 text-sm text-ink/65">
            {data.percent}% used ·{" "}
            {data.remaining >= 0
              ? `${formatMoney(data.remaining, currency)} remaining`
              : `${formatMoney(-data.remaining, currency)} over limit`}
          </p>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-bold">{b ? "Change budget" : "Set your budget"}</h2>
        <BudgetForm key={b?.id ?? "new"} initial={b} onSave={save} />
      </Card>
    </div>
  );
}
