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
