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

## Step 2 — Asset pilot and review round 1
- Every crop is re-encoded without EXIF before it leaves the machine — the originals carry GPS of the owner's location.
- Background removal (Higgsfield, 1 credit each, cost measured from the transaction log after one run because the tool has no preview) on tight local crops; all cleanup is local and touches only what surrounds the dessert: erase stray props, keep the largest shape, fade clear feet that carried the board/counter, desaturate background seen through empty glass. The dessert pixels are never repainted — fidelity rule §4.1.
- Feet of clear stemmed cups are faded rather than rebuilt: the stem stays visible (the cup still reads as stemmed) without inventing a foot.
- Dubai hero cut-out is usable for review; its lower-left (hidden in the photo by the square cup in front) gets rebuilt in the final pass before the P2 video uses it as a start frame.
- Tiramisu has no cut-out (only a top-down photo inside a box); Biscoff and Kinder are provisional. All three plus Ferrero go on a short reshoot request — real photos beat any generation.
- Floaters: blueberries split into singles; pistachios and petals stay soft-masked clusters until the reshoot (they touch each other in the photo); crushed pistachio rejected (board came with it); no mango pieces (none photographed, and never imply cubes); ganache drips and cocoa dust will be CSS/SVG (brief S4).
- The UI/UX skill's generated system ("vibrant block-based", black + hot pink, Amatic SC/Cabin) is overruled by the brief's explicit direction (editorial serif, photo-derived warm palette, generous whitespace). Kept from it: food-photo and "hidden hours" anti-patterns, 1–2 animated elements per view, reduced motion, 4.5:1 text contrast.
- Contrast: berry `#B3213F` passes for text on cream (~6:1); the current rose accent passes only at display size (~4:1); mango and caramel are decorative only.
- Review round 1 is one private page (artifact "Dessert Shot Proofs") with the `db` capability: the owner's answers save to `answers/<question id>` and are read back with `ArtifactData` — no relaying answers through chat.
- 13 page drafts written by a double-audited workflow (facts/claims auditor + usefulness/SEO auditor per page, then a cross-page dedupe), stored as data in `content/drafts/*.json`, built into pages only after approval — pages are built once, from reviewed copy.
- Draft copy uses tokens (`{{dietaryClaim}}`, `{{contactEmail}}`, `{{mailto}}`) resolved from config at render — the dietary claim stays a one-line switch everywhere, and a FAQ entry asking about it is dropped with it.
- Seventh event page "celebrations" (event value `cultural`) so every S7 card links to a real page; one `EVENT_TYPES` list drives slugs, the order field and migration 004's CHECK (tested).
- The drafts' 289 owner questions merged into 27 new plain-language questions plus 89 folded into existing ones (coverage verified: every question placed exactly once) — one review pass for the owner, not 289.
- Cut-out masters, crop boxes and cleanup settings are committed (`assets/review/`, `scripts/assets/`) so nothing depends on the session scratchpad or costs credits to redo.
- The `/open-a-shop` draft and its three questions stay out of the public repo (`content/private/`, gitignored) until the owner approves publishing — the brief says that page is confirmed before it goes live, and a public repo is live. They are on the private review page. The same reason neutralised a `.gitignore` comment in the unpushed Step 1 commit (amended locally; no force-push).
- **Product pictures (decided in chat, 2026-10-30): fully generated Higgsfield shots, using her photos as reference — overrides brief §4.1 "image-to-video only, from her real photos" and accepts that layers and toppings may differ from the real cups.** Still in force: no logos, wrappers or generated text, no people or hands, quote before every spend, stills approved before video, and the ~200-credit budget. Scheduled after Step 3. The cut-outs on the review page stay as reference material.
- Generated product stills use **GPT Image 2.5** (chosen in chat over Nano Banana 2.1): high quality, 2K, 4:5, one shared scene (warm cream linen, soft window light from the left), each flavour referenced on its own EXIF-free cut-out. Props come only from real ingredients or the owner's own photo styling.
- The 200-credit cap becomes a working budget, not a hard stop (decided in chat, 2026-10-30): stay well within it; flag before any spend that would go past it.
- Draft meta titles are capped at 55 characters before the " · Dessert Shot" suffix; when the pages are built (Step 4) the full-title test cap moves from 65 to 70 — the brand sitting last and occasionally truncating is acceptable.

