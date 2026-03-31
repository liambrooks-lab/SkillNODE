import { cn } from "./cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-sm text-white placeholder:text-white/35 backdrop-blur-xl",
        "focus:border-sky-300/60 focus:bg-slate-950/60 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

