import { cn } from "./cn";

export function GlowingBtn({ children, className, size = "md", as: Comp = "button", ...props }) {
  const sizes = { sm: "btn-sm", md: "", lg: "btn-lg" };
  return (
    <Comp
      className={cn("btn btn-primary animate-glow-pulse", sizes[size], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
