-- Deckk 3.0 P0: unified decks + cards model (PRD §6.1)

create type card_type as enum ('event', 'item', 'announcement', 'link', 'collection');
create type card_status as enum ('draft', 'live', 'archived');
create type card_source as enum ('manual', 'extracted');
create type card_event_type as enum ('view', 'click', 'share');

create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  handle citext not null unique,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  theme jsonb not null default '{}'::jsonb,
  timezone text not null default 'America/Los_Angeles',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deck_handle_format check (handle ~ '^[a-z0-9_]{3,30}$')
);

create index decks_handle_idx on decks (handle);
create trigger decks_updated_at before update on decks
  for each row execute function set_updated_at();

create table deck_handle_redirects (
  id uuid primary key default gen_random_uuid(),
  old_handle citext not null unique,
  deck_id uuid not null references decks(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references decks(id) on delete cascade,
  type card_type not null,
  title text not null,
  description text,
  media jsonb not null default '[]'::jsonb,
  date_start timestamptz,
  date_end timestamptz,
  location_name text,
  location_address text,
  cta_label text,
  cta_url text,
  price numeric,
  currency text default 'usd',
  tags text[] not null default '{}',
  pinned boolean not null default false,
  status card_status not null default 'live',
  position int,
  source card_source not null default 'manual',
  extraction_confidence jsonb,
  collection_id uuid references cards(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cards_deck_id_idx on cards (deck_id);
create index cards_deck_status_idx on cards (deck_id, status);
create unique index cards_one_pinned_per_deck on cards (deck_id) where pinned = true;

create trigger cards_updated_at before update on cards
  for each row execute function set_updated_at();

create table card_events (
  id bigint generated always as identity primary key,
  card_id uuid references cards(id) on delete set null,
  deck_id uuid not null references decks(id) on delete cascade,
  event_type card_event_type not null,
  visitor_id text,
  created_at timestamptz not null default now()
);

create index card_events_deck_created_idx on card_events (deck_id, created_at desc);

-- RLS
alter table decks enable row level security;
alter table deck_handle_redirects enable row level security;
alter table cards enable row level security;
alter table card_events enable row level security;

create policy "decks_public_select" on decks for select
  using (is_published = true);

create policy "decks_owner_select" on decks for select
  using (auth.uid() = user_id);

create policy "decks_owner_insert" on decks for insert
  with check (auth.uid() = user_id);

create policy "decks_owner_update" on decks for update
  using (auth.uid() = user_id);

create policy "decks_owner_delete" on decks for delete
  using (auth.uid() = user_id);

create policy "deck_handle_redirects_public_select" on deck_handle_redirects for select
  using (expires_at > now());

create policy "deck_handle_redirects_owner_all" on deck_handle_redirects for all
  using (
    auth.uid() = (select user_id from decks d where d.id = deck_id)
  );

create policy "cards_public_select" on cards for select
  using (
    status = 'live' and exists (
      select 1 from decks d
      where d.id = deck_id and d.is_published = true
    )
  );

create policy "cards_owner_all" on cards for all
  using (
    auth.uid() = (select user_id from decks d where d.id = deck_id)
  );

-- card_events: insert via service role only; owner read
create policy "card_events_owner_select" on card_events for select
  using (
    auth.uid() = (select user_id from decks d where d.id = deck_id)
  );
