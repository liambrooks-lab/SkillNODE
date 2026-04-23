import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  "dark-purple": { icon: "◐", label: "Dark Purple" },
  "light-blue":  { icon: "○", label: "Light Blue"  },
};

export function ThemeToggle({ className = "" }) {
  const { theme, cycleTheme } = useTheme();
  const current = LABELS[theme] ?? LABELS["dark-purple"];

  return (
    <button
      onClick={cycleTheme}
      className={className}
      title={`Theme: ${current.label} — click to switch`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
        color: "var(--text-muted)",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.04em",
        transition: "border-color 0.15s, color 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      <span style={{ fontSize: "1rem" }}>{current.icon}</span>
      {current.label}
    </button>
  );
}
