-- ============================================================
-- DESSERT SHOT — Menu Restructure Migration
-- Run in Supabase SQL editor AFTER 001_initial_schema.sql
--
-- Adds cup_size (2oz Mini Shots / 5oz Dessert Cups) and tier
-- (classic / premium) to orders, and moves package_size to the
-- new pack quantities (24 / 48 / 96).
--
-- Safe to re-run: every statement is idempotent or guarded.
-- ============================================================

-- ── New columns (existing rows inherit sensible defaults) ──
alter table orders
  add column if not exists cup_size text not null default '5oz';

alter table orders
  add column if not exists tier text not null default 'classic';

-- Rush flag: true when the customer needs it in under 48 hours.
-- No price is stored — the rush fee is quoted by hand when the order is confirmed.
alter table orders
  add column if not exists is_rush boolean not null default false;

-- ── Constrain the new columns ──
alter table orders drop constraint if exists orders_cup_size_check;
alter table orders
  add constraint orders_cup_size_check
  check (cup_size in ('2oz', '5oz'));

alter table orders drop constraint if exists orders_tier_check;
alter table orders
  add constraint orders_tier_check
  check (tier in ('classic', 'premium'));

-- ── Move package_size to 24 / 48 / 96 ──
-- The old 001 constraint allowed (1, 6, 12, 24). We replace it with the
-- new quantities. Added as NOT VALID so the swap never fails on legacy
-- test rows (e.g. an old size-1 order) — it still enforces on every new
-- insert/update from here forward.
alter table orders drop constraint if exists orders_package_size_check;
alter table orders
  add constraint orders_package_size_check
  check (package_size in (24, 48, 96)) not valid;

-- ── Helpful indexes for the new dimensions ──
create index if not exists idx_orders_cup_size on orders(cup_size);
create index if not exists idx_orders_tier on orders(tier);
