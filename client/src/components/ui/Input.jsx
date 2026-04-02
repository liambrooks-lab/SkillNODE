import { cn } from "./cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-[#0f1318] px-4 text-sm text-white placeholder:text-white/35",
        "focus:border-white/25 focus:bg-[#131820] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

