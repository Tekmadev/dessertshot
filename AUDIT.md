# Phase 0 — Audit

> Read-only pass over the existing Dessert Shot site before any changes.
> Branch: `feat/frontend-overhaul`. No code was modified in this phase.
> Date: 2026-10-30.

## 1. Stack and versions

| Thing | Version / detail |
|---|---|
| Framework | **Next.js 16.2.4** (App Router). ⚠️ Major version — `middleware.ts` is renamed to **`proxy.ts`**; APIs differ from older Next. Per `AGENTS.md`, read `node_modules/next/dist/docs/` before writing code. |
| React | 19.2.4 |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme` tokens in `app/globals.css`, PostCSS plugin). No `tailwind.config` file — tokens live in CSS. |
| Animation | **GSAP 3.15** + `@gsap/react`, **`motion` 12** (Framer Motion successor, imported as `motion/react`), **Lenis 1.3** smooth scroll. All already installed — matches the "wow" requirement in §5. |
| Fonts | `next/font/google`: **Fraunces** (display serif, variable, italic + SOFT/WONK/opsz axes) + **Inter Tight** (UI sans). Good editorial pairing, already preloaded. |
| Forms | `react-hook-form` 7 + `zod` 4 + `@hookform/resolvers`. |
| Data | **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`). |
| Email | **`@emailjs/browser`** (client-side send). |
| Analytics | `@vercel/analytics` (`<Analytics/>` in layout) **and** a custom `analytics_events` Supabase table. |
| State | `zustand` (installed; no current usage found). |
| Icons | `lucide-react`. |
| TypeScript | 5.x, `strict: true`, path alias `@/*` → repo root. |
| Tests | **None.** No test runner in `package.json`, no `test` script. Must add (Phase 1 requires unit tests pinning the price table). |

**Build/scripts:** `dev`, `build`, `start`, `lint` only. No `typecheck` script (use `tsc --noEmit`).

