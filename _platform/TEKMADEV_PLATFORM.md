# TEKMADEV — Website Builder Platform
## Master Specification Document
**Last Updated:** April 2026  
**Status:** Active Development  
**Author:** Tekmadev

---

## 1. EXECUTIVE OVERVIEW

Tekmadev is building a **subscription-based, AI-powered website builder** specialized exclusively for **service-based local businesses** — HVAC companies, car detailers, coffee shops, locksmiths, restaurants, beauty salons, contractors, and any brick-and-mortar or local-first business that needs a stunning, cinematic-quality website.

**The core promise:** We don't build average websites. We build websites so visually exceptional that clients look like they spent $20,000+ on an agency — powered by AI, delivered at a fraction of the cost.

**What makes us different:**
- Scroll-driven video animations that most agencies can't even pull off
- AI handles the entire build process via a guided chatbot onboarding
- Real SEO — not afterthought meta tags, but structured, Google-ready technical SEO
- CMS-editable after launch — clients own their content
- Cinematic design is non-negotiable. Every site looks like an award-winner.

**What we do NOT build:**
- E-commerce stores (clients needing ecom are referred to a custom engagement)
- SaaS products or web apps
- Anything requiring complex user authentication flows on the client site

---

## 2. BUSINESS MODEL

| | |
|---|---|
| **Company** | Tekmadev |
| **Platform URL** | `dashboard.tekmadev.com` |
| **Client site hosting** | Vercel |
| **Code repository** | `github.com/Tekmadev` (public repos per client) |
| **Database** | Supabase (1 shared project, max 50 clients at launch) |
| **Auth** | Supabase Auth (dashboard login) |
| **Starting price** | $297 CAD/month (Tier 1) |
| **Model** | Monthly subscription — clients pay monthly, we host and maintain |
| **Client capacity** | Max 50 at launch (lower limit for higher tiers) |

### Subscription Tiers (Overview)

| Tier | Name | Setup Fee (one-time) | Monthly | Core Differentiator |
|------|------|---------------------|---------|---------------------|
| **Tier 1** | Launch | $597 CAD | $297 CAD/mo | 1 scroll-video hero, landing page, SEO |
| **Tier 2** | Growth | TBD | TBD | Multi-page, multiple scroll sections |
| **Tier 3** | Pro | TBD | TBD | Restaurant menus, multi-video, booking default |
| **Custom** | Enterprise | Contact us | Contact us | E-commerce, custom features, custom design |

> **Pricing policy:**
> - All tiers require a **one-time setup fee** paid before work begins. This covers the build process, AI asset generation, and onboarding.
> - Monthly subscription begins on site launch date.
> - **Minimum 3-month commitment** on all tiers — protects against churners and signals client seriousness.
> - Clients who cancel before 3 months forfeit their setup fee with no refund.
> - Existing clients are grandfathered at their original monthly rate if pricing increases.
>
> Tiers 2, 3, and Custom are not yet fully scoped. This document focuses on **Tier 1**.

---

## 3. TIER 1 — FULL SPECIFICATION

### 3.1 What Is Tier 1?

Tier 1 is a **premium single-page landing site** (with a small number of utility sub-pages). It is designed for businesses that want:
- A gorgeous first impression
- A clear explanation of their service/product
- A way for customers to contact or book them
- Strong local SEO out of the box

Think: a coffee shop, a car detailer, an HVAC company, a locksmith, a beauty studio — anyone who needs to go from "we have a bad old website" to "we look like a serious brand."

---

### 3.2 Page Structure

#### Main Page (`/`)
The entire page is one cinematic scroll experience composed of these sections **in order**:

```
1. HERO          — Scroll-driven video background
2. SHOWCASE      — Products / services display  
3. MID-PAGE CTA  — Optional mid-scroll call to action
4. CONTACT       — Contact form + business info
5. FOOTER        — Links, social, copyright
```

