import { useEffect, useRef } from "react";
import { recordFairPlayEvent } from "../lib/localStore";

/**
 * useAntiCheat — monitors fair-play signals for an active activity session.
 * Logs detected events to the local store without blocking the user.
 */
export function useAntiCheat({ activityId, enabled = true }) {
  const countRef = useRef(0);

  useEffect(() => {
    if (!enabled || !activityId) return;

    function log(type, message, meta = {}) {
      countRef.current += 1;
      recordFairPlayEvent({ type, activityId, message, meta });
    }

    function onBlur() {
      log("window_blur", "User switched away from the window during activity.", {
        timestamp: Date.now(),
        count: countRef.current + 1,
      });
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        log("tab_hidden", "User hid the tab during activity.", {
          timestamp: Date.now(),
        });
      }
    }

    function onKeyDown(e) {
      // PrintScreen key detection
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        log("screenshot_key", "PrintScreen key pressed during activity.", {
          key: e.key,
          timestamp: Date.now(),
        });
      }
      // Ctrl+Shift+I / F12 — DevTools hint
      if ((e.ctrlKey && e.shiftKey && e.key === "I") || e.key === "F12") {
        log("devtools_hint", "DevTools shortcut detected during activity.", {
          key: e.key,
          timestamp: Date.now(),
        });
      }
    }

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activityId, enabled]);

  return { alertCount: countRef.current };
}