## Step 3 — Order flow
- Both emails are sent by the server through the EmailJS REST API, after validation, one after the other at least 1.1 s apart (EmailJS takes one request per second). The owner's goes first, with one retry on a busy or down EmailJS. The customer's goes only once the order has reached the owner (saved or emailed), so nobody is told "we've got it" when nobody has. The browser no longer sends anything to EmailJS, and `@emailjs/browser` is removed.
- The owner template keeps its existing variable names, so the live template works unchanged. The customer auto-reply is a second template the server sends, rather than EmailJS's linked auto-reply, so the server knows whether it went out and the thanks page can say so.
- Orders are written with a server-only Supabase secret key. Migration 004 closes the public insert policies, which let anyone holding the publishable key (it ships in every page) write orders directly, skipping validation.
- The order id is known before the write (the form's request id, else one made on the server) and nothing is read back. The old code's insert-then-select needs a SELECT policy anonymous visitors don't have, so anonymous orders were very likely failing to save, with only the email getting through (unverified: Vercel Hobby keeps logs for an hour).
- Until the secret key is set, the server writes with the publishable key; until migration 004 runs, it saves in the old shape when PostgREST reports the missing columns (PGRST204). The code works before, during and after the owner's setup.
- An order counts as received if it was saved or the owner was emailed. Only when both fail does the customer see an error, with the email address to write to. Database calls time out after 4 s and emails after 6 s, so a slow service can't use up the request before the owner is told.
- The auto-reply goes to an address nobody has verified, so it carries only what the server worked out, plus the first name only when it is plainly a name (else "Hi there"): never the notes, phone, street address or anything link-shaped the sender typed. Otherwise the form could be used to send anyone text of a stranger's choosing from the business Gmail.
- The order API only takes JSON from the site's own pages (content type, Origin and Sec-Fetch-Site checked), so another website can't post orders through its visitors' browsers.
- The form sends one request id per filled-in form and keeps it for a retry after a dropped connection; the server uses it as the order id, so a retry of a saved order is recognised (primary-key clash) and not saved or emailed twice.
- Spam: a honeypot field (answered with a fake success) plus rate limits of 5 requests an hour and 10 a day per IP, which refuse the request. Auto-replies have their own limits, which only skip the auto-reply and never the order: 5 a day per inbox (plus-tags and Gmail dots count as one inbox), so the form can't flood someone with them or be used to block a customer by typing their address, and 80 in 30 days in total (`EMAILJS_AUTOREPLY_MONTHLY_LIMIT`), leaving at least 120 of the free plan's 200 monthly requests for the owner's notifications. The owner's own emails aren't capped: a flood from many connections could still use up the quota, so the setup doc tells her to check the `orders` table if EmailJS warns. Counting is one atomic SQL call with an advisory lock. Only HMAC hashes of IPs and emails are stored, deleted after 24 h; the monthly count keeps no personal data. If the database can't answer, a per-instance memory limit stands in rather than blocking real orders. Cloudflare Turnstile is skipped: it needs a Cloudflare account and keys from the owner, so it isn't "easy" (brief §7.7).
- Urgency is derived from the date, never chosen: Toronto time, with the 48 hours counted to 9 AM on the chosen day (cups are made that morning; how the owner counts notice is question q-d-notice). Past dates are rejected, and so are dates more than two years out, as typos: that's not a booking window, which is the owner's call (q-d-lead-time).
- The rush-fee wording is kept from the current site until the owner answers CONTENT-REVIEW.md question 6.
- Delivery asks for an address and a Canadian postal code (normalised to "A1A 1A1"). There's no postcode-area check, because the delivery areas aren't confirmed. A non-Saturday delivery date gets a friendly note and is never blocked.
- `/order/thanks` shows the server's summary, handed over in sessionStorage (first name only, no phone or notes, ignored after an hour), so customer details never go in a URL. The page is noindex.
- The owner's setup is in two phases (`docs/order-setup.md`): first everything that doesn't change what the live site does, including a typed-in To address on the owner template (the old site shipped its IDs in public JavaScript); then, after deploying, EmailJS private-key enforcement, which makes those IDs useless to anyone but the server, and migration 004.
- Deep links ignore anything they don't recognise, start each preselected flavour at the 6-cup minimum, and accept flavour slugs and event page slugs too. The Packages section preselects the form on the same page, or opens /order with the choice on pages without the form (/menu). Changing to a smaller pack trims the box instead of emptying it.
- The order-form defaults the owner hasn't confirmed yet (notice counted to 9 AM, rush-fee wording, Saturday note, spam limits) are listed together at the end of `CONTENT-REVIEW.md`.
- `next dev` is a dry run by default (validated, summarised, never saved or emailed), because there is only one database and one inbox. `ORDER_LIVE=1` opts in.
- `GET /api/orders` selects explicit columns, so owner-only fields such as `admin_notes` never reach a customer.

## Owner answers, round 1 (2026-10-30)
- Answers arrive through the review page's `answers` collection and are applied in code, with each one recorded in `CONTENT-REVIEW.md` ("Answers received").
- Tiramisu: Premium, Dessert Cups (5 oz) only. A flavour can now list the sizes it comes in (`Flavor.sizes`); the shared schema refuses other sizes, so the form, deep links and API all agree. Its layers are named generically (coffee-soaked layer, tiramisu cream, cocoa dusting) because a typical tiramisu's ladyfingers would contradict the gluten-free and eggless claim until the owner says what hers are made with.
- The 48's "free flavour recommendation" and the 24's "Labelled by flavour" are removed (owner: not offered). The owner's answer overrides the brief's perk list; copy and draft tests now reject both phrases.
- The 96's "custom label option" stays until the owner answers it directly: her answer was about flavour labels on the cups, and the brief lists the custom label separately.
- The 48-pack price anomaly stays as is: the owner wants an admin page to manage prices, which is a separate piece of work.
- Rush fee confirmed (`copy.order.urgent` stays as is). "Real fruit, real cream" and "made the morning of / nothing sits overnight" confirmed and kept.
- Tiramisu shows "Dessert Cups (5 oz) only" on its flavour card, in the order form and in the drafts that suggest it, so nobody plans a Mini Shots box around it. The homepage's "pressed crumb base" line now reads "a base pressed or soaked by hand"; "Four layers, no shortcuts." stays as the brand line the brief asks to keep.

## Owner answers, round 2 (2026-10-30)
- **Design direction: keep blush pink** (chosen in chat), not the brief's warm cream. Step 4 builds S1–S9 on today's pink base and rose accent; the warm-cream generated photos sit on it as photographs. The brief's palette tokens stay available for accents.
- **Process footage is generated** (owner: no phone clips; use Higgsfield from the existing photos). This overrides the brief's "do not fake process footage" rule for "The Morning Of" (S5), which will use generated clips, quoted before any spend.
- **A 96 needs 7 days' notice, and shorter is refused** (owner in chat), unlike 24s and 48s, where under 48 hours is accepted as urgent. One shared rule (`orderTiming` with the pack size) drives the form, the server and the summary.
- **Presentation tray is an extra-cost option; cups come in boxes of 24 with no lids.** The 96 perk now reads "Presentation tray (extra cost)"; "Then a lid" is gone; copy tests reject "lid" and "tray included".
- **A deposit is required** (only the owner can waive it). The site says so without an amount or method, which are still open.
- **Confirmation can come by email, text or Instagram**, and the delivery fee is part of the quoted total.
- **Custom orders are a separate order**: /order points people to email, not to the notes field.
- **Business phone (438) 700-3223** shown in the footer and the order section (`telLink`).
- **/open-a-shop published** (owner: "Publish"): its draft moved from `content/private/` (gitignored) to `content/drafts/`; the page gets a footer link only (brief §6).

## Brand name (2026-10-30)

- **The brand is "Dessert Shot by Farhana"** (user correction during Step 4; the brief only ever said "Dessert Shot"). "Dessert Shot" is the accepted short name.
- `BUSINESS.name` is the full name and `BUSINESS.shortName` the short one. Full name: the wordmark (`components/ui/Wordmark.tsx`, "by Farhana" signed under "Dessert Shot" in navbar and footer), the homepage title, og:site_name, the footer copyright, email from-name, header and sign-off, and the first mention on every draft page (a test enforces it).
- Short name: the per-page title suffix ("FAQ · Dessert Shot"), so titles stay within 70 characters, and later mentions in running copy. The trailing "." after "Shot" in the old wordmark is gone, since the name now continues.
- The logo image beside the wordmark is decorative (`alt=""`), so screen readers hear the name once.

## Step 4 — browser check

- Checked every route at 360, 768 and 1280 px (plus the homepage at 375 and 1440): no horizontal scroll, one h1 per page, every image has alt text, no app console or server errors.
- **Lenis and ScrollTrigger stay unwired.** Lenis scrolls the real window, so ScrollTrigger hears every scroll event; both pinned sections are CSS `sticky` with a smoothed scrub, so there is no pin to jitter. Wiring them together would put GSAP in the site-wide scroll provider and so in every page's bundle.
- Navbar glass is now 92% opaque: at 72% the text scrolling under it stayed readable through the blur.
- Draft-page h1s cap at 84 px and balance their lines (long event headlines ran three lines at 96 px).
- The cups helper says "You need about 40 for 40 guests; this leaves 8 spare." instead of "About 40 for 40 guests, with 8 to spare."

## Step 4 — five-lens review (accessibility, content, layout, performance, correctness)

Every finding went to an independent skeptic; all of the first 32 held (31 confirmed, 1 plausible). Fixed:

- **Notice deadlines match the form.** Pages promised "the Saturday before, at the same time of day as your delivery", but the form counts notice to 9 AM on the date, so it would refuse those 96s (and mark those 48s urgent). Every page now says "by 9 AM ..." (two days before; a week before for a 96), and `orderTiming` counts **whole calendar days to 9 AM** (`noticeDeadline`) instead of raw hours, so the stated deadline holds across a clock change. A drafts test bans the old phrasings.
- **Price tables render.** The draft renderer gained `| table |` support (header, rule, rows; row labels as `th`); a test pins the /packages tables to `lib/pricing.ts`.
- **The dietary-claim switch reaches /faq.** Its answer uses `{{dietaryClaim}}`, and its meta title, description and intro no longer name the claim, so switching it off removes it everywhere. The test no longer exempts /faq.
- **Confirmation channels.** The thanks page names email, text or Instagram, as `copy.order.confirmation` does.
- **"Premium" chip = the Premium tier** (five flavours, as on the badges and in the FAQ), not Dubai's category alone.
- **Pinned sections pin only when there's room and a script.** New `pin:` / `unpinned:` variants (`lib/pin.ts`, app/globals.css): reduced motion off, at least 35rem tall, and `html.js` (an inline script in the root layout sets it before first paint; `(scripting)` would leave Safari < 17 matching neither). Landscape phones, 400% zoom and no-JS visitors get the plain list layout; GSAP uses the same query.
- **No-JS reveals.** Without a script, elements server-rendered at `opacity:0` by motion/react are shown (`html:not(.js)` rule).
- **Reduced motion everywhere.** One `MotionConfig reducedMotion="user"` in the root layout (`MotionPreferences`).
- **Phone menu.** It's a `<nav aria-label="Main">`, `inert` and `invisible` when closed, with `aria-expanded`/`aria-controls` on the toggle; it focuses the first link on open, closes on Escape (focus back to the toggle) or when focus leaves it, scrolls on short screens, and uses the blush surface.
- **Pause control.** Looping videos get a 44 px pause button once they play (WCAG 2.2.2); the hero's endless float is gone and the scroll cue runs twice.
- **Contrast.** Small labels moved to ink/70 (draft kickers, order-section labels, thanks page), footer labels to bone-soft/60, the allergen title to 75%, ordered-list markers to berry, the Build's inactive steps to 0.7. Draft-page CTAs and the menu's Instagram pill are berry, not rose (bone on rose is 3.97:1).
- **Focus and keyboard.** Same-page "Order the 48"/"Order this" now land focus in the order form (and don't glide with reduced motion); the cups helper's minus button uses `aria-disabled` so focus survives at 1; its suggestion is announced as one short line after typing settles; the Layers toggle precedes its panel; a lineup card lifts above the stack only for keyboard focus (a mouse click no longer pins it); draft FAQ rows are 44 px targets; the navbar Instagram link's name includes its visible handle.
- **Smaller fixes.** "Est. 2024" is readable by screen readers; the footer email wraps on tablets; the drip divider no longer clips past ~2,400 px wide.
- **Performance.** "The morning of" re-measures its scroll positions when the page height changes (the desktop lineup filter moved it by ~3,000 px and left the timeline on stale positions). The hero poster and flavour photos ask for `fetchpriority="high"`. Image `sizes` follow the real rendered widths (Build photo, Morning Of media in both layouts, lineup cards on small tablets).
- **Not done, noted in code:** once Build phase clips exist, mount only the current phase's video (`components/experience/build/plan.ts`).
