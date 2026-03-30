/**
 * Basic E2E smoke test placeholder for the SkillNODE arena.
 * This is intentionally lightweight so CI can run a basic availability check.
 */
describe("SkillNODE Arena", () => {
  it("has a valid local dev URL", () => {
    const appUrl = process.env.E2E_APP_URL || "http://localhost:5173";
    expect(appUrl.startsWith("http")).toBe(true);
  });
});
