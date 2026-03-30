import { cn } from "./cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/40",
        "focus:border-indigo-400/60 focus:bg-white/7 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

