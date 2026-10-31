import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-olive text-olive-on hover:bg-olive/90 shadow-soft",
  secondary: "border border-line bg-card text-ink hover:bg-ink/5",
  ghost: "text-ink hover:bg-ink/10",
  danger: "bg-health-danger text-white hover:bg-health-danger/90",
};
const SIZES = { sm: "h-9 px-3 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-base" };

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
export default Button;
