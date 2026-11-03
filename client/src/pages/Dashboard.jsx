import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { motion } from "framer-motion";
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
import SpendBarChart from "@/components/charts/SpendBarChart";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };

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
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-extrabold">Hi{profile?.display_name ? `, ${profile.display_name}` : ""} 👋</h1>
        <p className="text-sm text-ink/60">Here's your month so far.</p>
      </motion.div>

      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <motion.div className="grid gap-4 sm:grid-cols-3" variants={stagger}>
          <motion.div variants={fadeUp}>
            <StatCard label="Income" value={t?.income ?? 0} icon={ArrowDownCircle} tone="text-health-safe" iconBg="bg-health-safe/15" iconColor="text-health-safe" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard label="Expenses" value={t?.expense ?? 0} icon={ArrowUpCircle} iconBg="bg-health-danger/15" iconColor="text-health-danger" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard label="Balance" value={t?.balance ?? 0} icon={Scale} />
          </motion.div>
        </motion.div>
      )}

      {/* Spending overview chart */}
      {stats?.series?.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <h2 className="mb-3 font-bold">Spending overview</h2>
            <SpendBarChart data={stats.series} categories={stats.categories ?? []} />
          </Card>
        </motion.div>
      )}

      {/* Spending by category horizontal bars */}
      {stats?.byCategory?.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <h2 className="mb-4 font-bold">Spending by category</h2>
            <div className="space-y-3">
              {stats.byCategory.map((cat) => {
                const maxVal = stats.byCategory[0]?.total || 1;
                const pct = Math.round((cat.total / (stats.totals?.expense || 1)) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} aria-hidden />
                        <span className="truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-ink/50 tabular-nums">{pct}%</span>
                        <span className="w-20 text-right font-semibold tabular-nums">{formatMoney(cat.total, currency)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/8">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.total / maxVal) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Budget</h2>
            {budget?.budget && <HealthBadge level={budget.level} />}
          </div>
          {budget?.budget ? (
            <>
              <BudgetBar percent={budget.percent} className="mt-7" />
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
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-bold">Recent</h2>
            <Link to="/transactions" className="text-sm font-semibold text-olive">View all</Link>
          </div>
          <TransactionList compact />
        </Card>
      </motion.div>
    </motion.div>
  );
}
