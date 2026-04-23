import { cn } from "./cn";

const SIZES = {
  xs: { box: 28, text: "0.72rem", radius: "6px" },
  sm: { box: 36, text: "0.8rem",  radius: "8px" },
  md: { box: 44, text: "0.95rem", radius: "10px" },
  lg: { box: 56, text: "1.1rem",  radius: "12px" },
  xl: { box: 72, text: "1.3rem",  radius: "14px" },
};

export function Avatar({ src, name = "?", size = "md", ring = false, className, style }) {
  const s = SIZES[size] ?? SIZES.md;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  const base = {
    width: s.box,
    height: s.box,
    borderRadius: s.radius,
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: s.text,
    fontWeight: 700,
    background: "var(--accent-dim)",
    color: "var(--accent-bright)",
    border: "1px solid var(--border)",
    ...style,
  };

  return (
    <div
      className={cn(ring && "avatar-ring", className)}
      style={base}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
