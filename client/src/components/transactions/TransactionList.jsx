import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMoney } from "@/lib/utils";
import TransactionItem from "./TransactionItem";
import TransactionForm from "./TransactionForm";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

// compact=true → dashboard "recent" mode: no pagination
// groupLabels="relative" (default, "Today" / "Yesterday" / dates) or "date" (Transactions page: "EEE, d MMM yyyy")
export default function TransactionList({ compact = false, groupLabels = "relative" }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const { items, total, filters, loading, setFilters, remove } = useTransactionStore();
  const [editing, setEditing] = useState(null);

  const pages = Math.max(1, Math.ceil(total / filters.limit));

  const handleDelete = (item) => {
    if (window.confirm(`Delete "${item.title}"?`)) remove(item.id);
  };

  const shouldGroup = compact || groupLabels === "date";

  // Group items by date for compact (Dashboard) or date mode (Transactions page)
  const grouped = useMemo(() => {
    if (!shouldGroup) return null;
    const groups = [];
    let current = null;
    for (const it of items) {
      const dateKey = it.date;
      if (!current || current.dateKey !== dateKey) {
        let label = "";
        if (groupLabels === "date") {
          try {
            label = format(parseISO(dateKey), "EEE, d MMM yyyy");
          } catch {
            label = dateKey;
          }
        } else {
          try {
            const d = parseISO(dateKey);
            label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "d MMM yyyy");
          } catch {
            label = dateKey;
          }
        }
        current = {
          dateKey,
          label,
          items: [],
        };
        groups.push(current);
      }
      current.items.push(it);
    }
    return groups;
  }, [items, shouldGroup, groupLabels]);

  if (loading && !items.length)
    return (
      <div className="space-y-3 py-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );

  if (!items.length)
    return (
      <EmptyState
        icon={ReceiptText}
        title="No transactions yet"
        text="Tap the + button to log your first expense or income."
      />
    );

  return (
    <>
      {shouldGroup && grouped ? (
        <div className="space-y-3">
          {grouped.map((group) => {
            const net = group.items.reduce((sum, it) => {
              const val = Number(it.amount) || 0;
              return it.type === "income" ? sum + val : sum - val;
            }, 0);

            return (
              <section
                key={group.dateKey}
                aria-labelledby={`group-heading-${group.dateKey}`}
                className="space-y-1"
              >
                <div className="flex items-center justify-between px-1 pb-1 pt-3">
                  <h3
                    id={`group-heading-${group.dateKey}`}
                    className="text-xs font-semibold uppercase tracking-wider text-ink/45"
                  >
                    {group.label}
                  </h3>
                  {groupLabels === "date" && (
                    <span className="text-xs font-medium tabular-nums text-ink/45">
                      {net > 0
                        ? `+${formatMoney(net, currency)}`
                        : net < 0
                          ? `−${formatMoney(Math.abs(net), currency)}`
                          : formatMoney(0, currency)}
                    </span>
                  )}
                </div>
                <ul className={`divide-y divide-line/60 transition-opacity ${loading ? "opacity-60" : ""}`}>
                  {group.items.map((it) => (
                    <TransactionItem
                      key={it.id}
                      item={it}
                      onEdit={setEditing}
                      onDelete={handleDelete}
                      hideDate={groupLabels === "date"}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className={`divide-y divide-line/60 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {items.map((it) => (
            <TransactionItem key={it.id} item={it} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      {!compact && pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button variant="secondary" size="sm" disabled={filters.page <= 1} onClick={() => setFilters({ page: filters.page - 1 })}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-ink/60">
            Page {filters.page} of {pages}
          </span>
          <Button variant="secondary" size="sm" disabled={filters.page >= pages} onClick={() => setFilters({ page: filters.page + 1 })}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit transaction">
        {editing && <TransactionForm initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