## 2. Routes (current)

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Full experience: Hero → Story → CupBuilder → Numbers → Flavors → HowItsMade → Packages → OrderCTA. |
| `/menu` | `app/menu/page.tsx` | **Duplicates homepage** — renders `<Flavors/>` + `<Packages/>` under a hero heading. |
| `/order` | `app/order/page.tsx` | **Duplicates homepage** — renders `<Packages/>` + `<OrderCTA/>` (the order form lives inside `OrderCTA`). |
| `/api/orders` | `app/api/orders/route.ts` | POST (create order) + GET (user's own orders). |
| `app/account/` | — | **Empty directory.** No page. |

`proxy.ts` redirects `/account` and `/admin` to **`/login`**, but **none of `/account` (page), `/admin`, or `/login` exist** → dead auth scaffolding. Low risk (matcher excludes assets) but should be cleaned or completed.

**Missing routes the overhaul needs:** `/menu/[flavour]`, `/packages`, `/events` + `/events/[type]`, `/dessert-cups-hamilton`, `/dessert-cups-gta`, `/order/thanks`, `/faq`, `/about`, `/open-a-shop`.

## 3. Order form + email backend

**Form:** `components/sections/OrderCTA.tsx` (client component, ~850 lines). react-hook-form + zod. Steps: cup size (2oz Mini / 5oz Dessert Cups) → pack qty (24/48/96) → flavour mix (Classic + Premium, min 6/flavour, max flavours = qty/6) → contact → timing (standard/urgent **manual toggle**) → fulfillment (pickup/delivery) → notes.

**Submit flow:** fires **two parallel requests** —
1. `POST /api/orders` → Supabase insert (server recomputes price, validates mix).
2. `emailjs.send(...)` → **business notification only**, client-side.

Success if either succeeds; shows an inline "Got it." state.

**Backend `/api/orders`:** validates cup size / qty / mix server-side, **recomputes total with the shared pricing function** (never trusts client), inserts into `orders`, then best-effort inserts `order_items` + an `analytics_events` row. Delivery address is **folded into `additional_notes`** so the owner can quote the fee.

**Gaps vs the brief (§7):**
- ❌ **No customer auto-reply** (only business notification). Brief wants an auto-reply with a full summary.
- ❌ **No `/order/thanks` page** — just an inline success state.
- ❌ Total labelled "**Total**", not "**Estimated total (before delivery)**".
- ❌ No Saturday-delivery sanity note; no date-driven 48h rule (urgent is a manual toggle, not derived from the chosen date).
- ❌ No **honeypot / rate limiting** / Turnstile.
- ❌ No **Event type** field.
- ❌ No per-flavour **allergen flags** shown at selection.
- ❌ No **deep-link preselection** (e.g. `/order?flavour=dubai`).
- ⚠️ Delivery collects one free-text address field; brief wants postal code **and** address captured.

## 4. Pricing logic — **KEEP (correct)**

Lives in `lib/copy.ts` (odd home for pricing; consider moving to `lib/pricing.ts`).

- `MENU_PRICES` **matches the §2.2 table exactly** (2oz = Mini Shots, 5oz = Dessert Cups; classic/premium × 24/48/96).
- `perCupPrice(size,tier,qty) = MENU_PRICES[size][tier][qty] / qty` — single-tier pack totals exactly its listed price.
- `calcMixTotal(...)` sums per-cup rates across the mix, rounds to the nearest dollar.
- `MIN_CUPS_PER_FLAVOR = 6`; `maxFlavorsForPack = qty/6` → 24→4, 48→8, 96→16. **Matches §2.2/§2.3.**
- Server route re-runs `calcMixTotal` → client total is never trusted. ✅

**Action:** preserve logic verbatim; add unit tests pinning **every cell** of the 2.2 table + mixed-box cases (Phase 1). The old per-cup hint in the form ($4.13/$5.38 mentioned in the brief) is already superseded — the form is size-aware via `perCupPrice`.

## 5. Content correctness — **REPLACE (wrong / fabricated)**

- **Flavour copy is wrong** (`lib/copy.ts` `FLAVORS`): "Brown butter biscuit", "Vanilla biscuit", "Hazelnut biscuit", Mango "Fresh cubes on top" (photos show a cream dollop), etc. Must be rewritten from the **§2.1 table**. Only **7** flavours present — **Tiramisu (8th) missing**.
- **`Numbers` section is fabricated:** "1200+ cups served", "7+ flavours", and the intro claims *"every number comes from real orders, real customers, real GTA addresses."* → **remove entirely** (§5 S8: no counters/stats).
- **`Testimonials` are invented** (Aisha/Marcus/Priya/Jordan with 5★ ratings and quotes) → **remove**; replace with a real-only "Seen on Instagram" component that hides when empty (§5 S8).
- **Personal Gmail exposed:** `lib/business.ts` `email` held the owner's personal Gmail (redacted here; the repo is public), rendered in the **Footer** and the **order form** (contact column, success message, error message), and set as `NEXT_PUBLIC_BUSINESS_EMAIL` in `.env`. → replace with business email **`dessertshot.ca@gmail.com`** (owner-supplied 2026-10-30) via config.
- **Legacy DB seed is stale and unused:** `001_initial_schema.sql` seeds `products`/`packages` with old prices (Dubai 9.00, Ferrero 8.00, Biscoff 8.50) and old copy ("kataifi crunch and gold dust", "24k gold touch", "Nutella-laced"). The UI reads static `FLAVORS`, **not** the DB, so these are cosmetic/legacy — but should not be treated as source of truth.

## 6. Database (Supabase)

Tables: `products`, `packages`, `orders`, `order_items`, `profiles`, `testimonials`, `analytics_events`. RLS on; anon can insert `orders`/`order_items`/`analytics_events`, read is owner-scoped. Migrations `001`→`003` are idempotent and run **manually in the Supabase SQL editor** (live DB is on a separate account; MCP has no write access — **any schema change ships as a new SQL migration file for the owner to run**, never auto-applied).

- `orders` has `cup_size`, `tier` (classic/premium/**mixed**), `is_rush`, `package_size ∈ {24,48,96}`. Used columns match current code.
- `products`/`packages`/`testimonials` tables exist but are **not read by the UI** (static config is used instead).
- No structured `postal_code`/`address`/`event_type` on `orders` (delivery address is in notes). Phase 4 may add these via a `004_*.sql` migration.

## 7. Analytics, hosting, deploy

- **Analytics:** Vercel Analytics (`<Analytics/>`) + custom `analytics_events` inserts on order submit.
- **Hosting:** Vercel (readme + `@vercel/analytics` + `.vercel` gitignored). `NEXT_PUBLIC_SITE_URL=https://dessertshot.ca` (**apex**). `BUSINESS.url` = apex. **Primary host (apex vs www) unconfirmed** — open item #5.
- **Images:** `next.config.ts` allows remote `*.supabase.co/storage/...`. `optimizePackageImports` for gsap/motion/lucide. No AVIF/WebP `formats` override (Next default includes modern formats via `next/image`).
- **Env (`.env.local.example`, not git-tracked ✅):** Supabase URL + publishable key (safe anon key), `NEXT_PUBLIC_SITE_URL`, EmailJS service/template/public key (blank), `NEXT_PUBLIC_BUSINESS_EMAIL` (= personal Gmail ⚠️). `.env*` is gitignored → **no secrets committed** (confirmed via `git ls-files`).

## 8. SEO issues

1. **Canonicals wrong:** root layout sets `alternates.canonical: "/"`. `/menu` and `/order` set `title`/`description` but **not** their own canonical → both inherit canonical `"/"` (the §8 bug). OG images also inherited from the homepage (no per-page OG). **Fix with per-page `alternates.canonical` + OG via the metadata API.**
2. **No `sitemap.ts`, no `robots.ts`, no image sitemap.**
3. **No JSON-LD** anywhere (need Organization, service-area FoodEstablishment with `areaServed` + **no street address**, Product/Offer, FAQPage, BreadcrumbList).
4. Thin/duplicate routes (`/menu`, `/order` mirror the homepage) — §6 wants each page a distinct job.
5. No `/events`, `/dessert-cups-{hamilton,gta}`, `/menu/[flavour]` landing pages for the target intents (§8).
6. Menu description says "Ferrero **Rocher**" but the flavour is "Ferrero **Royale**" — minor consistency fix.

## 9. Performance / mobile (qualitative)

- Good bones: `next/font` preload, Lenis respects `prefers-reduced-motion` (`LenisProvider`), reduced-motion CSS guard in `globals.css`, Hero/CupBuilder use scroll-linked `motion` (no heavy canvas yet).
- Current cups are **pure SVG** (`components/ui/CupGlyph.tsx`) — no real photography. `public/media/` does not exist (no cut-outs/floaters/video yet). The overhaul replaces glyphs with real photo cut-outs + the hero/tray videos.
- Risk areas for LCP/CLS: large hero type (`clamp(...)`), `Numbers` count-up animation (being removed), future frame sequences (must lazy-load after LCP, posters for reduced-motion/saveData/low-memory).
- **Baseline Lighthouse (mobile): not captured in Phase 0.** A dev build isn't representative; a formal **before/after** on a production-like build will be captured in **Phase 5** per §11. (Baseline-before will be measured against `main`.)

## 10. Keep / Replace

**KEEP**
- Pricing functions + `MENU_PRICES` (add tests, maybe relocate to `lib/pricing.ts`).
- Order API server-side validation + recompute model; Supabase schema & RLS trust model.
- Design tokens / editorial system in `globals.css` (extend, don't rip out); Fraunces + Inter Tight; Lenis + motion + GSAP; reduced-motion handling.
- Routes `/`, `/menu`, `/order`, `/api/orders` (give `/menu`, `/order` distinct jobs).
- Wordmark, `/logo.png`, Instagram + Facebook links; brand voice lines ("…stop talking when they hit the spoon", "Four layers, no shortcuts").
- Favicons/manifest; Vercel Analytics.

**REPLACE / ADD**
- Rewrite all 8 flavours from §2.1; add Tiramisu (`needsOwnerReview: true`, default Classic).
- Remove `Numbers` (fabricated) and invented `Testimonials`; add real-only Instagram/testimonials component that hides when empty.
- Move personal Gmail out of UI → `CONTACT_EMAIL`/`CONTACT_PHONE` config (email = `dessertshot.ca@gmail.com`; phone = placeholder).
- Allergen config + sitewide cross-contact notice; "gluten-free and eggless" wording in one config file (no medical claims).
- Per-page metadata/canonical/OG; `sitemap.ts`, `robots.ts`, JSON-LD; host redirect once apex/www confirmed.
- New routes (§6); size-aware order flow upgrades (§7): customer auto-reply, `/order/thanks`, "Estimated total (before delivery)", postal+address, event type, allergen flags, honeypot/rate-limit, deep links.
- Higgsfield asset pipeline into `public/media/` (Phase 2, credit-capped, approval-gated).

## 11. Blockers / open items carried forward

No hard blocker to starting Phase 1. Config placeholders stand in for the §10 open items until the owner answers:
1. **Tiramisu** tier/price/layers/sizes — `needsOwnerReview: true`, default Classic.
2. Business **phone** — placeholder (email resolved: `dessertshot.ca@gmail.com`).
3. **Gluten-free substantiation** wording — one config file, owner to confirm.
4. **Delivery zones** beyond "Saturdays, GTA, fee quoted".
5. **Primary host** apex vs www (affects canonicals + the 301 redirect).
6. **About** story/photo.
7. **Real process clips** for S5 (optional).
8. **`/open-a-shop`** publish vs hold (owner will confirm before live).
9. **Pickup arrangement** wording.
