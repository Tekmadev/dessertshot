# Higgsfield asset ledger

**Budget for this project: about 200 credits.** A working budget, not a hard stop (relaxed in chat, 2026-10-30): stay well within it and flag before any spend that would take the total past it.
Starting balance: **981 credits** (Plus plan, checked 2026-10-30). The budget line is a balance of 781.

Rules (brief §4): image-to-video only from the owner's real photos; fidelity check after every generation (reject if cup shape/lid/toppings/swirl/layer order/colours drift, or any text/logo/wrapper/distorted hands appear); no people/hands; stills first → show a contact sheet → **wait for approval before spending video credits**; quote cost before each generation; prefer `remove_background` + `upscale_image` for cut-outs over regeneration.

## Ledger

| # | Asset | Model | Settings | Credits (quoted) | Credits (actual) | Keep / Reject | Notes |
|---|---|---|---|---|---|---|---|
| 0 | `public/og/default.jpg` — default share image, 1200×630 crop of photo J | none (local crop) | top offset 150px, re-encoded with no EXIF/GPS | 0 | 0 | Keep | Replaces the unused, AI-looking `dessertshotshowcase.jpg` |
| 1 | Mango Dream cut-out (pilot #1) | Image Background Remover | crop J 830×1150 | unknown → measured | 1 | Keep | Body faithful. Clear foot carried the wooden board → foot faded locally (stem kept). |
| 2 | Dubai Chocolate cut-out (hero) | Image Background Remover | crop F 1143×1858 | 1 | 1 | Keep* | Square Dubai cup in front erased locally; stem hidden in the photo. *Hero needs the bowl's lower-left rebuilt in the final pass. |
| 3 | Blueberry Haze cut-out | Image Background Remover | crop E 874×1366 | 1 | 1 | Keep | Grey counter in the foot faded locally. |
| 4 | Strawberry Fields cut-out | Image Background Remover | crop E 851×1255 | 1 | 1 | Keep | Foot faded; ghost of the cup behind erased above the rim. |
| 5 | Ferrero Royale cut-out | Image Background Remover | crop G 963×1412 | 1 | 1 | Keep | Gold foil ball **with printed branding** and a loose ball removed locally (largest-shape + erase). |
| 6 | Kinder Bueno cut-out | Image Background Remover | crop G 650×1343 | 1 | 1 | Keep (provisional) | Empty top of the clear glass carried grey background → neutralised to translucent. Reshoot preferred. |
| 7 | Biscoff Bliss cut-out | Image Background Remover | crop I 985×1635 | 1 | 1 | Keep (provisional) | Back cup erased above the rim; faint brown still visible through the clear rim. Reshoot preferred. |
| 8 | Floater: pistachios | Image Background Remover | crop F 986×538 | 1 | 1 | Keep as cluster | Nuts touch each other and the crop edge — single pieces need a spaced-out source (reshoot add-on). |
| 9 | Floater: rose petals | Image Background Remover | crop F 627×1792 | 1 | 1 | Keep as cluster | Same as pistachios. |
| 10 | Floater: blueberries | Image Background Remover | crop E 694×605 | 1 | 1 | Keep | Split locally: 3 single berries + 2 pairs. |
| 11 | Floater: crushed pistachio | Image Background Remover | crop J 1165×717 | 1 | 1 | **Reject** | Kept the wooden board texture; crumbs on wood can't be separated. |
| — | Tiramisu | — | — | — | 0 | Not attempted | Photo D shows it only top-down inside a packed box; no cup to cut out. Reshoot required. |
| — | Whole-strawberry floater | — | — | — | 0 | Not attempted | Source is out of focus. |
| 12 | Dubai hero still, generated (pilot A, B) | GPT Image 2.5 (Flare) | ref = EXIF-free Dubai cut-out on cream; quality high, 2K, 4:5, 2 variants | 5.5 (preflight) | 5.5 | **Keep A** (picked in chat) → `public/media/products/dubai-chocolate.webp` | Generated shots per the 2026-10-30 decision (DECISIONS.md). Layer order, swirl and toppings follow the reference; glass tumbler instead of the clear plastic cup; no text, logos or hands. Crisper, warmer light. |
| 13 | Dubai hero still, generated (pilot C, D) | Nano Banana 2.1 | same reference and prompt; 2K, 4:5, 2 variants | 4 (preflight) | 4 | Reject (other style chosen) | Same checks pass. Softer, more natural light. |
| 14 | Mango Dream stills (a, b) | GPT Image 2.5 (Flare) | ref = EXIF-free cut-out on cream; high, 2K, 4:5; same scene as Dubai | 5.5 | 5.5 | **Keep B** (picked in chat) → `public/media/products/mango-dream.webp` | Stemmed cup, crumb / mango cream / mango layer / cream dollop as the recipe; pistachio and petal props from photo J; no fruit pieces. |
| 15 | Strawberry Fields stills (a, b) | GPT Image 2.5 | same | 5.5 | 5.5 | **Keep B** (picked in chat) → `public/media/products/strawberry-fields.webp` | Layers and two cream rosettes as the recipe; fresh strawberries as props. |
| 16 | Blueberry Haze stills (a, b) | GPT Image 2.5 | same | 5.5 | 5.5 | **Keep B** (picked in chat) → `public/media/products/blueberry-haze.webp` | Layers and fresh blueberries on top as the recipe. |
| 17 | Kinder Bueno stills (a, b) | GPT Image 2.5 | same | 5.5 | 5.5 | **Keep A** (picked in chat) → `public/media/products/kinder-bueno.webp` | Striped wafer bite with no lettering or wrapper; hazelnut props. |
| 18 | Ferrero Royale stills (a, b) | GPT Image 2.5 | same | 5.5 | 5.5 | **Keep B** (picked in chat) → `public/media/products/ferrero-royale.webp` | Unwrapped hazelnut ball, no gold foil. One variant re-run after a provider rate limit (the failed call wasn't charged). |
| 19 | Biscoff Bliss stills (a, b) | GPT Image 2.5 | same | 5.5 | 5.5 | **Keep A** (picked in chat) → `public/media/products/biscoff-bliss.webp` | Upright cookie checked zoomed in: ridged edge only, no lettering or logo. Re-run after a provider rate limit (not charged). |
| 20 | Tiramisu stills (a, b) | GPT Image 2.5 | ref = EXIF-free crop of photo D (top only); high angle | 5.5 | 5.5 | **Keep B** (picked in chat) → `public/media/products/tiramisu.webp` | Square cup and cocoa-and-sugar top as the photo. **The side layers are invented** (no side view exists); acceptable under the generated-shots decision, but the owner should confirm they look like hers. One variant re-run after a rate limit. |
| 21 | P2 hero clip, take 1 | Kling 3.0 (pro) | start = Dubai still A (job bb7fff55); 5 s, silent; requested 9:16, came out 4:5 (1288×1608, follows the start image) | 8.75 (preflight) | 8.75 | Pending pick | Clear slow push-in with a light sweep; cup, layers, swirl and toppings unchanged in first/middle/last frames. Review copy `assets/review/video/hero-kling.mp4` (1080 wide, no audio, 1.3 MB). |
| 22 | P2 hero clip, take 2 | MiniMax H3 (2K) | same start; 5 s, 3:4 (1440×1792) | 10 (preflight) | 10 | Pending pick | Barely any camera move; a soft light band passes through the middle. Faithful. Came with an audio track (stripped). Review copy `assets/review/video/hero-minimax.mp4` (1.9 MB). |
| 23 | P3 tray clip | Kling 3.0 (pro) | start = photo B cropped to the upper-right, 3000×1688, EXIF-free (no googly-eyed cup, no stray cookie); 5 s, 16:9, silent | 8.75 (preflight) | 8.75 | Pending approval | Steady dolly and push across the Dubai, Kinder and Ferrero cups; nothing new appears. The first call was held back by a suggested preset ("IN THE DARK"); re-sent literally as approved, not charged twice. Review copy `assets/review/video/tray-kling.mp4` (1280×720, 1.3 MB). |

Cost of background removal: **1 credit**, measured from the transaction log after the first run (no preview is available for this tool). Balance after these 11 runs: **970**.

Generated stills: cost from the tool's free `get_cost` preflight, confirmed against the transaction log. Balance after the pilot: **960.5**; after the full set: **922**; after the videos: **894.5**.

All generated stills are saved as WebP review masters in `assets/review/generated/`. The picked variant of each flavour is in `public/media/products/{slug}.webp` (1440×1800, WebP q82, no metadata), ready for the Step 4 pages.

Video masters stay on Higgsfield (job IDs above); only web-sized review copies are in the repo.

**Running total: 86.5 of a ~200 budget**

## Where things are
- Cleaned masters awaiting approval (EXIF-free WebP, not served): `assets/review/cutouts/`, `assets/review/floaters/`.
- Reproducible pipeline: `scripts/assets/` (crop boxes in `crops.json`, per-cup cleanup in `cleanup.json`, see its README).
- Raw background-removal results (re-downloadable): Higgsfield job IDs — mango `309780a0-34bb-4a7d-8b6d-bb4b510abdd7`, dubai `8e9032c1-61b5-4441-943f-0ef4167f62ef`, blueberry `200fb77b-1ed6-4e5c-a812-7c5fce61615f`, strawberry `cb4f8e22-117f-4eb1-bc1e-a7eb85ba5b22`, ferrero `12ce25ea-c8f2-46db-8a96-6944cc676bca`, kinder `0eb0feeb-7d27-4f39-a93a-0f43cb79aa06`, biscoff `de145977-a3a7-4e4c-8404-5bc0ff849e18`, pistachios `91b0d817-7fc8-4979-ba6f-768323fd74e4`, rose petals `26d0d7b5-d411-4627-bdbe-6bae7ef86e08`, blueberries `492b1438-6582-40cf-9688-096f5a775333`, crushed pistachio (rejected) `77fa3dbc-6d5b-4e71-a9f7-f5f93f895d7e`.
- Owner review page (private): https://claude.ai/artifact/X6ULMeMSxhbo5Fdx6X6GYN — approvals land in its `answers` collection (`cut-<flavour>`, `floaters`, `reshoot`, `dir`).

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