#### Utility Pages (always included)
- `/terms` — Terms of Service (editable in CMS)
- `/privacy` — Privacy Policy (editable in CMS)

> Cookie consent banner is included sitewide.

---

### 3.3 Section Specifications

---

#### SECTION 1 — HERO (The Showstopper)

**Concept:** The hero takes up 100% of the viewport. Behind the headline and CTAs is a **fullscreen video** that plays and reverses based on the user's scroll position — exactly like Apple product pages or high-end automotive websites.

**Scroll Behavior (Critical):**
- On page load: video is paused at frame 0, hero content is visible
- As user scrolls DOWN → video plays forward, frame by frame, in sync with scroll position
- When video reaches its final frame → the scroll lock releases and the page begins scrolling naturally to the next section
- If the user scrolls UP while below the hero → the page scrolls back up to the hero and the video resumes playing in **reverse** from where it left off
- The transition between "locked hero scroll" and "free page scroll" must be seamless — no jump

**Video Specs:**
- Format: MP4 (WebM fallback) — provided by platform or uploaded by client
- Recommended duration: 3–8 seconds of footage (short loops work best for scroll scrubbing)
- Recommended resolution: 1920×1080 minimum, 3840×2160 preferred
- Mobile: Video scroll effect is preserved on mobile. The video plays/reverses on touch scroll. No static fallback — the video IS the experience.
- Generation: Recommended via our AI video generation pipeline (Runway ML, Sora API, or similar). Client may also upload their own.

**Hero Content Overlay (on top of video):**
- Business logo (image or text)
- Main headline (H1)
- Sub-headline / tagline
- Primary CTA button
- Secondary CTA button (optional)
- Scroll indicator animation (e.g. animated down arrow)

**Technical Implementation:**
- GSAP ScrollTrigger with `scrub` mode to sync video `currentTime` with scroll position
- `will-change: transform` on video for GPU acceleration
- The hero section has a fixed height that determines total scroll distance of the video (e.g. `height: 500vh` with `position: sticky`)

---

#### SECTION 2 — SHOWCASE

**Concept:** A beautiful display of the business's core products or services. Horizontal scroll carousel OR vertical grid — client picks in CMS.

**Rules:**
- Products: no item limit
- Services: max 10 items
- Each item has: `name`, `description`, `image/video`, optional `price` (can be hidden)
- Layout options available in CMS: `grid` | `horizontal-carousel` | `masonry`
- Scroll animations: each card animates in on scroll (fade-up, scale-in, or slide-in — all GSAP)
- Default layout recommendation: horizontal scroll carousel (most cinematic)

**Each Showcase Item fields:**
```
name            — string
tagline         — string (optional)
description     — string
image_url       — string (from asset storage)
video_url       — string (optional, short loop)
price           — number (optional, can be hidden)
price_label     — string (e.g. "Starting from", "Per session")
cta_label       — string (e.g. "Book Now", "Learn More")
cta_url         — string
```

---

#### SECTION 3 — MID-PAGE CTA (Optional)

**Concept:** A bold, high-contrast section between Showcase and Contact designed to capture users before they reach the form. Usually a strong headline + 1 button.

**Fields:**
```
enabled         — boolean
headline        — string
subtext         — string
button_label    — string
button_url      — string
background      — "color" | "image" | "gradient"
background_value — string (hex, image_url, or gradient definition)
```

---

#### SECTION 4 — CONTACT

**Default included:** Working contact form that:
1. Saves submission to Supabase `contact_submissions` table
2. Sends an email notification to the business owner's email

**Contact options (configurable in CMS):**
| Feature | Default | Optional Add-on |
|---------|---------|-----------------|
| Contact form | ✅ Yes | — |
| Phone number display | ✅ Yes | — |
| Email link | ✅ Yes | — |
| WhatsApp button | ❌ No | ✅ Optional (client enables) |
| Google Maps embed | ❌ No | ✅ Optional |
| Cal.com booking widget | ❌ No | ✅ Paid add-on |

