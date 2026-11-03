import { Pencil, Trash2 } from "lucide-react";
import { getCategoryIcon } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export default function TransactionItem({ item, onEdit, onDelete, hideDate = false }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const Icon = getCategoryIcon(item.category?.icon);
  const color = item.category?.color ?? "#8A8A7A";
  const income = item.type === "income";

  return (
    <li className="flex items-center gap-3 py-3 pl-1">
      {/* Colored left accent dot */}
      <span
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${color}26`, color }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{item.title}</p>
        <p className="truncate text-xs text-ink/55">
          {item.category?.name ?? "Uncategorised"}
          {!hideDate ? ` · ${formatDate(item.date)}` : ""}
          {item.note ? ` · ${item.note}` : ""}
        </p>
      </div>

      <p className={`shrink-0 text-right text-sm font-bold tabular-nums ${income ? "text-health-safe" : ""}`}>
        {income ? "+" : "−"}
        {formatMoney(item.amount, currency)}
      </p>

      <div className="flex shrink-0">
        <button
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.title}`}
          className="rounded-lg p-2 text-ink/50 transition hover:bg-ink/10 hover:text-ink focus-visible:ring-2 focus-visible:ring-olive"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.title}`}
          className="rounded-lg p-2 text-ink/50 transition hover:bg-health-danger/15 hover:text-health-danger focus-visible:ring-2 focus-visible:ring-health-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
