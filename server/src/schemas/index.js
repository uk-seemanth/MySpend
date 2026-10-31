import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const emptyToUndefined = (val) => (val === "" || val === null || val === undefined ? undefined : val);

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive().max(1_000_000_000),
  title: z.string().trim().min(1, "Title required").max(100),
  category_id: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
  date,
});

export const transactionQuerySchema = z.object({
  type: z.preprocess(emptyToUndefined, z.enum(["income", "expense"]).optional()),
  category_id: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  from: z.preprocess(emptyToUndefined, date.optional()),
  to: z.preprocess(emptyToUndefined, date.optional()),
  min: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  max: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(20)),
});

export const budgetSchema = z.object({
  period: z.enum(["weekly", "monthly"]),
  limit_amount: z.coerce.number().positive().max(1_000_000_000),
});

export const analyticsQuerySchema = z.object({
  from: z.preprocess(emptyToUndefined, date.optional()),
  to: z.preprocess(emptyToUndefined, date.optional()),
  groupBy: z.preprocess(emptyToUndefined, z.enum(["day", "week", "month"]).default("day")),
});
