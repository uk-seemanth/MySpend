import { z } from "zod";

export const budgetFormSchema = z.object({
  period: z.enum(["weekly", "monthly"]),
  limit_amount: z.coerce.number({ invalid_type_error: "Enter a limit" }).positive("Must be above 0"),
});
