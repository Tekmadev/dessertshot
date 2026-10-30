# Higgsfield asset ledger

**Hard cap for this project: 200 credits.** Stop at 200.
Starting balance: **981 credits** (Plus plan, checked 2026-10-30). **Hard stop when the balance reaches 781.**

Rules (brief §4): image-to-video only from the owner's real photos; fidelity check after every generation (reject if cup shape/lid/toppings/swirl/layer order/colours drift, or any text/logo/wrapper/distorted hands appear); no people/hands; stills first → show a contact sheet → **wait for approval before spending video credits**; quote cost before each generation; prefer `remove_background` + `upscale_image` for cut-outs over regeneration.

## Ledger

| # | Asset | Model | Settings | Credits (quoted) | Credits (actual) | Keep / Reject | Notes |
|---|---|---|---|---|---|---|---|
| 0 | `public/og/default.jpg` — default share image, 1200×630 crop of photo J | none (local crop) | top offset 150px, re-encoded with no EXIF/GPS | 0 | 0 | Keep | Replaces the unused, AI-looking `dessertshotshowcase.jpg` |

**Running total: 0 / 200**

## Pipeline rules learned in Step 1
- **Strip metadata first.** All 10 originals carry GPS coordinates of one Hamilton location. Re-encode every crop/derivative without EXIF before it goes to Higgsfield or into `public/`. Originals never enter git (`/source-photos/` is ignored).
- **Crop tightly before background removal.** Automatic removal keeps every salient object, and clear plastic shows what's behind it.

## Pilot crops (pass 1, local, 0 credits)

| Cup | Source | Crop (H×W @ Y,X, full-res) | Notes |
|---|---|---|---|
| Mango | J | 1088×770 @ 278,2097 | Cleanest: whole cup, stem and foot. Pilot #1 (best case). |
| Dubai | F | 1658×1143 @ 448,1702 | Hero. Stem foot hidden behind the square Dubai cup in front; extend ~200px down and plan a soft fade at the stem. Pilot #2 (worst case). |
| Blueberry | E | 1366×874 @ 1501,784 | Whole cup; a strawberry cup behind shows red through the top-right rim. |
| Strawberry | E | 1255×851 @ 1366,1725 | Whole cup; another strawberry cup behind top-left. |
| Ferrero | G | 1232×963 @ 336,269 | Base cut — extend ~180px. A gold Ferrero foil ball with readable branding sits in front of the lower-left: must be masked out. |
| Kinder | G | 1223×650 @ 412,1142 | Oval-rim glass, striped bite; Ferrero cup sliver at left edge. |

## Priority plan (from §4.2)
- **P1 (cheap/free first):** transparent cut-outs of all 8 flavours (1600px WebP, alpha); ingredient floaters; per-page OG (1200×630). Tiramisu cut-out from photo D; Kinder/Ferrero from photo G **without wrappers**.
- **P2 (hero):** Dubai cup 4–6s slow push-in + light sweep, layers subtly separating (start frame = approved cut-out on cream).
- **P3:** tray push-in from photo B, 5–6s slow dolly.
- **P4 (only if credits remain):** spoon-dive/cross-section for Mango + Dubai; box-open reveal from photo D.

## Source photo map (all 10 viewed 2026-10-30)

| # | File (`source-photos/`) | Content | Cut-out feasibility |
|---|---|---|---|
| A | `20261025_015830.jpg` | Tall tray crop: Dubai (pistachio web swirl), Ferrero, Kinder, Biscoff. **Lids off.** Two googly-eyed Biscoff cups bottom-left. | Texture/abundance only. Crop away the eyes. |
| B | `20261025_015757.jpg` | Wide tray, same cups. Googly-eyed Biscoff in the lower-left foreground. | P3 tray dolly **only if cropped to the upper-right** (Dubai/Ferrero/Kinder). |
| C | `20261025_015807.jpg` | Googly-eyed Biscoff close-up. | **DO NOT USE.** |
| D | `20260801_122507.jpg` | White box, top-down: square cocoa-dusted Tiramisu, Biscoff squares (cookie + pearls), angled Kinder shots, pistachio squares. | Packages/96-tray shot. Tiramisu exists **only top-down in a packed box** (no side view, layers not visible). Weak cut-out. |
| E | `20260524_132214_IMG_5020.jpeg` | Blueberry + Strawberry stemmed cups front, Mango (mint-garnished) blurred behind. | **Good:** front-middle Blueberry, front-right Strawberry are isolated. |
| F | `20260524_130314_IMG_5014.jpeg` | Dubai ×4 (stemmed, gold-rim tumbler, square, stemmed), rose petals, pistachios; kunafa visible mid-cup. | **Best.** Hero source (right stemmed cup). |
| G | `20260524_125855_IMG_5010.jpeg` | Ferrero (tumbler) + Kinder (oval-rim glass) with gold Ferrero foils and Bueno wrappers beside. | **Workable:** wrappers sit beside, not on, the cups. A loose Ferrero ball at the Ferrero cup's base needs a tight crop. |
| H | `20260524_123509_IMG_4998.jpeg` | Strawberry close-up, jam toast + fridge behind. | Backup to E. Toast overlaps the cup's lower right. |
| I | `20260524_122446_IMG_4987.jpeg` | Biscoff ×2 with red Lotus packet and loose "Lotus"-embossed cookies. | **Weak:** the cookie *in* the cup shows no lettering (checked at full res), but the red packet sits directly behind the clear cup and tints the transparent rim. |
| J | `20260524_121713_IMG_4985.jpeg` | Five Mango stemmed cups on a board, pistachios, rose petals, knife, spoon. | **Good:** the right-most cup stands alone. Also the "craft" mood shot. |

**Pipeline note:** every cup is clear plastic, so automatic background removal will carry whatever is behind it (board, counter, red packet) into the stem and rim. Crop each cup tightly first (free, local), then pilot `remove_background` on two cups before running the rest.

Reference-only, never displayed: retail Kinder stick-bar image (shape/colour reference; no wrapper/text/logo may appear in output). Not present in `source-photos/` yet.
