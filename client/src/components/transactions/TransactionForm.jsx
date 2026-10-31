import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema } from "@/schemas/transaction";
import { useTransactionStore } from "@/store/useTransactionStore";
import { toISODate, cn } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// initial = existing transaction (edit) or undefined (add)
export default function TransactionForm({ initial, onDone }) {
  const categories = useTransactionStore((s) => s.categories);
  const add = useTransactionStore((s) => s.add);
  const update = useTransactionStore((s) => s.update);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: initial?.type ?? "expense",
      amount: initial?.amount ?? "",
      title: initial?.title ?? "",
      category_id: initial?.category_id ?? "",
      note: initial?.note ?? "",
      date: initial?.date ?? toISODate(),
    },
  });
  const type = watch("type");

  const onSubmit = async (values) => {
    try {
      if (initial) await update(initial.id, values);
      else await add(values);
      onDone?.();
    } catch {
      /* store already toasted; keep form open */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 gap-1 rounded-xl bg-ink/10 p-1">
        {["expense", "income"].map((t) => (
          <label
            key={t}
            className={cn(
              "cursor-pointer rounded-lg py-2 text-center text-sm font-semibold capitalize transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-olive",
              type === t ? "bg-card text-ink shadow-soft" : "text-ink/60"
            )}
          >
            <input type="radio" value={t} className="sr-only" {...register("type")} />
            {t}
          </label>
        ))}
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        inputMode="decimal"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register("amount")}
      />
      <Input label="Title" placeholder="Lunch, rent, salary…" error={errors.title?.message} {...register("title")} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Category" as="select" error={errors.category_id?.message} {...register("category_id")}>
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Input>
        <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
      </div>

      <Input
        label="Where / note (optional)"
        as="textarea"
        rows={2}
        placeholder="e.g. Café near office"
        error={errors.note?.message}
        {...register("note")}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        {initial ? "Save changes" : "Add transaction"}
      </Button>
    </form>
  );
}
