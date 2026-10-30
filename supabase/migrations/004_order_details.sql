-- ============================================================
-- DESSERT SHOT — Order details + spam throttle   (DRAFT)
-- Run in the Supabase SQL editor AFTER 003_mix_and_match.sql.
--
-- STATUS: DRAFT. Do not run until Step 3 (order flow) finalizes it;
-- it will be handed over with review round 1.
--
-- Adds structured fields the new order flow collects, so the owner no
-- longer has to dig the delivery address out of the notes:
--   - event_type            optional dropdown (analytics + event pages)
--   - delivery_address      street address for delivery quotes
--   - delivery_postal_code  postal code for delivery quotes
--   - source                deep-link origin, e.g. "menu/dubai-chocolate"
--   - client_ip_hash        salted hash of the requester IP (never the raw IP)
-- and a narrow, count-only function the API uses for rate limiting.
--
-- Safe to re-run: every statement is idempotent or guarded.
-- ============================================================

-- ── New nullable columns (existing rows unaffected) ──
alter table orders add column if not exists event_type text;
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_postal_code text;
alter table orders add column if not exists source text;
alter table orders add column if not exists client_ip_hash text;

-- ── Constrain event_type to the event pages' types ──
alter table orders drop constraint if exists orders_event_type_check;
alter table orders
  add constraint orders_event_type_check
  check (
    event_type is null
    or event_type in (
      'wedding', 'baby-shower', 'bridal-shower', 'birthday',
      'graduation', 'corporate', 'cultural', 'other'
    )
  );

-- Canadian postal code shape (A1A 1A1, space optional), when present.
alter table orders drop constraint if exists orders_delivery_postal_code_check;
alter table orders
  add constraint orders_delivery_postal_code_check
  check (
    delivery_postal_code is null
    or delivery_postal_code ~* '^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$'
  );

create index if not exists idx_orders_ip_created
  on orders(client_ip_hash, created_at desc);

-- ── Stable flavour id on each line item ──
-- Names can be reworded; the registry id (lib/flavors.ts) never changes.
alter table order_items add column if not exists flavor_id text;

-- Step 3 must also resolve, before this ships (from the Step 1 review):
--   * move order writes to a server-only Supabase key and tighten the
--     insert policies from 001/003 to match.
--   * event_type values must come from one EVENT_TYPES registry shared with
--     the /events/[type] routes and the form.
--   * postal codes: normalise in the shared schema; align this CHECK with it.
--   * client_ip_hash retention: keep hashes out of orders (separate table,
--     purged after 24h) and select explicit columns in GET /api/orders.

-- ── Rate-limit helper ──
-- The API uses the publishable (anon) key, and anon cannot SELECT orders.
-- This SECURITY DEFINER function exposes ONLY a count of recent orders for one
-- IP hash — no rows, no columns. search_path is pinned so it can't be hijacked.
create or replace function public.recent_order_count(
  p_ip_hash text,
  p_minutes integer default 60
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.orders
  where client_ip_hash = p_ip_hash
    and created_at > now() - make_interval(mins => greatest(1, least(p_minutes, 1440)));
$$;

revoke all on function public.recent_order_count(text, integer) from public;
grant execute on function public.recent_order_count(text, integer) to anon, authenticated;
