import { format, parseISO } from "date-fns";

// "2026-03-05" → "5 Mar", "2026-03" → "Mar 26"
export function formatBucket(label = "") {
  try {
    return label.length === 7 ? format(parseISO(`${label}-01`), "MMM yy") : format(parseISO(label), "d MMM");
  } catch {
    return label;
  }
}

export const compact = (n) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const tooltipStyle = {
  background: "rgb(var(--card))",
  border: "1px solid rgb(var(--line))",
  borderRadius: 12,
  color: "rgb(var(--ink))",
  fontSize: 13,
};

export const INCOME_COLOR = "#7F9142";
export const EXPENSE_COLOR = "#D98F3E";
