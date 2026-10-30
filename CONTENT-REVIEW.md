# Content review — for the owner

Everything on the site that only you can confirm, in one place. Each item names the file where its answer goes. Until you answer, the site uses the safe default shown.

## Facts about the cups

| # | Question | Current default | Where it lives |
|---|---|---|---|
| 1 | **Tiramisu:** Classic or Premium? What are its layers? Is it sold as Mini Shots, Dessert Cups, or both? Which filter should it sit under? | Classic price, no layers listed, "Chocolate" filter, sold in both sizes | `lib/flavors.ts` |
| 2 | **"Gluten-free and eggless":** standard graham crumb, Biscoff cookies and kunafa contain wheat. Is the claim true for every flavour, including Tiramisu? What exact wording do you want? (Never "certified" or "celiac-safe".) | Shown sitewide and in the homepage search description | `lib/claims.ts` (one switch turns it off everywhere) |
| 3 | **Allergen notice:** "Every cup contains dairy. Kinder Bueno, Ferrero Royale and Dubai Chocolate contain tree nuts, and every cup is made in the same kitchen, so cross-contact with nuts is possible. If you have a severe allergy, message us before you order." Accurate? Anything to add? | As written, in every page footer | `lib/claims.ts` |
| 4 | **"Real fruit, real cream"** (homepage): are the fruit layers made from real fruit and the creams from real dairy cream? | Shown | `lib/copy.ts` |
| 5 | **Made the morning of:** is every part (compotes, ganache, kunafa, crumb) made that morning, or are the cups assembled that morning? Can we say "Nothing sits overnight"? | Shown | `lib/copy.ts` |

## Ordering and packs

| # | Question | Current default | Where it lives |
|---|---|---|---|
| 6 | **Rush fee:** do orders with under 48 hours' notice cost extra, or are they only "subject to availability, no guarantee"? | The order form says a rush fee applies, quoted on reply | `components/sections/OrderCTA.tsx` (reworked in Step 3) |
| 7 | **"Labelled by flavour":** true? For every pack, or only the 24? | Listed as a 24-pack perk only | `lib/packs.ts` |
| 8 | **Flavour recommendations:** for every pack, or a 48-pack perk only? | "Ask us to recommend a mix for your 24, 48 or 96 pack" | `lib/copy.ts` |
| 9 | **Pack pricing:** at 5 oz the 48-pack costs slightly more per cup than the 24-pack ($4.15 vs $4.13 Classic, $5.40 vs $5.38 Premium). Intended? | Prices unchanged; no "bigger pack, better value" claim | `lib/pricing.ts` |
| 10 | **Biggest order:** is there a maximum number of cups for one date? | "Maximum is whatever your event needs" | `components/layout/Footer.tsx` |
| 11 | **Custom requests:** OK to say "Custom requests welcome: add them to your notes"? | Shown on /order | `app/order/page.tsx` |

## Business details

| # | Question | Current default | Where it lives |
|---|---|---|---|
| 12 | **Business phone** for the site | Not shown | `lib/business.ts` |
| 13 | **Delivery areas:** Hamilton, Burlington, Oakville, Mississauga, Toronto — right list? Any delivery rule beyond "Saturdays, GTA, fee quoted after we confirm"? | That list | `lib/business.ts` |
| 14 | **Pickup wording:** how should we describe pickup ("pickup by arrangement, location shared after confirmation")? | "Pickup free in Hamilton" | `lib/business.ts` |
| 15 | **About page:** your story and a photo (optional) | Page not built yet | Step 4 |
| 16 | **/open-a-shop page:** publish or hold? | Not built yet; nothing goes live without your OK | Step 4 |

## Photos and clips

| # | Ask | Why |
|---|---|---|
| 17 | **A 15-minute phone reshoot:** Biscoff Bliss and Tiramisu (side view), ideally Ferrero Royale and Kinder Bueno too. One cup at a time on a plain light surface, phone at cup height, daylight, no packets or wrappers in frame. | The current Biscoff photo has the red packet behind the clear cup; Tiramisu only exists top-down in a box. Real photos beat anything generated. |
| 18 | **Process clips (optional):** short phone videos of pressing the base, whipping, layering, topping, sealing. | For the "Morning of" section. We will never fake process footage. |

## Settings only you can change

| # | Task | Why |
|---|---|---|
| A | **Vercel → Project → Domains:** change the `dessertshot.ca` → `www.dessertshot.ca` redirect from **307 (temporary)** to **308 (permanent)**. | Search engines should treat www as the one true address. |
| B | **Vercel → Environment variables:** delete `NEXT_PUBLIC_BUSINESS_EMAIL` (no longer used). If `NEXT_PUBLIC_SITE_URL` exists, set it to `https://www.dessertshot.ca`. | The old value was a personal address; anything named `NEXT_PUBLIC_` is visible to the public. |
| C | **Old share image:** `public/dessertshotshowcase.jpg` is no longer used. It shows mango cubes and gold flakes, not your real cups. OK to delete it? After the next deploy, re-scrape the homepage in Facebook's Sharing Debugger so old previews refresh. | Previews should show what customers get. |

Further setup for the order emails and database comes with review round 1 (see `PLAN.md`).
