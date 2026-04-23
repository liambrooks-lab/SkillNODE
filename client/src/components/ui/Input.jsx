import { cn } from "./cn";

export function Input({ className, as: Comp = "input", ...props }) {
  return (
    <Comp
      className={cn("field", className)}
      {...props}
    />
  );
}
