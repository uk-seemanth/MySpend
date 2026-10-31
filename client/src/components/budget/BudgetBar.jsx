import { motion } from "framer-motion";
import { HEALTH, getHealthKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function BudgetBar({ percent = 0, className }) {
  const key = getHealthKey(percent);
  const width = Math.min(percent, 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Budget used"
      className={cn("h-3.5 w-full overflow-hidden rounded-full bg-ink/10", className)}
    >
      <motion.div
        className={cn("h-full rounded-full", HEALTH[key].bar)}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}
