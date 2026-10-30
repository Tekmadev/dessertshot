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

## Questions from the page drafts

The 13 page drafts (`content/drafts/`) raised 289 questions; they were merged into the questions below (plus the matching questions above). Until answered, the drafts stay silent on these points. Answer them on the review page, where answers are saved.

| ID | Question | Until answered | Pages |
|---|---|---|---|
| `q-d-days` | Is delivery only on Saturdays, or can another day be arranged? Which days and times can people pick up in Hamilton, including weekdays, Sundays and holidays? | Pages say delivery runs on Saturdays and point other days to Hamilton pickup, without naming any pickup days or times. | 11 |
| `q-d-collect` | Can someone other than the person who ordered collect a pickup order, such as a friend, colleague or courier? If so, who should get the pickup location? | The wedding page suggests handing the pickup to someone who isn't getting married that day, but no page says whether someone else may collect or who gets the pickup location. | 2 |
| `q-d-delivery-time` | For Saturday delivery, is there a set time or window, or can customers ask for one to suit their event? Do you deliver to venues and offices as well as homes? How does drop-off work, for example does someone need to be there, and do you set the cups out? | Pages say only that delivery runs on Saturdays, give no time of day, and ask for the delivery address without mentioning venues or what happens at drop-off. | 7 |
| `q-d-notice` | How do you count the 48 hours' notice: up to the pickup or delivery time, or just by date, and does it start when the request is sent or when you confirm? Is there a set cut-off for a Saturday delivery? | Pages ask for at least 48 hours before the cups are needed, a few count it to the pickup or delivery time, and Wednesday is offered only as a suggestion for Saturday delivery. | 9 |
| `q-d-lead-time` | Do bigger orders or busy times (weddings, June grad weekends, holidays) need more than 48 hours' notice? How far ahead can people book? If the date isn't certain yet (for example Eid, which can depend on a moon sighting), can people hold two dates or change it later? | Pages state only the 48-hour minimum and encourage early requests, with no longer lead time or booking window, and ask anyone with an uncertain date only to mention it in their notes. | 5 |
| `q-d-multi-pack` | Can one request include more than one pack for the same date (including one of each size), or should each pack be its own request? Can a single pack mix Mini Shots and Dessert Cups? If two packs go to one address, is it one delivery fee? | Pages say the form takes one pack and one size per request and ask anyone wanting more to say so in their notes, and the bridal shower page keeps a shower and a wedding as separate requests and offers nothing extra for ordering both unless you tell us otherwise. | 10 |
| `q-d-payment` | How and when do customers pay (for example e-transfer or cash, when you confirm or at pickup), is a deposit needed to hold a date, and can you give receipts or invoices for company orders? | Pages say only that nothing is paid online, with no mention of a deposit, receipts or invoices. | 9 |
| `q-d-confirm` | How does your confirmation reach the customer (email, text or Instagram), and is the delivery fee quoted in that same message? Do you reply to requests on weekends? | Pages say you confirm within the day and quote the delivery fee after confirming, without saying how or in which message. | 5 |
| `q-d-storage` | After pickup or delivery, how should the cups be kept and handled until they're served, for example in the fridge? How long can they sit out on a dessert table? How long do they keep, including as take-home favours? | Pages give no storage, serving or shelf-life advice and the FAQ leaves those questions off, and tips on carrying the cups home, serving delivered cups and offering them as take-home favours will follow from your answer. | 11 |
| `q-d-packaging` | What do the cups come in: do Mini Shots and Dessert Cups both have lids, are spoons included, and do the 24 and 48 come in a box? | Pages say nothing about lids or spoons; the birthdays page says Classic and Premium come in the same box and the events page has a 'Corporate dessert boxes' heading, though boxes aren't confirmed. | 6 |
| `q-d-perks` | What do 'priority preparation' on the 48 and 'event-day pickup' on the 96 mean in practice? Can a 24 or 48 also be picked up on the day of the event? If a 96 is delivered, does anything replace event-day pickup? | Pages name both perks without explaining them and say nothing about same-day pickup for a 24 or 48 or about delivered 96s, and the order form keeps asking only for the date needed, with the event date in the notes, which is a form detail we'll settle ourselves. | 11 |
| `q-d-96-tray` | The 96's presentation tray: what is it like, and does the customer keep it or return it? Do the tray, custom label and event-day pickup come with every 96, whatever the size and whether it's picked up or delivered? | Pages say only that the 96 includes a presentation tray, with no description or photo, and don't say whether the tray, label and event-day pickup differ by size or for delivered orders. | 7 |
| `q-d-96-label` | What can the 96's custom label show (names, a date, a message, other languages), and can it be added to a 24 or 48? Does it cost extra or need more than 48 hours' notice? | Pages name the custom label as a 96 extra and ask customers to mention it in their request, without saying what it can show, what it costs or how much notice it needs. | 11 |
| `q-d-sixes` | Must each flavour be ordered in sixes (6, 12, 18 and so on), or can someone order, say, 8 or 10 of one flavour? Can a whole pack be a single flavour? | Pages say each flavour comes in multiples of 6, as the order form requires, and one FAQ says a 96 can be all one flavour. | 5 |
| `q-d-portions` | How many cups per guest do you suggest, and when would you suggest Mini Shots rather than Dessert Cups? Are you happy with the table styling tips, such as putting the Premium cups up front? | Pages suggest about one Dessert Cup or two Mini Shots per guest (two to three on the packages page), Mini Shots for tasting tables and Dessert Cups when the cup is the dessert, all labelled as suggestions, and the bridal shower page suggests putting the Premium cups at the front. | 9 |
| `q-d-price-examples` | Is it OK for pages to show sample prices (for example about $229 for a 48 of Dessert Cups, half Classic and half Premium) and per-cup prices, and do those totals match what you would quote? Do your prices include HST? | Several pages show estimated totals for sample mixes, and the wedding page shows per-cup prices, all worked out from your current prices, marked before delivery and silent on tax. | 6 |
| `q-d-mini-shots` | Do Mini Shots have the same layers and toppings as Dessert Cups, and is every flavour other than Tiramisu sold in both sizes? Do Mini Shots come in different cups? | Pages no longer say size is the only difference, and they describe toppings and colours from the full Dessert Cups. | 4 |
| `q-d-custom-options` | Which specific changes can customers ask for, if any: rose petals added to or left off Dubai Chocolate, a colour to match a theme or school colours, or a particular cup style? Is it right that no flavour is truly blue (the pages describe Blueberry Haze as lilac)? | Pages mention that some Dubai Chocolate cups have rose petals, say each flavour's colours are fixed and that no cup is a true blue, and promise no changes. | 5 |
| `q-d-recommend-how` | How should customers ask for a flavour recommendation (in the order notes or by message), and can it take a colour theme into account? | Pages tell customers to ask for the recommendation in their request, the bridal shower page asks for colours, guest count and allergies in the notes, and no page promises colour matching. | 4 |
| `q-d-ingredients` | Do any flavours contain gelatin, alcohol (even in flavourings) or added food colouring? Can any be called halal, kosher or vegetarian? Would you like the site to give guidance for pregnant guests or very young children? | Pages make no halal, kosher, vegetarian, alcohol-free or natural-colour claims and give no guidance for pregnancy or young children. | 2 |
| `q-d-nut-advice` | Pages tell guests who avoid nuts they can stick to Mango Dream, Strawberry Fields, Blueberry Haze and Biscoff Bliss, that this works for preference but not for an allergy, and that the three nut flavours can be set apart on the table. Are those four free of tree nuts in every part? Are you comfortable with this advice? May pages say plainly that no flavour is guaranteed nut-free? | Event pages, the packages page and the FAQ give this advice, each next to a warning that cross-contact is possible, and one extra line about fruit flavours is held back. | 9 |
| `q-d-other-allergens` | Besides dairy and tree nuts, should the allergen notice also name any others, such as wheat, soy, egg or peanuts? What are Tiramisu's allergens, including any tree nuts? Where should customers send allergy questions: Instagram, email or phone? | Pages name only dairy and tree nuts, treat Tiramisu as dairy only, and some point allergy questions to Instagram. | 9 |
| `q-d-celebrations` | On the celebrations pages, may we name specific holidays such as Eid, Diwali, Christmas or Lunar New Year, and are there any you'd rather not name? | Pages speak generally of cultural and religious celebrations and family gatherings, without naming any holiday. | 2 |
| `q-d-tastings` | Do you offer tastings, for example to wedding couples before they book? | The wedding page says nothing about tastings. | 2 |

Three further questions, about a page that stays unpublished until the owner approves it, are on the private review page only.