**Contact Form Fields:**
```
name      — required
email     — required
phone     — optional
message   — required
```

**Cal.com Integration (Paid Add-on):**
- Integrated via Cal.com embed API
- Replaces or supplements the contact form
- Becomes default on Tier 2 and above

---

#### SECTION 5 — FOOTER

**Always included. Fields:**
```
logo_url / logo_text
tagline             — short brand statement
nav_links[]         — label + url
social_links[]      — platform + url (Instagram, Facebook, TikTok, X, LinkedIn)
phone               — string
email               — string
address             — string
copyright_text      — string (auto-generated but editable)
show_tekmadev_credit — boolean (recommended: true — "Built by Tekmadev")
```

---

### 3.4 Design System (Tier 1)

#### Fonts
Clients choose from a curated list. The CMS **shows a visual preview** of each font pairing before selection. AI recommends based on brand description.

| Pairing Name | Heading Font | Body Font | Vibe |
|---|---|---|---|
| "The Luxury" | Cormorant Garamond | Plus Jakarta Sans | High-end, feminine, editorial |
| "The Bold" | Clash Display | Inter | Modern, confident, startup |
| "The Classic" | Playfair Display | Lato | Timeless, trustworthy, professional |
| "The Minimal" | DM Serif Display | DM Sans | Clean, Scandinavian, minimal |
| "The Warm" | Libre Baskerville | Source Sans Pro | Approachable, homey, artisan |
| "The Edge" | Space Grotesk | Manrope | Tech-forward, edgy, digital-native |

#### Color System
- AI recommends a palette based on the business description and industry
- **Optional:** Client can provide a URL of their existing website or a competitor — our scraper extracts their current color palette and uses it as a starting reference (colors/theme only — design is always rebuilt from scratch by us)
- Client can also manually pick or override colors
- Each site gets: `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `text-muted`

#### Animation Preset
All Tier 1 sites use GSAP ScrollTrigger animations. The preset includes:
- Scroll-driven video (hero)
- Fade-up reveals on all section content
- Staggered card entrances
- Smooth parallax on section backgrounds
- Hover micro-animations on all interactive elements

---

### 3.5 SEO — Tier 1 (Full Coverage)

Tekmadev is known for SEO. Every Tier 1 site ships with:

| SEO Feature | Included |
|---|---|
| Title tag + meta description | ✅ |
| Open Graph tags (og:title, og:description, og:image) | ✅ |
| Twitter/X card meta tags | ✅ |
| Auto-generated og:image (1200×630) | ✅ |
| Canonical URL | ✅ |
| robots.txt | ✅ |
| sitemap.xml (auto-generated) | ✅ |
| Schema.org structured data (LocalBusiness) | ✅ |
| Schema.org: Service schema | ✅ |
| Schema.org: FAQ schema (if FAQ section added) | ✅ |
| Mobile-first responsive | ✅ |
| Core Web Vitals optimization | ✅ |
| Image compression + next/image lazy loading | ✅ |
| Font display swap | ✅ |
| HTTPS (via Vercel) | ✅ |
| Google Analytics 4 setup | ✅ |
| Cookie consent (GDPR-ready) | ✅ |
| Terms of Service page | ✅ |
| Privacy Policy page | ✅ |

**SEO Onboarding Deliverable (given to every client):**
After launch, every Tier 1 client receives a **personalized SEO setup guide** document (PDF + web page) that walks them through:
1. Verifying their site on Google Search Console
2. Submitting their sitemap
3. Setting up Google Business Profile
4. Basic ongoing SEO hygiene they can do themselves (monthly)
5. How to check their ranking progress

---

### 3.6 Hosting & Deployment

| | |
|---|---|
| **Hosting** | Vercel |
| **Repository** | Public GitHub repo under `github.com/Tekmadev` |
| **Domain** | Client provides their own domain, we configure DNS |
| **Framework** | Next.js (latest stable) |
| **CI/CD** | Auto-deploy on push to `main` via Vercel |
| **Environment** | `.env` managed in Vercel project settings |

---

## 4. CMS ARCHITECTURE

### 4.1 What Is the CMS?

The CMS is a **separate Next.js application** hosted at `dashboard.tekmadev.com`. It is NOT part of the client's website codebase. It is Tekmadev's internal platform where:
1. Clients log in and onboard via AI chatbot
2. Clients edit their website content after launch
3. Tekmadev manages all client accounts and deployments

### 4.2 CMS Tech Stack

```
Frontend:     Next.js (latest) + TypeScript
Styling:      Tailwind CSS v4
Auth:         Supabase Auth (email/password + Google OAuth)
Database:     Supabase PostgreSQL (1 shared project)
Storage:      Supabase Storage (images, videos, documents)
AI:           Anthropic API (claude-sonnet-4-6) — onboarding chatbot
Asset Gen:    External APIs (see Section 6)
Deployment:   Vercel
Repo:         github.com/Tekmadev/cms
```

### 4.3 CMS User Flow

```
1. Client visits dashboard.tekmadev.com
2. Signs up / logs in (Supabase Auth)
3. Greeted by AI onboarding chatbot
4. Chatbot collects ALL information needed to build the site (see Section 5)
   → Client is warned upfront: "This will take 15–20 minutes but ensures your site is perfect"
   → No question is skippable — every field is required
