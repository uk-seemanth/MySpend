import { useState } from "react";
import { cn, toISODate } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import SpendBarChart from "@/components/charts/SpendBarChart";
import CategoryDonut from "@/components/charts/CategoryDonut";
import TrendLine from "@/components/charts/TrendLine";

const GROUPS = [
  { key: "day", label: "Daily" },
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
];

export default function Analytics() {
  const [groupBy, setGroupBy] = useState("day");
  const [from, setFrom] = useState(toISODate(startOfMonth(new Date())));
  const [to, setTo] = useState(toISODate(endOfMonth(new Date())));
  const { data, loading } = useAnalytics({ from, to, groupBy });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Analytics</h1>

      <Card className="flex flex-wrap items-end gap-3">
        <div role="group" aria-label="Group by" className="flex rounded-xl bg-ink/10 p-1">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroupBy(g.key)}
              aria-pressed={groupBy === g.key}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-semibold transition",
                groupBy === g.key ? "bg-card shadow-soft" : "text-ink/60"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </Card>

      {loading && !data ? (
        <Skeleton className="h-80" />
      ) : !data?.series.length ? (
        <Card><EmptyState title="Nothing to chart" text="No transactions in this date range." /></Card>
      ) : (
        <>
          <Card>
            <h2 className="mb-3 font-bold">Income vs expenses</h2>
            <SpendBarChart data={data.series} />
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-bold">By category</h2>
              {data.byCategory.length ? <CategoryDonut data={data.byCategory} /> : <p className="text-sm text-ink/60">No expenses in range.</p>}
            </Card>
            <Card>
              <h2 className="mb-3 font-bold">Spending trend</h2>
              <TrendLine data={data.series} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
