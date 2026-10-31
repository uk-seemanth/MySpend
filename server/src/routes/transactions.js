import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { transactionSchema, transactionQuerySchema } from "../schemas/index.js";
import { applyFilters } from "../utils/filters.js";

const router = Router();
const withCategory = "*, category:categories(id, name, icon, color)";

// GET /api/transactions?type=&category_id=&from=&to=&min=&max=&q=&page=&limit=
router.get("/", validate(transactionQuerySchema, "query"), async (req, res) => {
  const { page, limit, ...filters } = req.valid.query;
  const start = (page - 1) * limit;

  const base = req.db.from("transactions").select(withCategory, { count: "exact" });
  const { data, count, error } = await applyFilters(base, filters)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(start, start + limit - 1);

  if (error) throw error;
  res.json({ data, total: count, page, limit });
});

router.post("/", validate(transactionSchema), async (req, res) => {
  const { data, error } = await req.db
    .from("transactions")
    .insert({ ...req.valid.body, user_id: req.user.id })
    .select(withCategory)
    .single();

  if (error) throw error;
  res.status(201).json(data);
});

router.put("/:id", validate(transactionSchema), async (req, res) => {
  const { data, error } = await req.db
    .from("transactions")
    .update(req.valid.body)
    .eq("id", req.params.id)
    .select(withCategory)
    .maybeSingle();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Transaction not found" });
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  const { data, error } = await req.db
    .from("transactions")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Transaction not found" });
  res.status(204).end();
});

export default router;