5. Client uploads any existing assets (logo, photos, videos)
6. AI generates missing assets (images via image gen API, videos via video gen API)
7. Site is built by website builder agent and pushed to GitHub
8. Vercel auto-deploys — site is live
9. Client can now edit content in the CMS dashboard
10. Any major changes trigger a rebuild via Vercel webhook
```

### 4.4 CMS Database Schema (Supabase — Shared Project)

```sql
-- One row per Tekmadev client account
clients
  id, created_at, email, full_name, company_name, phone,
  subscription_tier, subscription_status, subscription_start,
  monthly_price_cad, stripe_customer_id, stripe_subscription_id

-- One row per client website (1:1 with clients for now)
websites
  id, client_id, created_at, updated_at,
  domain, subdomain, vercel_project_id, github_repo_url,
  status (draft | building | live | paused),
  tier, build_log (jsonb)

-- The entire website content as structured JSON
website_content
  id, website_id, updated_at,
  site (jsonb),       -- name, domain, logo, colors, fonts, seo, social
  hero (jsonb),       -- tagline, headline, video, ctas
  showcase (jsonb),   -- items[], layout
  mid_cta (jsonb),    -- enabled, headline, button
  contact (jsonb),    -- form fields, phone, email, whatsapp, calcom
  footer (jsonb),     -- links, social, copyright
  pages (jsonb),      -- terms, privacy (text content)
  theme (jsonb)       -- color palette, font pairing, animation preset

-- All uploaded/generated assets per site
assets
  id, website_id, created_at,
  type (image | video | logo | document),
  url, storage_path, file_name, file_size,
  width, height, duration,
  alt_text, purpose (hero_video | showcase_item | og_image | etc.),
  generated_by (uploaded | ai_image | ai_video),
  generation_prompt (text)

-- Contact form submissions per site
contact_submissions
  id, website_id, created_at,
  name, email, phone, message,
  status (new | read | replied),
  ip_hash, user_agent

-- Onboarding chat history
onboarding_sessions
  id, website_id, created_at, completed_at,
  messages (jsonb array),      -- full chat history
  completion_status (in_progress | complete | abandoned),
  collected_data (jsonb)       -- structured data extracted from chat

-- Analytics events per site
site_analytics
  id, website_id, created_at,
  session_id, event_type, page_path,
  element_id, metadata (jsonb), user_agent, ip_hash

-- Add-on features per site
site_addons
  id, website_id, addon_type (calcom | whatsapp | maps | etc.),
  config (jsonb), enabled, monthly_cost_cad
