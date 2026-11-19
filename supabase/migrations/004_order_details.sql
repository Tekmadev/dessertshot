-- ============================================================
-- DESSERT SHOT — Order details, server-only writes, spam throttle
-- Run in the Supabase SQL editor AFTER 003_mix_and_match.sql.
--
-- ORDER MATTERS. Run this only after SUPABASE_SECRET_KEY is set in
-- Vercel (Production and Preview) and the site has been redeployed
-- with the Step 3 order flow. This migration stops the public
-- (publishable) key from writing orders; from then on only the
-- server, using the secret key, can. If it runs first, orders still
-- reach the inbox by email but are not saved until the key is set.
-- See docs/order-setup.md.
--
-- What it does:
--   1. Structured fields the order form now collects, so the owner
--      no longer digs the delivery address out of the notes:
--        event_type, delivery_address, delivery_postal_code, source
--      and a stable flavor_id on each line item.
--   2. Closes the public insert policies. Before this, anyone holding
--      the publishable key (it ships in every page) could write rows
--      straight into orders, skipping the site's validation.
--   3. A private table for the order API's spam limits. It stores
--      only salted hashes (never raw IPs or emails), deleted after
--      24 hours, plus a 30-day count of auto-replies.
--
-- Safe to re-run: every statement is idempotent or guarded.
-- ============================================================

-- ── 1. New nullable columns (existing rows unaffected) ──
alter table orders add column if not exists event_type text;
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_postal_code text;
alter table orders add column if not exists source text;

-- Constrain event_type to the event types in lib/events.ts (a test keeps
-- this list and that file in sync).
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

-- The API stores postal codes normalised to "A1A 1A1".
alter table orders drop constraint if exists orders_delivery_postal_code_check;
alter table orders
  add constraint orders_delivery_postal_code_check
  check (
    delivery_postal_code is null
    or delivery_postal_code ~ '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$'
  );

-- Names can be reworded; the registry id (lib/flavors.ts) never changes.
alter table order_items add column if not exists flavor_id text;

-- ── 2. Only the server writes orders ──
-- The secret key bypasses row level security, so the server needs no
-- policy. Reading stays as it was: signed-in customers see their own.
drop policy if exists "Anyone can insert orders" on orders;
drop policy if exists "Anyone can insert order items" on order_items;
drop policy if exists "Anyone can insert analytics events" on analytics_events;

-- ── 3. Spam throttle (private) ──
create table if not exists order_rate_limits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  bucket      text not null,
  key_hash    text not null
);

-- Buckets used by lib/server/rate-limit.ts (a test keeps the two in sync).
alter table order_rate_limits drop constraint if exists order_rate_limits_bucket_check;
alter table order_rate_limits
  add constraint order_rate_limits_bucket_check
  check (bucket in ('ip', 'ip_day', 'email', 'autoreply'));

create index if not exists idx_order_rate_limits_lookup
  on order_rate_limits (bucket, key_hash, created_at desc);
create index if not exists idx_order_rate_limits_created
  on order_rate_limits (created_at);

-- Row level security with no policies: the publishable key can neither
-- read nor write this table. Supabase no longer grants new tables to the
-- API roles automatically, so grant the server's role explicitly.
alter table order_rate_limits enable row level security;
revoke all on order_rate_limits from anon, authenticated;
grant select, insert, delete on order_rate_limits to service_role;

-- Count-and-record in one step, so two requests at the same moment can't
-- both slip under the limit. Returns false when the limit is reached.
-- Also clears old entries: hashed IPs and emails after a day; the monthly
-- auto-reply count (one shared key, no personal data) after 31 days.
create or replace function public.take_order_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_window_minutes integer,
  p_max integer
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  recent integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_bucket || ':' || p_key_hash, 0));

  delete from order_rate_limits
  where (bucket <> 'autoreply' and created_at < now() - interval '24 hours')
     or created_at < now() - interval '31 days';

  select count(*) into recent
  from order_rate_limits
  where bucket = p_bucket
    and key_hash = p_key_hash
    and created_at > now() - make_interval(mins => greatest(1, least(p_window_minutes, 44640)));

  if recent >= p_max then
    return false;
  end if;

  insert into order_rate_limits (bucket, key_hash) values (p_bucket, p_key_hash);
  return true;
end;
$$;

revoke all on function public.take_order_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.take_order_rate_limit(text, text, integer, integer) to service_role;

-- An earlier draft of this file defined a public count function for the
-- throttle. It is no longer used; drop it if it was ever created.
drop function if exists public.recent_order_count(text, integer);

-- Make the API see the new columns and function straight away.
notify pgrst, 'reload schema';
