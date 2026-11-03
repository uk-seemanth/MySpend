import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { formatMoney, cn } from "@/lib/utils";
import { compact, formatBucket, tooltipStyle, INCOME_COLOR, EXPENSE_COLOR } from "./shared";

const VIEWS = [
  { key: "byCategory", label: "By category" },
  { key: "incomeVsExpense", label: "Income vs Expense" },
];

function CategoryTooltip({ active, payload, label, currency, keyCategoryMap }) {
  if (!active || !payload || !payload.length) return null;

  const rowData = payload[0]?.payload;
  const total = rowData?._total ?? 0;

  // Filter only categories with value > 0 and sort descending
  const activeItems = payload
    .filter((item) => Number(item.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value));

  return (
    <div
      style={tooltipStyle}
      className="p-3 shadow-lift min-w-[180px] space-y-2 pointer-events-none"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line/60 pb-1.5 text-xs">
        <span className="font-bold text-ink">{formatBucket(label)}</span>
        <span className="font-extrabold tabular-nums text-ink/75">
          Total: {formatMoney(total, currency)}
        </span>
      </div>

      {activeItems.length === 0 ? (
        <p className="text-xs text-ink/50 py-0.5">No transactions</p>
      ) : (
        <div className="space-y-1">
          {activeItems.map((item) => {
            const cat = keyCategoryMap?.[item.dataKey] ?? {
              name: item.name,
              color: item.fill || item.color,
            };
            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden
                  />
                  <span className="truncate text-ink/80">{cat.name}</span>
                </div>
                <span className="font-semibold tabular-nums text-ink shrink-0">
                  {formatMoney(item.value, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SpendBarChart({ data = [], categories = [], height = 280 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const storeCategories = useTransactionStore((s) => s.categories);
  const [view, setView] = useState("byCategory");
  const [subType, setSubType] = useState("expense"); // for byCategory view

  // 1. Resolve category list from prop or derive from series data
  const resolvedCategories = useMemo(() => {
    let list = Array.isArray(categories) && categories.length > 0 ? categories : [];

    // If categories array is missing or empty, derive from series data
    if (!list.length && Array.isArray(data)) {
      const names = new Set();
      for (const bucket of data) {
        if (bucket.expenseByCategory) {
          Object.keys(bucket.expenseByCategory).forEach((k) => names.add(k));
        }
        if (bucket.incomeByCategory) {
          Object.keys(bucket.incomeByCategory).forEach((k) => names.add(k));
        }
      }
      list = Array.from(names).map((name) => ({ name }));
    }

    // Attach colors: categories.color is single source of truth, fallback to store or #8A8A7A
    return list.map((cat, idx) => {
      const match = storeCategories.find((c) => c.name === cat.name);
      const color = cat.color || match?.color || "#8A8A7A";
      return {
        key: `c_${idx}`,
        name: cat.name,
        color,
      };
    });
  }, [categories, data, storeCategories]);

  // Lookup map: safe key -> category { key, name, color }
  const keyCategoryMap = useMemo(() => {
    const map = {};
    for (const c of resolvedCategories) {
      map[c.key] = c;
    }
    return map;
  }, [resolvedCategories]);

  // 2. Flatten data for Recharts BarChart (safe keys, 0 for missing values)
  const flattenedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((bucket) => {
      const source = subType === "expense" ? bucket.expenseByCategory : bucket.incomeByCategory;
      const row = {
        label: bucket.label,
        _total: 0,
        _rawBucket: bucket,
      };
      for (const cat of resolvedCategories) {
        const val = Number(source?.[cat.name]) || 0;
        row[cat.key] = val;
        row._total += val;
      }
      return row;
    });
  }, [data, subType, resolvedCategories]);

  // Check if there is any data for the active subType
  const hasCategoryData = useMemo(() => {
    return flattenedData.some((row) => row._total > 0);
  }, [flattenedData]);

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
        {view === "incomeVsExpense" ? (
          <ResponsiveContainer width="100%" height="100%">
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
        ) : !hasCategoryData ? (
          <div
            className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-line/60 bg-ink/5 text-sm text-ink/60"
            style={{ height }}
          >
            {subType === "expense" ? "No expenses in this range" : "No income in this range"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flattenedData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="label" tickFormatter={formatBucket} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={compact} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} tickLine={false} axisLine={false} />
              <Tooltip
                content={<CategoryTooltip currency={currency} keyCategoryMap={keyCategoryMap} />}
                cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
              />
              <Legend iconType="circle" />
              {resolvedCategories.map((cat) => (
                <Bar
                  key={cat.key}
                  dataKey={cat.key}
                  name={cat.name}
                  fill={cat.color}
                  stackId="byCategory"
                  radius={0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
