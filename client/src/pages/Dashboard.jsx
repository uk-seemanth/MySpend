import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBudget } from "@/hooks/useBudget";
import { formatMoney } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import BudgetBar from "@/components/budget/BudgetBar";
import HealthBadge from "@/components/budget/HealthBadge";
import TransactionList from "@/components/transactions/TransactionList";

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile);
  const currency = profile?.currency ?? "USD";
  const setFilters = useTransactionStore((s) => s.setFilters);
  const { data: stats, loading } = useAnalytics({ groupBy: "day" }); // default = this month
  const { data: budget } = useBudget();

  // recent 6 only
  useEffect(() => {
    setFilters({ limit: 6 }, { replace: true });
  }, [setFilters]);

  const t = stats?.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Hi{profile?.display_name ? `, ${profile.display_name}` : ""} 👋</h1>
        <p className="text-sm text-ink/60">Here's your month so far.</p>
      </div>

      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Income" value={t?.income ?? 0} icon={ArrowDownCircle} tone="text-health-safe" />
          <StatCard label="Expenses" value={t?.expense ?? 0} icon={ArrowUpCircle} />
          <StatCard label="Balance" value={t?.balance ?? 0} icon={Scale} />
        </div>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Budget</h2>
          {budget?.budget && <HealthBadge level={budget.level} />}
        </div>
        {budget?.budget ? (
          <>
            <BudgetBar percent={budget.percent} />
            <p className="mt-3 text-sm text-ink/65">
              {formatMoney(budget.spent, currency)} of {formatMoney(budget.budget.limit_amount, currency)} ({budget.percent}%)
              {" · "}
              {budget.remaining >= 0
                ? `${formatMoney(budget.remaining, currency)} left`
                : `${formatMoney(-budget.remaining, currency)} over`}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink/65">
            No budget yet. <Link to="/budget" className="font-semibold text-olive underline">Set one</Link> to track your limit.
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-bold">Recent</h2>
          <Link to="/transactions" className="text-sm font-semibold text-olive">View all</Link>
        </div>
        <TransactionList compact />
      </Card>
    </div>
  );
}
