import { useRef } from "react";
import { cn } from "../ui/cn";

const LANGS = {
  javascript: "JS",
  python: "PY",
  cpp: "C++",
  java: "JV",
  typescript: "TS",
  sql: "SQL",
};

export function CodeEditor({
  value = "",
  onChange,
  language = "javascript",
  readOnly = false,
  className,
  placeholder = "// Write your solution here...",
}) {
  const textareaRef = useRef(null);

  function handleTab(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.substring(0, start) + "  " + value.substring(end);
      onChange?.(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className={cn("code-editor-wrap", className)}>
      {/* Header bar */}
      <div className="code-editor-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Traffic lights */}
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c,display:"inline-block" }} />
          ))}
        </div>
        <div style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          padding: "2px 8px",
          background: "var(--accent-dim)",
          borderRadius: "4px",
          border: "1px solid var(--border)",
        }}>
          {LANGS[language] ?? language.toUpperCase()}
        </div>
      </div>

      {/* Editor body */}
      <div className="code-editor-body">
        <textarea
          ref={textareaRef}
          className="code-editor-textarea"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={handleTab}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
