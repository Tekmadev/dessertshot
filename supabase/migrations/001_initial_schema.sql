-- ============================================================
-- DESSERT SHOT — Supabase Initial Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Products / Flavours ──
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  name            text not null,
  slug            text unique not null,
  tagline         text not null default '',
  description     text not null default '',
  category        text check (category in ('fruity','chocolate','premium')) not null default 'fruity',
  emoji           text not null default '🍮',
  accent_color    text not null default '#F5A623',
  price_per_cup   numeric(6,2) not null default 7.50,
  is_active       boolean default true not null,
  is_featured     boolean default false not null,
  sort_order      int default 0 not null,
  layers          jsonb not null default '[]',
  image_url       text
);

-- ── Packages ──
create table if not exists packages (
  id              uuid primary key default uuid_generate_v4(),
  size            int check (size in (1, 6, 12, 24)) not null,
  label           text not null,
  price           numeric(7,2) not null,
  price_per_cup   numeric(6,2) not null,
  description     text not null default '',
  perks           text[] not null default '{}',
  is_featured     boolean default false not null,
  is_active       boolean default true not null
);

-- ── Orders ──
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null,
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text,
  package_size      int check (package_size in (1, 6, 12, 24)) not null,
  flavor_notes      text not null,
  desired_date      date not null,
  additional_notes  text,
  status            text check (status in ('pending','confirmed','preparing','ready','delivered','cancelled'))
                    not null default 'pending',
  fulfillment_method text check (fulfillment_method in ('pickup','delivery'))
                    not null default 'pickup',
  total_price       numeric(8,2) not null default 0,
  admin_notes       text
);

-- ── Order Items ──
create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid references orders(id) on delete cascade not null,
  product_id    uuid references products(id) on delete set null,
  flavor_name   text not null,
  quantity      int not null default 1 check (quantity > 0),
  price_per_cup numeric(6,2) not null
);

-- ── User Profiles ──
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  full_name     text,
  phone         text,
  address       text,
  city          text,
  province      text default 'ON',
  postal_code   text,
  total_orders  int default 0 not null,
  favorite_flavor text
);

-- ── Testimonials ──
create table if not exists testimonials (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now() not null,
  customer_name   text not null,
  location        text,
  rating          int check (rating between 1 and 5) not null default 5,
  text            text not null,
  flavor_tag      text,
  emoji           text,
  is_approved     boolean default false not null,
  is_featured     boolean default false not null
);

-- ── Analytics Events ──
create table if not exists analytics_events (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  session_id  text not null,
  event_type  text not null,
  page_path   text not null,
  element_id  text,
  metadata    jsonb,
  user_agent  text,
  ip_hash     text
);

-- ── Indexes ──
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_analytics_session on analytics_events(session_id);
create index if not exists idx_analytics_event_type on analytics_events(event_type);
create index if not exists idx_analytics_created on analytics_events(created_at desc);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_active on products(is_active);

-- ── Auto-update updated_at ──
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_updated_at_products
  before update on products
  for each row execute function update_updated_at();

create or replace trigger set_updated_at_orders
  before update on orders
  for each row execute function update_updated_at();

create or replace trigger set_updated_at_profiles
  before update on profiles
  for each row execute function update_updated_at();

-- ── Auto-create profile on signup ──
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Row Level Security ──
alter table products          enable row level security;
alter table packages          enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table profiles          enable row level security;
alter table testimonials      enable row level security;
alter table analytics_events  enable row level security;

-- Products: public read
create policy "Products are publicly readable"
  on products for select using (is_active = true);

-- Packages: public read
create policy "Packages are publicly readable"
  on packages for select using (is_active = true);

-- Testimonials: public read approved
create policy "Approved testimonials are publicly readable"
  on testimonials for select using (is_approved = true);

-- Orders: users can read their own orders
create policy "Users can read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Anyone can insert orders"
  on orders for insert
  with check (true);

-- Order items: read if owns the order
create policy "Users can read own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Profiles: own profile only
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Analytics: insert only (no user restriction for anonymous events)
create policy "Anyone can insert analytics events"
  on analytics_events for insert with check (true);

-- ── Seed: Packages ──
insert into packages (size, label, price, price_per_cup, description, perks, is_featured) values
(1,  'Single Cup',     7.50,  7.50, 'Try your favourite flavour, one perfect cup at a time.',
  array['Choose any flavour','Freshly assembled','Perfect for tasting'],
  false),
(6,  'Half Dozen',     42.00, 7.00, 'Great for sharing with family or a small gathering.',
  array['Mix & match flavours','Freshly assembled','Gift-ready packaging','Save $3 vs single'],
  false),
(12, 'Full Dozen',     78.00, 6.50, 'The party starter. Every occasion deserves a full dozen.',
  array['Mix & match flavours','Priority preparation','Gift-ready packaging','Free flavour recommendation','Save $12 vs single'],
  true),
(24, 'The Event Box', 144.00, 6.00, 'For weddings, baby showers, birthdays & corporate events.',
  array['Full flavour customization','Custom label option','Priority booking','Event delivery available','Presentation tray included','Save $36 vs single'],
  false)
on conflict do nothing;

