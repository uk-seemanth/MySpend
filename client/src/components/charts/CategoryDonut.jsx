import { useState, useCallback } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney, cn } from "@/lib/utils";
import { tooltipStyle } from "./shared";

function ActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx} cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export default function CategoryDonut({ data = [], height = 220 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const total = data.reduce((s, d) => s + d.total, 0);
  const [activeIndex, setActiveIndex] = useState(-1);

  const onLegendEnter = useCallback((i) => setActiveIndex(i), []);
  const onLegendLeave = useCallback(() => setActiveIndex(-1), []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        className="relative h-[220px] w-full max-w-[220px] shrink-0"
        style={{ height }}
        role="img"
        aria-label="Spending by category"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={ActiveShape}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.name}
                  fill={d.color}
                  opacity={activeIndex >= 0 && activeIndex !== i ? 0.35 : 1}
                  style={{ transition: "opacity 0.2s" }}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatMoney(v, currency)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs text-ink/55">Spent</p>
            <p className="text-sm font-bold tabular-nums">{formatMoney(total, currency)}</p>
          </div>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2">
        {data.map((d, i) => (
          <li
            key={d.name}
            className={cn(
              "flex cursor-default items-center gap-2.5 rounded-lg px-2 py-1 text-sm transition",
              activeIndex === i ? "bg-ink/5" : ""
            )}
            onMouseEnter={() => onLegendEnter(i)}
            onMouseLeave={onLegendLeave}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate font-medium">{d.name}</span>
            <span className="shrink-0 text-ink/60 tabular-nums">
              {total ? Math.round((d.total / total) * 100) : 0}%
            </span>
            <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
              {formatMoney(d.total, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
