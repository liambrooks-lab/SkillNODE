import { cn } from "./cn";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "glass-border rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl shadow-[0_30px_90px_-52px_rgba(2,6,23,0.95)] transition duration-300",
        className,
      )}
      {...props}
    />
  );
}

