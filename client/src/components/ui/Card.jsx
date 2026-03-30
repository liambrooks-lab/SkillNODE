import { cn } from "./cn";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_20px_70px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
      {...props}
    />
  );
}

