import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney } from "@/lib/utils";
import { tooltipStyle } from "./shared";

export default function CategoryDonut({ data = [], height = 220 }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full max-w-[220px]" style={{ height }} role="img" aria-label="Spending by category">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatMoney(v, currency)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs text-ink/55">Spent</p>
            <p className="text-sm font-bold">{formatMoney(total, currency)}</p>
          </div>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
            <span className="flex-1 font-medium">{d.name}</span>
            <span className="text-ink/60">{total ? Math.round((d.total / total) * 100) : 0}%</span>
            <span className="w-24 text-right font-semibold">{formatMoney(d.total, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
