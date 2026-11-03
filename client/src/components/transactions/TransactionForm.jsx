import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema } from "@/schemas/transaction";
import { useTransactionStore } from "@/store/useTransactionStore";
import { toISODate, cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/constants";
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
    setValue,
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
  const selectedCatId = watch("category_id");

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
      {/* Type toggle with colored tints */}
      <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 gap-1 rounded-xl bg-ink/10 p-1">
        {["expense", "income"].map((t) => (
          <label
            key={t}
            className={cn(
              "cursor-pointer rounded-lg py-2 text-center text-sm font-semibold capitalize transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-olive",
              type === t
                ? t === "income"
                  ? "bg-health-safe/15 text-health-safe shadow-soft"
                  : "bg-health-danger/15 text-health-danger shadow-soft"
                : "text-ink/60"
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

      {/* Category chip picker */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/70">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            const selected = selectedCatId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition",
                  "ring-1 ring-inset focus-visible:ring-2 focus-visible:ring-olive",
                  selected
                    ? "shadow-soft ring-transparent"
                    : "ring-line/60 hover:ring-ink/30"
                )}
                style={selected ? { backgroundColor: `${c.color}20`, color: c.color, borderColor: c.color } : undefined}
                onClick={() => setValue("category_id", selected ? "" : c.id, { shouldValidate: true })}
                aria-pressed={selected}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate max-w-[7rem]">{c.name}</span>
              </button>
            );
          })}
        </div>
        {/* Hidden input for form validation */}
        <input type="hidden" {...register("category_id")} />
        {errors.category_id && (
          <p className="mt-1 text-xs text-health-danger">{errors.category_id.message}</p>
        )}
      </div>

      <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />

      <Input
        label="Where / note (optional)"
        as="textarea"
        rows={2}
        placeholder="e.g. Café near office"
        error={errors.note?.message}
        {...register("note")}
      />

      <Button
        type="submit"
        loading={isSubmitting}
        className={cn(
          "w-full",
          type === "income" ? "!bg-health-safe hover:!bg-health-safe/90" : ""
        )}
      >
        {initial ? "Save changes" : type === "income" ? "Add income" : "Add expense"}
      </Button>
    </form>
  );
}
