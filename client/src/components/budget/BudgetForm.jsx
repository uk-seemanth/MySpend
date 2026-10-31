import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetFormSchema } from "@/schemas/budget";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function BudgetForm({ initial, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      period: initial?.period ?? "monthly",
      limit_amount: initial?.limit_amount ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
      <Input label="Period" as="select" error={errors.period?.message} {...register("period")}>
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly (Mon–Sun)</option>
      </Input>
      <Input
        label="Spending limit"
        type="number"
        step="0.01"
        inputMode="decimal"
        placeholder="500"
        error={errors.limit_amount?.message}
        {...register("limit_amount")}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Save budget
      </Button>
    </form>
  );
}
