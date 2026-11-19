/**
 * When a scroll-pinned section (the Build, the Morning Of) pins: motion is
 * welcome and the window is tall enough to hold the stage. Short screens
 * (phones held sideways, 400% zoom) and reduced motion get the plain layout.
 *
 * The CSS side is the `pin:` / `unpinned:` variants in app/globals.css, which
 * add `(scripting: enabled)` so nothing pins or hides when the script can't
 * run; GSAP's matchMedia uses this query. lib/pin.test.ts keeps them equal.
 */
export const PIN_QUERY = "(prefers-reduced-motion: no-preference) and (min-height: 35rem)";
