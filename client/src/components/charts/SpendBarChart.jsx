import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney } from "@/lib/utils";
import { compact, formatBucket, tooltipStyle, INCOME_COLOR, EXPENSE_COLOR } from "./shared";

export default function SpendBarChart({ data = [], height = 280 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  return (
    <div className="text-ink" style={{ height }} role="img" aria-label="Income and expenses over time">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="label" tickFormatter={formatBucket} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={compact} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
            labelFormatter={formatBucket}
            formatter={(v) => formatMoney(v, currency)}
          />
          <Legend iconType="circle" />
          <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
