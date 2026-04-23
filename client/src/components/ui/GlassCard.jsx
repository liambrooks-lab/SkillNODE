import { cn } from "./cn";

export function GlassCard({ className, ...props }) {
  return (
    <div className={cn("glass-card", className)} {...props} />
  );
}
