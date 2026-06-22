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
