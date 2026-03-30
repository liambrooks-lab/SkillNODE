export const antiCheat = {
  start({ onSuspicious }) {
    const cb = typeof onSuspicious === "function" ? onSuspicious : () => {};

    function fire(evt) {
      try {
        cb(evt);
      } catch {
        // ignore
      }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        fire({
          type: "visibility_hidden",
          message: "You switched tabs/windows during a session.",
          meta: { visibilityState: document.visibilityState },
        });
      }
    }

    function onBlur() {
      fire({
        type: "window_blur",
        message: "Window lost focus.",
        meta: {},
      });
    }

    function onKeydown(e) {
      if (e.key === "PrintScreen") {
        fire({
          type: "printscreen",
          message: "Screenshot key detected (best-effort).",
          meta: {},
        });
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKeydown);
    };
  },
};

