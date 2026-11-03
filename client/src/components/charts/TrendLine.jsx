import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney, cn } from "@/lib/utils";
import { compact, formatBucket, tooltipStyle, EXPENSE_COLOR } from "./shared";

export default function TrendLine({ data = [], categories = [], height = 260 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const [split, setSplit] = useState(false);

  // Safe category list with clean keys
  const resolvedCategories = useMemo(() => {
    let list = Array.isArray(categories) && categories.length > 0 ? categories : [];
    if (!list.length && Array.isArray(data)) {
      const names = new Set();
      for (const bucket of data) {
        if (bucket.expenseByCategory) {
          Object.keys(bucket.expenseByCategory).forEach((k) => names.add(k));
        }
      }
      list = Array.from(names).map((name) => ({ name }));
    }
    return list.map((cat, idx) => ({
      key: `t_cat_${idx}`,
      name: cat.name,
      color: cat.color || "#8A8A7A",
    }));
  }, [categories, data]);

  // Build per-category cumulative data when split mode is on
  const splitData = useMemo(() => {
    if (!split || !resolvedCategories.length) return data;
    const running = {};
    return data.map((bucket) => {
      const row = { label: bucket.label };
      for (const cat of resolvedCategories) {
        const val = Number(bucket.expenseByCategory?.[cat.name]) || 0;
        running[cat.name] = (running[cat.name] ?? 0) + val;
        row[cat.key] = running[cat.name];
      }
      return row;
    });
  }, [data, resolvedCategories, split]);

  return (
    <div className="space-y-3">
      {resolvedCategories.length > 0 && (
        <div className="flex">
          <div className="inline-flex gap-0.5 rounded-lg bg-ink/10 p-0.5 text-xs font-semibold">
            {[{ key: false, label: "Total" }, { key: true, label: "By category" }].map((v) => (
              <button
                key={String(v.key)}
                type="button"
                className={cn(
                  "rounded-md px-3 py-1.5 transition",
                  split === v.key ? "bg-card text-ink shadow-soft" : "text-ink/55 hover:text-ink"
                )}
                onClick={() => setSplit(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full text-ink" style={{ height }} role="img" aria-label="Cumulative spending trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={split ? splitData : data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <defs>
              {!split && (
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
                </linearGradient>
              )}
              {split && resolvedCategories.map((cat, idx) => (
                <linearGradient key={cat.key} id={`trendFill-c${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cat.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={cat.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
            <XAxis dataKey="label" tickFormatter={formatBucket} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={compact} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={formatBucket}
              formatter={(v, name) => [formatMoney(v, currency), name === "cumulative" ? "Total spent" : name]}
            />
            {!split ? (
              <Area type="monotone" dataKey="cumulative" stroke={EXPENSE_COLOR} strokeWidth={2.5} fill="url(#trendFill)" />
            ) : (
              resolvedCategories.map((cat, idx) => (
                <Area
                  key={cat.key}
                  type="monotone"
                  dataKey={cat.key}
                  name={cat.name}
                  stroke={cat.color}
                  strokeWidth={2}
                  fill={`url(#trendFill-c${idx})`}
                  stackId="cat"
                />
              ))
            )}
            {split && <Legend iconType="circle" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
