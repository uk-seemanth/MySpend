import { useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import TransactionItem from "./TransactionItem";
import TransactionForm from "./TransactionForm";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

// compact=true → dashboard "recent" mode: no pagination
export default function TransactionList({ compact = false }) {
  const { items, total, filters, loading, setFilters, remove } = useTransactionStore();
  const [editing, setEditing] = useState(null);

  const pages = Math.max(1, Math.ceil(total / filters.limit));

  const handleDelete = (item) => {
    if (window.confirm(`Delete "${item.title}"?`)) remove(item.id);
  };

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
      <ul className={`divide-y divide-line/60 transition-opacity ${loading ? "opacity-60" : ""}`}>
        {items.map((it) => (
          <TransactionItem key={it.id} item={it} onEdit={setEditing} onDelete={handleDelete} />
        ))}
      </ul>

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
