const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function LiveRank({ rank = 1, total = 1, label = "Your rank" }) {
  const medal = MEDALS[rank];
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 14px",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "8px",
        background: "var(--nav-active)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: medal ? "1.1rem" : "0.95rem",
        fontWeight: 800,
        color: "var(--nav-active-fg)",
        flexShrink: 0,
      }}>
        {medal ?? `#${rank}`}
      </div>
      <div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginTop: "1px" }}>
          #{rank} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>of {total}</span>
        </div>
      </div>
    </div>
  );
}
