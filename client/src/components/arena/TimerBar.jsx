export function TimerBar({ value = 100, max = 100, showTime = true, seconds }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const isWarning = pct <= 25;
  const isLow = pct <= 10;

  const displaySeconds = seconds ?? Math.round((value / max) * max);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {showTime && (
        <div style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          fontFamily: "JetBrains Mono, monospace",
          color: isWarning ? "#ef4444" : "var(--accent)",
          flexShrink: 0,
          minWidth: "36px",
          textAlign: "right",
          animation: isLow ? "timer-pulse 0.5s ease-in-out infinite alternate" : "none",
        }}>
          {displaySeconds}s
        </div>
      )}
      <div className="timer-bar-wrap" style={{ flex: 1 }}>
        <div
          className={`timer-bar-fill${isWarning ? " warning" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
