import { cn } from "./cn";

export function Button({
  as: Comp = "button",
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.8)]",
    secondary:
      "bg-white/10 hover:bg-white/15 text-white border border-white/10",
    ghost: "hover:bg-white/10 text-white",
    danger:
      "bg-rose-500/90 hover:bg-rose-500 text-white shadow-[0_10px_30px_-10px_rgba(244,63,94,0.65)]",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

