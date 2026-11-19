import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PIN_QUERY } from "./pin";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const read = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

describe("pinned sections", () => {
  it("pin in CSS exactly when GSAP builds the timeline (plus a running script)", () => {
    const css = read("app/globals.css");
    expect(css).toMatch(new RegExp(`@custom-variant pin \\{\\s*@media ${esc(PIN_QUERY)} \\{\\s*:where\\(html\\.js\\) & \\{`));
    expect(css).toMatch(new RegExp(`@custom-variant unpinned \\{\\s*@media not all and ${esc(PIN_QUERY)} \\{`));
    expect(css).toContain(":where(html:not(.js)) &");
    // ...and the root layout sets that class.
    expect(read("app/layout.tsx")).toContain(`document.documentElement.classList.add("js")`);
  });

  it.each(["components/experience/build/BuildStage.tsx", "components/sections/MorningOf.tsx"])(
    "%s pins with the shared query, not motion-safe alone",
    (file) => {
      const src = read(file);
      expect(src).toContain("mm.add(PIN_QUERY");
      expect(src).not.toMatch(/motion-safe:(sticky|h-\[|opacity-0|\[grid-area)/);
    }
  );
});
