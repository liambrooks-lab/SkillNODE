import { cn } from "./cn";

export function Button({
  as: Comp = "button",
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition duration-200 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-[linear-gradient(135deg,#7dd3fc_0%,#34d399_100%)] text-slate-950 shadow-[0_18px_40px_-18px_rgba(52,211,153,0.95)] hover:brightness-105",
    secondary:
      "border border-white/10 bg-white/10 text-white hover:bg-white/15",
    ghost: "text-white hover:bg-white/10",
    danger:
      "bg-[linear-gradient(135deg,#fb7185_0%,#f97316_100%)] text-white shadow-[0_18px_40px_-18px_rgba(251,113,133,0.8)] hover:brightness-105",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

