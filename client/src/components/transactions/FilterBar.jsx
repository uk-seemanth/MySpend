import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { EMPTY_FILTERS, useTransactionStore } from "@/store/useTransactionStore";
import { useDebounce } from "@/hooks/useDebounce";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function FilterBar() {
  const { filters, categories, setFilters } = useTransactionStore();

  // search + amount fields are debounced so we don't hit the API per keystroke
  const [q, setQ] = useState(filters.q);
  const [min, setMin] = useState(filters.min);
  const [max, setMax] = useState(filters.max);
  const dq = useDebounce(q);
  const dmin = useDebounce(min);
  const dmax = useDebounce(max);

  useEffect(() => {
    if (dq !== filters.q || dmin !== filters.min || dmax !== filters.max)
      setFilters({ q: dq, min: dmin, max: dmax });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, dmin, dmax]);

  const clear = () => {
    setQ("");
    setMin("");
    setMax("");
    setFilters(EMPTY_FILTERS, { replace: true });
  };

  const active = Object.entries(filters).some(
    ([k, v]) => !["page", "limit"].includes(k) && v !== ""
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
        <Input
          type="search"
          aria-label="Search transactions"
          placeholder="Search title or note"
          className="pl-10"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Input as="select" aria-label="Type" value={filters.type} onChange={(e) => setFilters({ type: e.target.value })}>
          <option value="">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </Input>
        <Input as="select" aria-label="Category" value={filters.category_id} onChange={(e) => setFilters({ category_id: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>● {c.name}</option>
          ))}
        </Input>
        <Input type="date" aria-label="From date" value={filters.from} onChange={(e) => setFilters({ from: e.target.value })} />
        <Input type="date" aria-label="To date" value={filters.to} onChange={(e) => setFilters({ to: e.target.value })} />
        <Input type="number" inputMode="decimal" step="any" aria-label="Minimum amount" placeholder="Min amount" value={min} onChange={(e) => setMin(e.target.value)} />
        <Input type="number" inputMode="decimal" step="any" aria-label="Maximum amount" placeholder="Max amount" value={max} onChange={(e) => setMax(e.target.value)} />
        {active && (
          <Button variant="ghost" onClick={clear} className="col-span-2 md:col-span-1">
            <X className="h-4 w-4" /> Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
