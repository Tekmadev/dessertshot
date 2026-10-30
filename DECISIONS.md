# Decisions log

One line each: decision — why. Newest at the bottom of each phase.

## Phase 0 — Audit
- Work on branch `feat/frontend-overhaul`; no production push, preview deploys only — per brief §0 ground rules.
- Keep the existing pricing functions and `MENU_PRICES` as-is (they match §2.2 exactly and are already server-authoritative) — preserve what works.
- Treat the Supabase `products`/`packages`/`testimonials` seed as legacy/unused; static config remains the source of truth for display — the UI never reads those tables.
- Any DB schema change ships as a new `supabase/migrations/00X_*.sql` file for the owner to run manually — live DB is on a separate account and MCP has no write access.
- Defer formal mobile Lighthouse to Phase 5 (before/after on a production-like build) — a dev build isn't representative; §11 only needs before/after in the final report.
- Business contact email = **dessertshot.ca@gmail.com** (owner-supplied, 2026-10-30), replacing the owner's personal Gmail (redacted; the repo is public) in all UI. Phone stays a placeholder until supplied.
- Skipped the hook-suggested `ai-sdk` / `chat-sdk` / `next-cache-components` skills — false lexical matches; this task has no AI SDK / chat / cache-components work.

## Plan change (approved 2026-10-30)
- Resequenced the brief's phases per `PLAN.md`: approvals batched into two review rounds; order flow before the experience; pages built once from a content registry (no "route skeleton" to refill later); a design-direction checkpoint before S1–S9 — the human approvals, not code, are the critical path.
- S2 "The Build" = **Option A** (scroll-masked reveal of the real cut-out) — a generated build sequence would change layer order/colours, which the fidelity rules forbid, and costs the most credits.
- Asset pipeline: tight local crop → 2-cup `remove_background` pilot → rest; ask the owner for a short reshoot (Biscoff, Tiramisu, ideally Ferrero/Kinder) — the photos are clear plastic on busy backgrounds and two flavours have no clean source.

## Step 1 — Foundation
- Data layer split into `lib/pricing.ts`, `lib/flavors.ts`, `lib/claims.ts`, `lib/order-schema.ts`, `lib/seo.ts`; `lib/copy.ts` re-exports so existing imports keep working — one source per concern.
- Pricing logic moved verbatim and pinned by tests (all 12 cells + mixed boxes) — preserve exactly.
- At 5 oz the 48-pack costs slightly more per cup than the 24-pack ($4.15 vs $4.13 Classic, $5.40 vs $5.38 Premium); prices preserved, copy no longer claims "the bigger the pack, the better the value"; raised for the owner — never invent, never silently change prices.
- Server prices and names every item from the flavour registry, never from client-sent tiers — a client could previously submit a Premium flavour as Classic and be priced as Classic.
- One zod schema shared by form and API; the server now also validates name/email/date and caps text lengths — the two sides can't drift.
- The order API returns generic errors; Supabase codes/hints stay in server logs — no internals leaked to the public.
- Client no longer reads `NEXT_PUBLIC_BUSINESS_EMAIL` (it was inlined into the public JS bundle); notifications go to the business inbox from config. That env var (local `.env`, Vercel) is now unused and can be deleted.
- No layout-level canonical; every page builds metadata with `pageMetadata()` — a layout canonical is silently inherited by any page that forgets its own.
- Title separator " · " (was " . ").
- The dietary claim lives behind one switch in `lib/claims.ts` and feeds the homepage description and the sitewide notice — one line retracts it everywhere if the owner can't substantiate it.
- **Primary host = www** (reverses the Phase 0 apex default): production answers `https://dessertshot.ca` with a 307 to `https://www.dessertshot.ca`, which serves 200 — the brief says pick whichever matches production. `BUSINESS.url` is www, so metadataBase, canonicals and og:url name the live host. No app-level host redirect: Vercel's domain redirect runs before the app, so a www→apex rule would loop. Making that redirect permanent (307 → 308) is an owner setting (CONTENT-REVIEW.md, A).
- Proxy matcher narrowed to `/account`, `/admin` — Proxy ran a Supabase auth round-trip before every page view for routes that don't exist.
- Sitewide allergen/cross-contact notice in the Footer (`AllergenNotice`), tree-nut list derived from the registry.
- Tiramisu: tier Classic and filter category "Chocolate" by default, layers empty, `needsOwnerReview` — orderable per brief §7.2 without inventing facts.
- Brief palette added as tokens; site background unchanged until the design-direction checkpoint.
- Vitest 4.1.12, not 5 — v5's peer range wants `@types/node` ≥22; v4 fits the existing `^20` without forcing resolution.
- Migration `004` drafted (event type, structured delivery address/postal code, source, IP hash, count-only throttle function); not to be run until Step 3 finalizes it.
- Kept existing site facts not in the brief ("Labelled by flavour" perk, rush-fee wording) pending owner confirmation in `CONTENT-REVIEW.md` — preserve rather than delete owner-facing claims we can't verify either way.
- The repo is public: the personal Gmail is redacted from these docs and from this branch's history (the unpushed Phase 0 commit was rewritten locally, now `fa9a3e8`; no force-push involved). It remains in older, already-pushed `main` history — rewriting that needs a force-push, which the brief forbids.

## Step 1 — after the six-lens review (41 agents; 7 defects confirmed and fixed, 4 refuted)
- `source-photos/` and the private brief are gitignored — every original photo carries GPS coordinates of one Hamilton location, and the repo is public. Every derivative is re-encoded without metadata before it goes into `public/` or to a third party.
- Default share image is now a metadata-free 1200×630 crop of the owner's Mango photo (`public/og/default.jpg`) — the old `dessertshotshowcase.jpg` looks AI-generated and shows mango cubes and gold flakes, which customers won't get.
- `lib/routes.ts` is the route map; every page builds metadata from it, and tests enforce unique titles/descriptions, length limits, and that every `page.tsx` uses it — the canonical bug can't silently return.
- Pack perks and the "minimum order" line are derived from the pricing rules (`lib/packs.ts`) — they can't disagree with what checkout enforces.
- The builder's cream step lists each flavour's real cream, generated from the registry — the old line called every cream "cream cheese tinted with the flavour above it".
- Cup-glyph labels are Base / Cream / Flavour / Finish — "Biscuit" and "Concentrate" contradicted the recipes.
- Order form: friendly messages and `maxLength` for every capped field; real-calendar date check (rejects 2026-02-30 before Postgres would 500).
- Claims-policy fixes in files already being edited: the hero's invented "Today's drop: Strawberry Fields" tag and the "Reply by tomorrow" button (the brief promises "within the day").
- Tiramisu no longer claims a square mini cup while its sizes are unconfirmed.
- Migration 004 draft adds `order_items.flavor_id` (stable registry id).
- Deferred with reasons: order-security hardening, event-type registry, postal-code normalisation and IP-hash retention → Step 3; branded 404 and the meta keywords tag → Step 5.
- Owner questions collected in `CONTENT-REVIEW.md` (facts, pack rules, settings only the owner can change).
