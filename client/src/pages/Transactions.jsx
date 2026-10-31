import { useEffect } from "react";
import { Download } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FilterBar from "@/components/transactions/FilterBar";
import TransactionList from "@/components/transactions/TransactionList";

export default function Transactions() {
  const { setFilters, downloadCsv, total } = useTransactionStore();

  useEffect(() => {
    setFilters({}, { replace: true });
  }, [setFilters]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Transactions</h1>
          <p className="text-sm text-ink/60">{total} found</p>
        </div>
        <Button variant="secondary" onClick={() => downloadCsv()}>
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>
      <Card><FilterBar /></Card>
      <Card><TransactionList /></Card>
    </div>
  );
}
