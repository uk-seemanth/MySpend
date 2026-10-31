import { useCountUp } from "@/hooks/useCountUp";
import { formatMoney } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export default function CountUp({ value = 0, className }) {
  const currency = useAuthStore((s) => s.profile?.currency ?? "USD");
  const v = useCountUp(value);
  return <span className={className}>{formatMoney(v, currency)}</span>;
}
