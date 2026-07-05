-- deckk.me initial schema (M1 foundations + M4 payments tables)

create extension if not exists citext;

-- Enums
create type primary_cta_type as enum ('shop', 'support', 'book', 'custom');
create type block_category as enum (
  'shop', 'social', 'listen', 'read', 'book', 'community', 'contact', 'custom'
);
create type payment_link_kind as enum ('tip', 'fixed', 'fundraiser');
create type order_status as enum ('paid', 'refunded', 'failed');

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  handle citext not null unique,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  primary_cta_type primary_cta_type not null default 'custom',
  primary_cta_ref text,
  theme jsonb not null default '{}'::jsonb,
  stripe_account_id text,
  charges_enabled boolean not null default false,
  community_opt_in boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint handle_format check (handle ~ '^[a-z0-9_]{3,30}$')
);

create index profiles_handle_idx on profiles (handle);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- handle_redirects
create table handle_redirects (
  id uuid primary key default gen_random_uuid(),
  old_handle citext not null unique,
  profile_id uuid not null references profiles(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger handle_redirects_updated_at before update on handle_redirects
  for each row execute function set_updated_at();

-- blocks
create table blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  category block_category not null default 'custom',
  title text not null,
  url text,
  icon text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blocks_profile_position_idx on blocks (profile_id, position);
create trigger blocks_updated_at before update on blocks
  for each row execute function set_updated_at();

-- products (M4)
create table products (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  price_cents int not null check (price_cents > 0),
  currency text not null default 'usd',
  inventory_qty int check (inventory_qty is null or inventory_qty >= 0),
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_profile_idx on products (profile_id);
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

-- payment_links (M4)
create table payment_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  kind payment_link_kind not null,
  title text not null,
  amount_cents int check (amount_cents is null or amount_cents > 0),
  goal_cents int check (goal_cents is null or goal_cents > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_link_amounts check (
    (kind = 'tip' and amount_cents is null) or
    (kind = 'fixed' and amount_cents is not null) or
    (kind = 'fundraiser' and goal_cents is not null)
  )
);

create index payment_links_profile_idx on payment_links (profile_id);
create trigger payment_links_updated_at before update on payment_links
  for each row execute function set_updated_at();

-- orders (M4) — webhook is the ONLY writer
create table orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete restrict,
  product_id uuid references products(id) on delete set null,
  payment_link_id uuid references payment_links(id) on delete set null,
  buyer_email text not null,
  stripe_payment_intent text not null unique,
  amount_cents int not null,
  currency text not null default 'usd',
  application_fee_cents int not null default 0,
  status order_status not null default 'paid',
  line_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_profile_idx on orders (profile_id);
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- RLS
alter table profiles enable row level security;
alter table handle_redirects enable row level security;
alter table blocks enable row level security;
alter table products enable row level security;
alter table payment_links enable row level security;
alter table orders enable row level security;

-- profiles: public read published only; owner writes
create policy "profiles_public_select" on profiles for select
  using (is_published = true);

create policy "profiles_owner_select" on profiles for select
  using (auth.uid() = user_id);

create policy "profiles_owner_insert" on profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_owner_update" on profiles for update
  using (auth.uid() = user_id);

create policy "profiles_owner_delete" on profiles for delete
  using (auth.uid() = user_id);

-- handle_redirects: public read for redirects; owner manage
create policy "handle_redirects_public_select" on handle_redirects for select
  using (expires_at > now());

create policy "handle_redirects_owner_all" on handle_redirects for all
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

-- blocks: public read active on published profiles; owner writes
create policy "blocks_public_select" on blocks for select
  using (
    is_active = true and exists (
      select 1 from profiles p
      where p.id = profile_id and p.is_published = true
    )
  );

create policy "blocks_owner_all" on blocks for all
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

-- products: public read active on published profiles; owner writes
create policy "products_public_select" on products for select
  using (
    is_active = true and exists (
      select 1 from profiles p
      where p.id = profile_id and p.is_published = true
    )
  );

create policy "products_owner_all" on products for all
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

-- payment_links: public read active on published profiles; owner writes
create policy "payment_links_public_select" on payment_links for select
  using (
    is_active = true and exists (
      select 1 from profiles p
      where p.id = profile_id and p.is_published = true
    )
  );

create policy "payment_links_owner_all" on payment_links for all
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

-- orders: owner read only; NO insert/update/delete from browser (service role only)
create policy "orders_owner_select" on orders for select
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );
