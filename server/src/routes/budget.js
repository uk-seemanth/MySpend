import { Router } from "express";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { validate } from "../middleware/validate.js";
import { budgetSchema } from "../schemas/index.js";
import { healthLevel } from "../utils/health.js";

const router = Router();
const fmt = (d) => format(d, "yyyy-MM-dd");

function currentWindow(period) {
  const now = new Date();
  return period === "weekly"
    ? { from: fmt(startOfWeek(now, { weekStartsOn: 1 })), to: fmt(endOfWeek(now, { weekStartsOn: 1 })) }
    : { from: fmt(startOfMonth(now)), to: fmt(endOfMonth(now)) };
}

// GET /api/budget → budget + how much spent in current week/month
router.get("/", async (req, res) => {
  const { data: budget, error } = await req.db.from("budgets").select("*").maybeSingle();
  if (error) throw error;
  if (!budget) return res.json({ budget: null });

  const { from, to } = currentWindow(budget.period);
  const { data: rows, error: spendError } = await req.db
    .from("transactions")
    .select("amount")
    .eq("type", "expense")
    .gte("date", from)
    .lte("date", to);
  if (spendError) throw spendError;

  const spent = rows.reduce((sum, r) => sum + Number(r.amount), 0);
  const limit = Number(budget.limit_amount);
  const percent = Math.round((spent / limit) * 1000) / 10;

  res.json({ budget, window: { from, to }, spent, remaining: limit - spent, percent, level: healthLevel(percent) });
});

// PUT /api/budget → create or replace the user's budget
router.put("/", validate(budgetSchema), async (req, res) => {
  const { data, error } = await req.db
    .from("budgets")
    .upsert(
      { ...req.valid.body, user_id: req.user.id, start_date: fmt(new Date()) },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export default router;
