import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 transition focus:border-olive";

// Works for <input>, <select> (as="select") and <textarea> (as="textarea")
const Input = forwardRef(function Input(
  { label, error, as: Tag = "input", className, children, ...props },
  ref
) {
  const id = useId();
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
        aria-invalid={!!error}
        className={cn(fieldClass, error && "border-health-danger", className)}
        {...props}
      >
        {children}
      </Tag>
      {error && <p className="text-xs text-health-danger">{error}</p>}
    </div>
  );
});
export default Input;
