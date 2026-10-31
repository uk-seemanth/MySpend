import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { transactionQuerySchema } from "../schemas/index.js";
import { applyFilters } from "../utils/filters.js";

const router = Router();

// Escape quotes/commas and block spreadsheet formula injection (=, +, -, @)
function cell(value) {
  let s = String(value ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /api/export/csv  — accepts the same filters as /api/transactions
router.get(
  "/csv",
  validate(transactionQuerySchema.omit({ page: true, limit: true }), "query"),
  async (req, res) => {
    const base = req.db
      .from("transactions")
      .select("date, title, type, amount, note, category:categories(name)");

    const { data, error } = await applyFilters(base, req.valid.query)
      .order("date", { ascending: false })
      .limit(5000);
    if (error) throw error;

    const header = ["date", "title", "category", "type", "amount", "note"];
    const lines = data.map((r) =>
      [r.date, r.title, r.category?.name, r.type, r.amount, r.note].map(cell).join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="my-spend-export.csv"');
    res.send(csv);
  }
);

export default router;
