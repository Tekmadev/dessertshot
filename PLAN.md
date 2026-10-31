# Dessert Shot overhaul — working plan

> Proposed 2026-10-30 after Phase 0 and a review of all 10 photos. It replaces the brief's strict Phase 1→6 order. The brief's rules, scope and acceptance criteria are unchanged; only the sequencing and a few methods change.
> Status lives at the bottom. Read this, `AUDIT.md`, `DECISIONS.md` and `ASSETS.md` before continuing in a new session.

## Why change the order

The slow parts of this project are not code. They are your decisions and approvals: the contact sheet, facts only the owner can confirm, running a DB migration, email setup, design direction and the first preview push. The brief scatters these across about eight stop points. This plan batches them into **two review rounds** and keeps code moving while each round is pending.

## What changes, and why

1. **Assets: pilot first, and request a short reshoot.** Not every photo can become a clean cut-out:
   - **Good:** Dubai (F), Blueberry and Strawberry (E), Mango (J, right-most cup).
   - **Workable:** Ferrero and Kinder (G). The wrappers sit beside the cups, so tight crops should handle it.
   - **Weak:** Biscoff (I), because the red Lotus packet shows through the clear cup rim. Tiramisu (D), because it only exists top-down inside a packed box.
   - Every cup is clear plastic, which is the hardest case for automatic background removal.

   The pipeline is: tight local crop (free) → `remove_background` on **2 pilot cups** → check the clear-plastic result → the rest → upscale only the approved ones.

   Ask the owner for a **15-minute phone reshoot**: Biscoff and Tiramisu (side view), ideally Ferrero and Kinder too. One cup at a time on a plain light surface, phone at cup height, daylight. It costs zero credits and is 100% faithful.
2. **S2 "The Build" = Option A, decided now.** Reveal the real cut-out bottom-up with a scroll-driven mask, with callouts at measured layer heights. The existing `CupBuilder` already does this choreography with SVG, so the job is swapping in the real photo.

   A generated "cup being made" clip (Option B) would almost certainly change layer order or colours, which is exactly what the fidelity rules forbid, and it costs the most. Credits go only where generation changes the least: the **P2 hero push-in** and the **P3 tray dolly**. P4 (spoon-dive) is likely skipped for the same fidelity reason.
3. **The order flow moves up, and email moves to the server.** The order flow is the revenue path and doesn't depend on assets. Today the business email is sent from the browser, independent of server validation: anything can trigger it without a valid order, and the customer gets no auto-reply.

   New flow:
   - One shared zod schema for client and server.
   - The API validates, recomputes the price, inserts the order, then sends **both** emails server-side.
   - Email goes through the **EmailJS REST API with a private key**. That keeps your existing account and needs no DNS changes. Resend would need DNS verification, which the brief rules out.
   - The customer lands on `/order/thanks`.
   - Spam protection: honeypot + Supabase-backed throttle.

   All schema needs go into **one migration (`004`)**, handed over early.
4. **Build each page once.** Drop "route skeleton now, real content later". A typed **content registry** drives pages, nav, sitemap, JSON-LD and the order form, so each page is written once, complete. No thin placeholder pages. Foundation built the parts that already have facts: flavours, claims, packs, contact and the route map (`lib/routes.ts`, grows as pages are built). Events, areas and FAQ entries need owner-confirmed copy, so they are drafted in Step 2 for `CONTENT-REVIEW.md`, and the event-type list feeds the Step 3 order form.
5. **Owner facts are drafted early and reviewed in one pass.** Event lead times, delivery areas, the allergen statement and Tiramisu all need the owner. All copy is drafted into the registry with `needsOwnerReview` flags and exported as one `CONTENT-REVIEW.md`.
6. **A design-direction checkpoint before building S1–S9.** One 390px hero plus one flavour section, built with the real cut-outs and reviewed alongside the contact sheet. Moving the background from today's all-pink to the brief's warm cream is a visible brand change, and it deserves an explicit yes before nine sections depend on it.
7. **Measure "before" on the live site.** The Lighthouse baseline is production `dessertshot.ca` (what customers get today). The "after" is the preview.

## Sequence