```

---

## 5. ONBOARDING CHATBOT — QUESTION FLOW

The AI chatbot at `dashboard.tekmadev.com` must collect the following information. **No question is skippable.** The client is warned before starting that the process takes 15–20 minutes.

### Phase 1 — Business Identity
```
1. What is your business name?
2. What type of business are you? (industry/category)
3. What is your primary city and province/state?
4. Do you serve customers at a physical location, online, or both?
5. What is your website domain? (or do you need help choosing one?)
6. What is the ONE main thing you want website visitors to do?
   (call you / fill a form / book a service / visit your location)
```

### Phase 2 — Brand & Design
```
7.  Describe your brand in 3 words (e.g. "warm, professional, local")
8.  Do you have an existing logo? (upload prompt)
9.  If no logo: describe what you'd like (AI will generate options)
10. Do you have a color palette in mind? 
    → Option A: Yes, I have colors (hex/RGB input)
    → Option B: Inspire from my existing website (URL scrape for palette only)
    → Option C: Inspire from a competitor or example site (URL input)
    → Option D: Let the AI recommend based on my industry and brand words
11. Choose a font pairing (visual preview shown for each option)
12. What tone should your website feel? 
    (Luxurious / Bold / Friendly / Minimal / Energetic / Trustworthy)
```

### Phase 3 — Content
```
13. Write your main headline (or let AI suggest 3 options)
14. Write your sub-headline / tagline (or let AI suggest)
15. Tell us about your business in a few sentences 
    (this becomes the body copy — AI will polish it)
16. List your main services OR products (name + description each)
    → For each item: name, short description, image (upload or generate)
    → Optional: price or "starting from" price
17. Do you have existing photos of your work/product? (upload prompt)
    → If no: describe what you need (AI image generation)
18. Do you have a hero video? (upload prompt)
    → If no: describe the visual you want (AI video generation pipeline)
    → Guidance: "A 4–8 second cinematic clip of [your service/product]"
```

### Phase 4 — Contact & Business Details
```
19. What is your business phone number?
20. What is your contact/inquiry email?
21. What is your physical address? (or "remote/online only")
22. What are your business hours?
23. Do you want to display a WhatsApp button? (yes/no)
24. Do you want to embed a Google Maps location? (yes/no)
25. Do you use Cal.com for booking? (paid add-on — explain + offer)
```

### Phase 5 — Social & SEO
```
26. List your social media accounts (Instagram, Facebook, TikTok, etc.)
27. What are the 3–5 main keywords your customers search to find you?
    (e.g. "HVAC repair Hamilton", "car detailing Toronto")
28. Who is your ideal customer? (age range, location, situation)
29. What makes you different from your competitors? 
    (becomes the SEO value proposition)
```

### Phase 6 — Final Review
```
30. Review summary: AI presents a complete summary of all collected data
31. Client confirms or requests changes to any section
32. On confirm → build pipeline begins
```

---

## 6. ASSET GENERATION PIPELINE

### 6.1 Image Generation
- **Primary API:** To be determined (options: DALL-E 3, Midjourney API, Flux, Stable Diffusion XL)
- **Trigger:** When client has no photos for hero, showcase items, or og:image
- **Inputs:** Business type, tone, brand colors, item description
- **Output:** Images saved to Supabase Storage, URL stored in `assets` table
- **Formats:** WebP (primary), JPEG (fallback)
- **Sizes generated per image:**
  - Hero background: 3840×2160 (4K)
  - Showcase item: 800×600
  - OG image: 1200×630
  - Logo (if generated): SVG + PNG

### 6.2 Video Generation
- **Primary API:** Runway ML Gen-3 Alpha / Sora API (when available) / Kling
- **Trigger:** When client has no hero video
- **Inputs:** Business description, tone, brand colors, visual concept from chatbot
- **Output:** MP4 file, 3–8 seconds, 1920×1080 minimum, saved to Supabase Storage
- **Important:** Video must be SHORT (3–8s) because it is used for scroll scrubbing — not playback
- **WebM fallback:** Generated alongside MP4 for browser compatibility
- **Prompt structure:** See `AGENT_PROMPTS.md` → Video Generation Agent

### 6.3 Asset Storage Structure (Supabase Storage)
```
/clients/{client_id}/
  /hero/
    hero-video.mp4
    hero-video.webm
    hero-poster.jpg
  /showcase/
    item-1.webp
    item-2.webp
    ...
  /logo/
    logo.svg
    logo.png
    logo-dark.svg
  /seo/
    og-image.jpg
  /documents/
    terms.html
    privacy.html
