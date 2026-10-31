import { z } from "zod";

export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number({ invalid_type_error: "Enter an amount" }).positive("Must be above 0"),
  title: z.string().trim().min(1, "Give it a title").max(100),
  category_id: z.string().optional().transform((v) => v || null), // "" → null
  note: z.string().trim().max(300).optional().transform((v) => v || null),
  date: z.string().min(1, "Pick a date"),
});
