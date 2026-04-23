import { cn } from "./cn";

export function Button({
  as: Comp = "button",
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const variants = {
    primary:   "btn btn-primary",
    secondary: "btn btn-secondary",
    ghost:     "btn btn-ghost",
    danger:    "btn btn-danger",
  };
  const sizes = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };
  return (
    <Comp
      className={cn(variants[variant] ?? variants.primary, sizes[size], className)}
      {...props}
    />
  );
}
