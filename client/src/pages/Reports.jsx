import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { EMPTY_FILTERS, useTransactionStore } from "@/store/useTransactionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney, toISODate } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/common/StatCard";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import CategoryDonut from "@/components/charts/CategoryDonut";

export default function Reports() {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const downloadCsv = useTransactionStore((s) => s.downloadCsv);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const { from, to } = useMemo(() => {
    const d = parseISO(`${month || format(new Date(), "yyyy-MM")}-01`);
    return { from: toISODate(startOfMonth(d)), to: toISODate(endOfMonth(d)) };
  }, [month]);

  const { data, loading } = useAnalytics({ from, to, groupBy: "month" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Monthly report</h1>
          <p className="text-sm text-ink/60">Pick a month to review.</p>
        </div>
        <div className="flex items-end gap-3">
          <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button variant="secondary" onClick={() => downloadCsv({ ...EMPTY_FILTERS, from, to })}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Income" value={data?.totals.income ?? 0} icon={ArrowDownCircle} tone="text-health-safe" />
            <StatCard label="Expenses" value={data?.totals.expense ?? 0} icon={ArrowUpCircle} />
            <StatCard label="Balance" value={data?.totals.balance ?? 0} icon={Scale} />
          </div>

          <Card>
            <h2 className="mb-3 font-bold">Spending by category</h2>
            {data?.byCategory.length ? (
              <CategoryDonut data={data.byCategory} />
            ) : (
              <p className="text-sm text-ink/60">No expenses in {format(parseISO(from), "MMMM yyyy")}.</p>
            )}
          </Card>

          {data?.byCategory.length > 0 && (
            <Card>
              <h2 className="mb-2 font-bold">Top category</h2>
              <p className="text-sm text-ink/70">
                {data.byCategory[0].name} took the biggest share: {formatMoney(data.byCategory[0].total, currency)}.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
