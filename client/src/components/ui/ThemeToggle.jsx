import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  "dark-purple": { icon: "◐", label: "Dark Purple" },
  "light-blue":  { icon: "○", label: "Light Blue"  },
};

export function ThemeToggle({ className = "", variant = "default" }) {
  const { theme, cycleTheme } = useTheme();
  const current = LABELS[theme] ?? LABELS["dark-purple"];
  const isShell = variant === "shell";

  return (
    <button
      onClick={cycleTheme}
      className={className}
      title={`Theme: ${current.label} — click to switch`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: isShell ? "10px 12px" : "6px 12px",
        borderRadius: isShell ? "12px" : "8px",
        border: isShell ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--border)",
        background: isShell ? "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))" : "var(--surface-2)",
        color: "var(--text-muted)",
        fontSize: isShell ? "0.8rem" : "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.04em",
        transition: "border-color 0.15s, color 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isShell ? "rgba(248,113,113,0.28)" : "var(--border-hover)";
        e.currentTarget.style.color = "var(--text)";
        if (isShell) {
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.18)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isShell ? "rgba(255,255,255,0.08)" : "var(--border)";
        e.currentTarget.style.color = "var(--text-muted)";
        if (isShell) {
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <span style={{ fontSize: "1rem" }}>{current.icon}</span>
      {current.label}
    </button>
  );
}
