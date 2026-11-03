import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney, cn } from "@/lib/utils";
import { compact, formatBucket, tooltipStyle, INCOME_COLOR, EXPENSE_COLOR } from "./shared";

const VIEWS = [
  { key: "byCategory", label: "By category" },
  { key: "incomeVsExpense", label: "Income vs Expense" },
];

export default function SpendBarChart({ data = [], categories = [], height = 280 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const [view, setView] = useState("byCategory");
  const [subType, setSubType] = useState("expense"); // for byCategory view

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <div className="inline-flex gap-0.5 rounded-lg bg-ink/10 p-0.5 text-xs font-semibold">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 transition",
                view === v.key ? "bg-card text-ink shadow-soft" : "text-ink/55 hover:text-ink"
              )}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Sub-toggle for expense/income in category view */}
        {view === "byCategory" && (
          <div className="inline-flex gap-0.5 rounded-lg bg-ink/10 p-0.5 text-xs font-semibold">
            {["expense", "income"].map((t) => (
              <button
                key={t}
                type="button"
                className={cn(
                  "rounded-md px-2.5 py-1.5 capitalize transition",
                  subType === t ? "bg-card text-ink shadow-soft" : "text-ink/55 hover:text-ink"
                )}
                onClick={() => setSubType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full text-ink" style={{ height }} role="img" aria-label="Spending chart">
        <ResponsiveContainer width="100%" height="100%">
          {view === "incomeVsExpense" ? (
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
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="label" tickFormatter={formatBucket} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={compact} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
                labelFormatter={formatBucket}
                formatter={(v, name) => [formatMoney(v, currency), name]}
              />
              <Legend iconType="circle" />
              {categories.map((cat) => (
                <Bar
                  key={cat.name}
                  dataKey={`${subType === "expense" ? "expenseByCategory" : "incomeByCategory"}.${cat.name}`}
                  name={cat.name}
                  fill={cat.color}
                  stackId="stack"
                  radius={0}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
