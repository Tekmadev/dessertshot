-- ============================================================
-- DESSERT SHOT — Mix & Match Migration
-- Run in Supabase SQL editor AFTER 002_menu_update.sql
--
-- Customers can now mix Classic and Premium flavours in a single
-- pack, priced per cup by tier. An order's `tier` therefore becomes
-- 'mixed' when it contains both, in addition to the existing
-- 'classic' / 'premium' values. The per-flavour breakdown (with
-- quantities) is written to `order_items`.
--
-- Safe to re-run: every statement is idempotent or guarded.
-- ============================================================

-- ── Allow the 'mixed' tier on orders ──
alter table orders drop constraint if exists orders_tier_check;
alter table orders
  add constraint orders_tier_check
  check (tier in ('classic', 'premium', 'mixed'));

-- ── Allow anonymous inserts into order_items ──
-- The order API writes the per-flavour breakdown right after creating the
-- order, using the anon/publishable key. order_items had RLS enabled in 001
-- with only a SELECT policy, so without an INSERT policy every breakdown row
-- is silently rejected and the table stays empty. This mirrors the existing
-- "Anyone can insert orders" trust model. The breakdown also lives in
-- orders.flavor_notes, so a missing policy degrades gracefully rather than
-- failing the order.
drop policy if exists "Anyone can insert order items" on order_items;
create policy "Anyone can insert order items"
  on order_items for insert
  with check (true);
