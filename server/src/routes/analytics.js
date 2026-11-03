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
  const series = new Map();   // bucket → { label, income, expense, expenseByCategory, incomeByCategory }
  const byCategory = new Map(); // name → { name, color, total }
  const categorySet = new Map(); // name → { name, color }

  for (const row of data) {
    const amount = Number(row.amount);
    totals[row.type] += amount;

    const key = bucketKey(row.date, groupBy);
    const bucket = series.get(key) ?? { label: key, income: 0, expense: 0, expenseByCategory: {}, incomeByCategory: {} };
    bucket[row.type] += amount;

    const catName = row.category?.name ?? "Uncategorised";
    const catColor = row.category?.color ?? "#8A8A7A";

    // per-bucket per-category totals (NEW – additive)
    if (row.type === "expense") {
      bucket.expenseByCategory[catName] = (bucket.expenseByCategory[catName] ?? 0) + amount;
    } else {
      bucket.incomeByCategory[catName] = (bucket.incomeByCategory[catName] ?? 0) + amount;
    }
    series.set(key, bucket);

    // track all categories seen
    if (!categorySet.has(catName)) categorySet.set(catName, { name: catName, color: catColor });

    if (row.type === "expense") {
      const cat = byCategory.get(catName) ?? { name: catName, color: catColor, total: 0 };
      cat.total += amount;
      byCategory.set(catName, cat);
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
    categories: [...categorySet.values()].sort((a, b) => a.name.localeCompare(b.name)), // NEW – additive
  });
});

export default router;