| Step | Work | Needs you? |
|---|---|---|
| **1. Foundation** | Content registry (8 flavours from §2.1, Tiramisu flagged; claims and allergens in one config; contact = dessertshot.ca@gmail.com). `lib/pricing.ts` + tests pinning all 12 price cells and mixed boxes. Shared order schema. Remove fabricated Numbers/testimonials. Metadata helper; fix canonicals/OG on existing pages. www→apex 301. Design tokens. Draft migration `004`. Commit. | No |
| **2. Asset pilot** | Local crops → strip all EXIF/GPS → 2-cup background-removal pilot (cost quoted, logged) → remaining good-photo flavours → contact sheet + 390px design-direction comp + events/areas/FAQ drafts added to `CONTENT-REVIEW.md`. | **Review round 1** |
| **3. Order flow** (while round 1 is pending) | Server-side emails + auto-reply, `/order/thanks`, honeypot/throttle. Order writes on a server-only Supabase key with tightened insert policies; finalize migration `004`. Size-aware pricing, 48h/urgent from the chosen date, Saturday note, postal code + address, event type (one shared registry), allergen flags, deep links. Tests. | No |
| **4. After approval** | P2 hero + P3 tray videos (draft mode first, quoted, logged), then S1–S9 in the approved direction, then every §6 page from the registry. Reshoot cut-outs slot in when they arrive. (The current hero's SVG cup renders 0×0 at ≥1024px, a pre-existing bug also live on production; the new hero replaces it.) | No |
| **5. SEO + QA** | JSON-LD, sitemap/robots/image sitemap, a11y pass, Lighthouse + CWV before/after, screenshots at 390/768/1280/1536, broken-link check. | **Review round 2** |
| **6. Preview** | Push the branch → Vercel preview (asked first). End-to-end test order. Final report. | Push OK + test order OK |

## Review round 1 — everything asked at once

- Contact sheet (cut-outs) + design direction: approve or redirect.
- `CONTENT-REVIEW.md`: Tiramisu tier/price/layers/sizes, business phone, gluten-free + allergen statement, delivery areas, pickup wording, about story, `/open-a-shop` publish or hold.
- The reshoot (2–4 cups).
- Setup only the owner can do:
  - Email, Supabase key, Vercel env and migration `004`, in that order: step by step in `docs/order-setup.md` (keys go in Vercel, never in chat).
  - Confirm Preview-environment env vars exist in Vercel.
  - The settings in `CONTENT-REVIEW.md` (make the apex→www redirect permanent; delete the unused `NEXT_PUBLIC_BUSINESS_EMAIL`).
- OK for one clearly labelled test order. There is only one database, so it lands in the live orders table and her inbox.

## Constraints carried forward

- Credits: 981 available, project budget about 200 (balance 781). A working budget, not a hard stop: stay well within it and flag before going past it. Every spend is quoted first and logged in `ASSETS.md`.
- Hosting: GitHub `Tekmadev/dessertshot` (**public**), no local Vercel link, so a branch push most likely triggers a Vercel preview. A push is outward-facing and gets asked first. Never `main`, never production, never DNS.
- Primary host is **www.dessertshot.ca** (production: apex → 307 → www). No app-level host redirect.
- Privacy: original photos carry GPS and stay out of git (`/source-photos/` is ignored). Every derived image is re-encoded without metadata before it reaches `public/` or any third party.
- The live DB is on another account: schema changes ship as SQL files for the owner to run.
- Next.js 16: read `node_modules/next/dist/docs/` before writing Next-specific code (`proxy.ts`, not middleware).

## Status

- [x] Phase 0 audit (`fa9a3e8`)
- [x] All 10 photos reviewed and mapped (`ASSETS.md`); balance recorded
- [x] Step 1 Foundation — built, six-lens reviewed (7 defects fixed), 122 tests green
- [x] Step 2 Asset pilot → review round 1 — cut-outs (11 credits), 12 public page drafts (+ /open-a-shop kept private), 27 merged owner questions; review page (private): https://claude.ai/artifact/X6ULMeMSxhbo5Fdx6X6GYN — answers live in its `answers` collection. **9 answers in** (applied; see `CONTENT-REVIEW.md` "Answers received"); the rest still open.
- [x] Step 3 Order flow — built, browser-checked (dry run), reviewed twice (36 findings fixed), 263 tests green. **Owner setup pending:** `docs/order-setup.md` (EmailJS, Supabase secret key, Vercel env, then migration 004 after deploy).
- [x] Generated product shots (decided in chat 2026-10-30, overrides brief §4.1) — GPT Image 2.5 chosen; all 8 flavours generated, 2 variants each (48 credits; project total 59). Picks made (A: Dubai, Kinder, Biscoff; B: the rest) → `public/media/products/`. Tiramisu's side layers are invented: owner to confirm. Videos: two hero takes (Kling, MiniMax) and the tray clip generated (27.5 credits; project total 86.5); Kling take picked; final MP4 + WebM (desktop and phone) and posters in `public/media/`, registered in `lib/media.ts`. Assets done for Step 4.
- [x] Step 4 Videos, experience, pages — blush direction kept. Homepage S1–S9 (hero video, pinned Build reveal, flavour lineup, Morning Of, packages with a cups helper, events, Instagram (hidden until testimonials exist), FAQ, order), /menu and eight /menu/[slug] pages, and the draft pages (/packages, /events + seven event pages, /faq, both area pages, /open-a-shop). Brand corrected to **Dessert Shot by Farhana** (short form "Dessert Shot"). Browser-checked at 360/768/1280 px plus short and landscape screens. Five-lens review with a skeptic per finding: 39 confirmed and fixed (see DECISIONS.md), 458 tests green. Process clips for S5 not generated yet (`lib/process-clips.ts` is empty; the section works without them).
- [x] Step 5 SEO — the last step for now (user, 2026-10-30). Structured data on every page, image sitemap, robots, branded 404, 24 per-page share images, intent-led titles (≤60) and h1s, per-flavour descriptions, internal links (footer Events column, event guides on flavour pages), page photos. Lighthouse mobile: SEO 100, CLS 0, Performance 91/95 with real throttling (79–89 simulated; see DECISIONS.md). Reviewed by four lenses with skeptics; 543 tests green. The QA half (screenshots at four widths, full accessibility pass) waits with Step 6.

### SEO tasks only you or the owner can do (no code)

1. **Google Business Profile** as a service-area business: address hidden, the five delivery cities as the service area, the same name ("Dessert Shot by Farhana"), phone and site.
2. **Search Console**: verify https://www.dessertshot.ca, submit /sitemap.xml, then watch Core Web Vitals and the structured-data reports.
3. **Rich Results Test** on a few live URLs after the next deploy (/, /menu/dubai-chocolate, /faq, /events/weddings).
4. **Vercel → Domains**: make the apex → www redirect permanent (308; it answers 307 today). That is domain configuration, so it's yours to change.
5. **Instagram link-in-bio** to the site, and **Google reviews** from real customers (never seeded).
6. When copy on a page changes, run `npm run og` so its share card follows.
- [ ] Step 6 Preview deploy
