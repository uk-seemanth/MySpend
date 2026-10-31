import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney } from "@/lib/utils";
import { compact, formatBucket, tooltipStyle, EXPENSE_COLOR } from "./shared";

// Cumulative spend over the selected range
export default function TrendLine({ data = [], height = 260 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  return (
    <div className="w-full text-ink" style={{ height }} role="img" aria-label="Cumulative spending trend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="label" tickFormatter={formatBucket} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={compact} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={formatBucket} formatter={(v) => [formatMoney(v, currency), "Total spent"]} />
          <Area type="monotone" dataKey="cumulative" stroke={EXPENSE_COLOR} strokeWidth={2.5} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
