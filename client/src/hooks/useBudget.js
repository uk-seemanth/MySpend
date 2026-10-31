import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useTransactionStore } from "@/store/useTransactionStore";

// Toast once per (window, limit, level) so reloads don't nag
function maybeAlert(data, currency) {
  if (!data?.budget) return;
  const { percent, window, budget, spent } = data;
  const level = percent >= 100 ? 100 : percent >= 80 ? 80 : 0;
  if (!level) return;

  const key = `myspend-alert-${window.from}-${budget.limit_amount}-${level}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");

  const money = `${formatMoney(spent, currency)} of ${formatMoney(budget.limit_amount, currency)}`;
  if (level === 100) toast.error(`Over budget! ${money} spent.`);
  else toast.warning(`Heads up: 80% of budget used. ${money}.`);
}

export function useBudget() {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const revision = useTransactionStore((s) => s.revision);

  const [data, setData] = useState(null); // { budget, spent, remaining, percent, level, window }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get("/budget");
      setData(data);
      maybeAlert(data, currency);
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    load();
  }, [load, revision]);

  const save = async (values) => {
    try {
      await api.put("/budget", values);
      toast.success("Budget saved");
      await load();
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  };

  return { data, loading, error, save, refetch: load };
}
