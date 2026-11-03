import { motion } from "framer-motion";
import { HEALTH, getHealthKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

function interpolateColor(percent) {
  // 0-50: green, 50-75: olive-yellow, 75-100: orange, 100+: red
  if (percent <= 50) return HEALTH.safe.hex;
  if (percent <= 75) {
    const t = (percent - 50) / 25;
    return lerpHex(HEALTH.safe.hex, HEALTH.caution.hex, t);
  }
  if (percent <= 100) {
    const t = (percent - 75) / 25;
    return lerpHex(HEALTH.warning.hex, HEALTH.danger.hex, t);
  }
  return HEALTH.danger.hex;
}

function lerpHex(a, b, t) {
  const parse = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const c = (v1, v2) => Math.round(v1 + (v2 - v1) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
}

const TICKS = [50, 75, 100];

export default function BudgetBar({ percent = 0, className }) {
  const width = Math.min(percent, 100);
  const barColor = interpolateColor(percent);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Budget used"
      className={cn("relative h-3.5 w-full overflow-hidden rounded-full bg-ink/10", className)}
    >
      {/* Tick marks */}
      {TICKS.map((tick) => (
        <div
          key={tick}
          className="absolute top-0 h-full w-px bg-ink/20"
          style={{ left: `${tick}%` }}
          aria-hidden
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-ink/40 tabular-nums">
            {tick}%
          </span>
        </div>
      ))}

      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: barColor }}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}
