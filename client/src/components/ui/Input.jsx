import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const baseFieldClass =
  "w-full min-w-0 rounded-xl border border-line bg-bg px-3.5 text-sm text-ink placeholder:text-ink/40 transition focus:border-olive focus:outline-none";

// Works for <input>, <select> (as="select") and <textarea> (as="textarea")
const Input = forwardRef(function Input(
  { label, error, as: Tag = "input", type, inputMode, className, children, ...props },
  ref
) {
  const id = useId();
  const isTextarea = Tag === "textarea";
  const calculatedInputMode = inputMode || (type === "number" ? "decimal" : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      <Tag
        id={id}
        ref={ref}
        type={Tag === "input" ? type : undefined}
        inputMode={calculatedInputMode}
        aria-invalid={!!error}
        className={cn(
          baseFieldClass,
          isTextarea ? "py-2.5" : "h-11 py-2",
          error && "border-health-danger",
          className
        )}
        {...props}
      >
        {children}
      </Tag>
      {error && <p className="text-xs text-health-danger">{error}</p>}
    </div>
  );
});
export default Input;
