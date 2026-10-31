import { Router } from "express";
import { format, startOfMonth, endOfMonth, startOfWeek, parseISO } from "date-fns";
import { validate } from "../middleware/validate.js";
import { analyticsQuerySchema } from "../schemas/index.js";

const router = Router();

function bucketKey(dateStr, groupBy) {
  if (groupBy === "month") return dateStr.slice(0, 7);
  if (groupBy === "week") return format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), "yyyy-MM-dd");
  return dateStr;
}

// GET /api/analytics/summary?from=&to=&groupBy=day|week|month   (default: this month)
router.get("/summary", validate(analyticsQuerySchema, "query"), async (req, res) => {
  const now = new Date();
  const {
    from = format(startOfMonth(now), "yyyy-MM-dd"),
    to = format(endOfMonth(now), "yyyy-MM-dd"),
    groupBy,
  } = req.valid.query;

  const { data, error } = await req.db
    .from("transactions")
    .select("date, type, amount, category:categories(name, color)")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .limit(5000);
  if (error) throw error;

  const totals = { income: 0, expense: 0, balance: 0 };
  const series = new Map();   // bucket → { label, income, expense }
  const byCategory = new Map(); // name → { name, color, total }

  for (const row of data) {
    const amount = Number(row.amount);
    totals[row.type] += amount;

    const key = bucketKey(row.date, groupBy);
    const bucket = series.get(key) ?? { label: key, income: 0, expense: 0 };
    bucket[row.type] += amount;
    series.set(key, bucket);

    if (row.type === "expense") {
      const name = row.category?.name ?? "Uncategorised";
      const cat = byCategory.get(name) ?? { name, color: row.category?.color ?? "#8A8A7A", total: 0 };
      cat.total += amount;
      byCategory.set(name, cat);
    }
  }
  totals.balance = totals.income - totals.expense;

  // running expense total → powers the trend line
  let running = 0;
  const seriesList = [...series.values()].map((b) => ({ ...b, cumulative: (running += b.expense) }));

  res.json({
    range: { from, to, groupBy },
    totals,
    series: seriesList,
    byCategory: [...byCategory.values()].sort((a, b) => b.total - a.total),
  });
});

export default router;
