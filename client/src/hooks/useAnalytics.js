import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cleanParams } from "@/lib/utils";
import { useTransactionStore } from "@/store/useTransactionStore";

// params: { from, to, groupBy: "day" | "week" | "month" }
export function useAnalytics(params = {}) {
  const revision = useTransactionStore((s) => s.revision);
  const key = JSON.stringify(params);

  const [data, setData] = useState(null); // { totals, series, byCategory, range }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get("/analytics/summary", { params: cleanParams(JSON.parse(key)) })
      .then((res) => !cancelled && setData(res.data))
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        toast.error(e.message);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [key, revision]);

  return { data, loading, error };
}