-- ── Seed: Products ──
insert into products (name, slug, tagline, description, category, emoji, accent_color, price_per_cup, is_featured, sort_order, layers) values
('Mango Dream', 'mango-dream', 'Sun-kissed & tropical',
  'A tropical escape in every bite. Fresh mango coulis meets velvety mango cream cheese, resting on a golden biscuit crumble.',
  'fruity', '🥭', '#F5A623', 6.50, true, 1,
  '[{"label":"Biscuit Base","color":"#C49050","heightRem":2,"description":"Golden crumble"},{"label":"Mango Cream Cheese","color":"#FBBF47","heightRem":4,"description":"Velvety & light"},{"label":"Mango Coulis","color":"#F59E0B","heightRem":1.5,"description":"Concentrated mango"},{"label":"Fresh Mango Topping","color":"#FCD34D","heightRem":1.5,"description":"Real mango pieces"}]'::jsonb
),
('Strawberry Fields', 'strawberry-fields', 'Fresh & berry sweet',
  'Fresh strawberry compote layered over rose-tinted cream cheese with a vanilla biscuit base.',
  'fruity', '🍓', '#E8344A', 6.50, false, 2,
  '[{"label":"Biscuit Base","color":"#C49050","heightRem":2,"description":"Vanilla crumble"},{"label":"Strawberry Cream Cheese","color":"#FECDD3","heightRem":4,"description":"Rose & sweet"},{"label":"Strawberry Compote","color":"#F43F5E","heightRem":1.5,"description":"Thick & jammy"},{"label":"Fresh Strawberry","color":"#E11D48","heightRem":1.5,"description":"Real strawberry"}]'::jsonb
),
('Blueberry Haze', 'blueberry-haze', 'Deep & lush',
  'Wild blueberry compote sits atop a cloud of blueberry cream cheese.',
  'fruity', '🫐', '#4A3580', 6.50, false, 3,
  '[{"label":"Biscuit Base","color":"#C49050","heightRem":2,"description":"Golden crumble"},{"label":"Blueberry Cream Cheese","color":"#C4B5F4","heightRem":4,"description":"Purple & dreamy"},{"label":"Blueberry Compote","color":"#6D28D9","heightRem":1.5,"description":"Wild blueberries"},{"label":"Fresh Blueberries","color":"#4C1D95","heightRem":1.5,"description":"Plump & juicy"}]'::jsonb
),
('Kinder Bueno', 'kinder-bueno', 'Hazelnut & silky smooth',
  'Kinder Bueno cream cheese swirled with hazelnut, topped with rich chocolate ganache.',
  'chocolate', '🍫', '#D4700A', 7.50, true, 4,
  '[{"label":"Biscuit Base","color":"#C49050","heightRem":2,"description":"Hazelnut crumble"},{"label":"Kinder Cream Cheese","color":"#FDE68A","heightRem":4,"description":"Hazelnut & vanilla"},{"label":"Chocolate Ganache","color":"#78350F","heightRem":1.5,"description":"Dark & glossy"},{"label":"Kinder Bueno Piece","color":"#92400E","heightRem":1.5,"description":"The real thing"}]'::jsonb
),
('Ferrero Royale', 'ferrero-royale', 'Hazelnut & nutella luxury',
  'Nutella-laced cream cheese on a cocoa biscuit base, finished with a Ferrero Rocher on top.',
  'chocolate', '🎁', '#8B5E0A', 8.00, true, 5,
  '[{"label":"Cocoa Biscuit Base","color":"#92400E","heightRem":2,"description":"Dark crumble"},{"label":"Nutella Cream Cheese","color":"#D97706","heightRem":4,"description":"Velvety & rich"},{"label":"Nutella Layer","color":"#78350F","heightRem":1.5,"description":"Pure Nutella"},{"label":"Ferrero Rocher","color":"#451A03","heightRem":1.5,"description":"The crown jewel"}]'::jsonb
),
('Biscoff Bliss', 'biscoff-bliss', 'Caramel & spiced',
  'Lotus Biscoff spread woven through cream cheese, on a Biscoff cookie crumble base.',
  'premium', '🍪', '#C4860A', 8.50, true, 6,
  '[{"label":"Biscoff Crumble","color":"#B45309","heightRem":2,"description":"Crushed Lotus"},{"label":"Biscoff Cream Cheese","color":"#FCD34D","heightRem":4,"description":"Caramel spiced"},{"label":"Biscoff Spread","color":"#D97706","heightRem":1.5,"description":"Pure Lotus spread"},{"label":"Biscoff Cookie","color":"#92400E","heightRem":1.5,"description":"The signature"}]'::jsonb
),
('Dubai Chocolate', 'dubai-chocolate', 'Pistachio & opulence',
  'Inspired by the viral Dubai chocolate bar — pistachio cream cheese with kataifi crunch and gold dust.',
  'premium', '💚', '#5C7A4A', 9.00, true, 7,
  '[{"label":"Kataifi Crumble","color":"#C49050","heightRem":2,"description":"Crispy & buttery"},{"label":"Pistachio Cream Cheese","color":"#86EFAC","heightRem":4,"description":"Earthy & sweet"},{"label":"Dark Chocolate Ganache","color":"#3D1C0A","heightRem":1.5,"description":"Rich & deep"},{"label":"Gold Dust & Pistachio","color":"#D4A853","heightRem":1.5,"description":"24k gold touch"}]'::jsonb
)
on conflict (slug) do nothing;