```

---

## 7. WEBSITE BUILDER AGENT

The website builder agent takes the `website_content` JSON from Supabase and generates a complete Next.js project. It:

1. Clones the **Tier 1 base template** (a clean Next.js repo)
2. Populates all content from the `website_content` JSON
3. Configures the design system (colors, fonts) in `globals.css`
4. Sets correct asset URLs from Supabase Storage
5. Configures SEO metadata in `layout.tsx` and per-page
6. Generates `sitemap.xml` and `robots.txt`
7. Writes `schema.org` structured data JSON-LD
8. Creates the GitHub repo under `github.com/Tekmadev/{client-slug}`
9. Triggers Vercel deployment
10. Monitors deployment and reports success/errors
11. A **QA agent** then reviews the live site and reports any visual or functional issues

---

## 8. ROADMAP

### Phase 1 — Now (Active)
- [x] Dessert Shot website as Tier 1 proof of concept
- [ ] Define Tier 1 template (base repo, clean/headless)
- [ ] Build CMS dashboard (dashboard.tekmadev.com)
- [ ] Implement onboarding chatbot (Anthropic API)
- [ ] Implement image generation pipeline
- [ ] Implement video generation pipeline
- [ ] Implement website builder agent (content injection)
- [ ] GitHub + Vercel automation

### Phase 2 — Growth
- [ ] Tier 2 spec + template
- [ ] Tier 3 spec + template
- [ ] Cal.com add-on integration
- [ ] Stripe subscription management
- [ ] Client analytics dashboard
- [ ] SEO reporting dashboard

### Phase 3 — Scale
- [ ] Multi-language support
- [ ] Blog/news section add-on
- [ ] Automated monthly SEO reports to clients
- [ ] White-label option for other agencies

---

## 9. REFERENCE WEBSITES (INSPIRATION)

The following sites represent the visual/animation quality standard we are targeting:

- **AnimeJS.com** — Engine-level scroll animations, text reveal, motion precision
- **Apple.com product pages** — Scroll-driven video, sticky hero, cinematic flow
- **Linear.app** — Clean, dark, high-end SaaS feel
- **Lusion.co** — Experimental, award-winning web experience
- **Awwwards.com** — Ongoing reference for SOTD-quality sites

---

## 10. FINANCIAL MODEL

### Tier 1 Pricing (Confirmed)

| Fee | Amount | Notes |
|-----|--------|-------|
| **Setup fee (one-time)** | **$597 CAD** | Paid before build starts. Non-refundable. Covers build labor + AI asset generation. |
| **Monthly subscription** | **$297 CAD/mo** | Begins on launch day. Min. 3-month commitment. |
| **Minimum first invoice** | **$894 CAD** | Setup + month 1 + month 2 + month 3 |

### Cost Per Client (Our Actual API/Infrastructure Costs)

| Cost Item | Monthly (CAD) |
|-----------|--------------|
| Vercel Pro plan ÷ 50 clients | ~$0.55 |
| Supabase Pro plan ÷ 50 clients | ~$0.70 |
| Claude API (ongoing CMS content writes) | ~$0.70 |
| Email service (Resend) ÷ 50 clients | ~$0.55 |
| CDN / monitoring / misc | ~$0.70 |
| **Total monthly infra per client** | **~$3.20 CAD** |

| One-Time Setup Cost Item | Amount (CAD) |
|--------------------------|-------------|
| Claude API (onboarding + builder agent) | ~$1.40 |
| Video generation (Runway ML, 5s clip) | ~$0.70 |
| Image generation (~10 images) | ~$0.70 |
| **Total one-time API cost per client** | **~$2.80 CAD** |

### Profit Per Client

| | Amount |
|--|--------|
| Setup fee revenue | $597.00 CAD |
| Setup API costs (one-time) | -$2.80 CAD |
| **Setup profit** | **$594.20 CAD** |
| Monthly revenue | $297.00 CAD |
| Monthly infra costs | -$3.20 CAD |
| **Monthly profit per client** | **~$293.80 CAD (98.9% margin)** |

> The real cost of this business is **labor and platform development time** — not API bills. Once the platform is built, infrastructure is nearly free to scale.

### At 50 Clients (Full Capacity)

| Scenario | Monthly |
|----------|---------|
| 50 clients × $297/mo | $14,850 CAD |
| Infra costs (50 × $3.20) | -$160 CAD |
| **Net monthly (before labor)** | **$14,690 CAD** |
| + 10 new signups/mo × $597 setup | +$5,970 CAD |
| **Total monthly gross** | **~$20,660 CAD** |
| **Annual run rate at capacity** | **~$247,920 CAD** |

### Competitor Pricing Context (Canada 2026)
- Wix / Squarespace: $20–50 CAD/mo (DIY, generic templates)
- Managed WordPress: $30–400 CAD/mo (client does everything)
- Local agency retainer: $800–3,000 CAD/mo (for less value)
- Agency one-time build: $5,000–15,000 CAD (no ongoing support)
- **Tekmadev Tier 1: $597 setup + $297/mo = premium at a fraction of agency cost**

---

## 11. PROJECTS & REPOSITORIES

| Project | Purpose | Location |
|---------|---------|----------|
| **Dessert Shot** | Tier 1 live proof of concept (first real client) | Separate folder — not inside CMS |
| **CMS Dashboard** | `dashboard.tekmadev.com` — client onboarding, content editing, account management | Separate Next.js project folder |
| **Tier 1 Base Template** | Clean, headless Next.js template that the builder agent clones per client | Separate repo under `github.com/Tekmadev` |

> **Important:** The CMS (`dashboard.tekmadev.com`) and client sites (like Dessert Shot) are **always separate projects and separate folders.** They share a Supabase project for data but are deployed independently.

---

## 12. NOTES & DECISIONS LOG

| Date | Decision | Reason |
|------|----------|--------|
| Apr 2026 | Tier 1 hero video is scroll-scrubbed, not autoplay | More cinematic, matches Apple/luxury sites |
| Apr 2026 | Mobile: video scroll preserved (no static fallback) | Core experience, not a fallback feature |
| Apr 2026 | 1 Supabase project, max 50 clients | Simplicity at launch, migrate to per-client later |
| Apr 2026 | Cal.com = paid add-on on Tier 1, default on Tier 2+ | Differentiates tiers meaningfully |
| Apr 2026 | Color scraper = theme reference ONLY, not design copy | We always rebuild design from scratch |
| Apr 2026 | Public GitHub repos under Tekmadev org | Transparency, client access, CI/CD simplicity |
| Apr 2026 | WhatsApp = optional on all tiers | Not universal, avoid assuming |
| Apr 2026 | Horizontal scroll is recommended showcase layout | Most cinematic, fits premium positioning |
| Apr 2026 | Setup fee = $597 CAD one-time | Protects against churners, covers build labor |
| Apr 2026 | Monthly = $297 CAD, min 3-month commitment | Competitive entry price, recurring revenue |
| Apr 2026 | CMS is a completely separate project from client sites | CMS lives at dashboard.tekmadev.com, client sites are independent repos |
