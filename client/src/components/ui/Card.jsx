import { cn } from "./cn";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#1a1f26,#14181e)] shadow-[0_24px_60px_-42px_rgba(0,0,0,0.85)] transition duration-300",
        className,
      )}
      {...props}
    />
  );
}

