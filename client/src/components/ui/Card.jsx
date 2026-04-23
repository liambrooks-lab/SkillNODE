import { cn } from "./cn";

export function Card({ className, hoverable = true, ...props }) {
  return (
    <div
      className={cn(
        "card",
        hoverable ? "" : "hover:transform-none hover:shadow-[var(--card-shadow)] hover:border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}
