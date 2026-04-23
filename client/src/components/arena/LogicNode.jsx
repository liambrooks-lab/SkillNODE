const DIFF_COLORS = {
  easy:   { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.30)",  text: "#4ade80" },
  medium: { bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.30)",  text: "#facc15" },
  hard:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.30)",  text: "#f87171" },
};

export function LogicNode({ type = "challenge", title, description, difficulty = "medium", number }) {
  const diff = DIFF_COLORS[difficulty] ?? DIFF_COLORS.medium;

  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {number != null && (
            <span style={{
              width: 22, height: 22, borderRadius: "5px",
              background: "var(--accent-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-bright)",
              flexShrink: 0,
            }}>
              {number}
            </span>
          )}
          <span style={{
            fontSize: "0.70rem", fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--text-faint)",
          }}>
            {type}
          </span>
        </div>
        <span style={{
          fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", padding: "2px 7px", borderRadius: "4px",
          background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text,
        }}>
          {difficulty}
        </span>
      </div>

      {/* Title */}
      {title && (
        <div style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
          {title}
        </div>
      )}

      {/* Description */}
      {description && (
        <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {description}
        </div>
      )}
    </div>
  );
}
