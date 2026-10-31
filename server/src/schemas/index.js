import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive().max(1_000_000_000),
  title: z.string().trim().min(1, "Title required").max(100),
  category_id: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
  date,
});

export const transactionQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category_id: z.string().uuid().optional(),
  from: date.optional(),
  to: date.optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const budgetSchema = z.object({
  period: z.enum(["weekly", "monthly"]),
  limit_amount: z.coerce.number().positive().max(1_000_000_000),
});

export const analyticsQuerySchema = z.object({
  from: date.optional(),
  to: date.optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});
