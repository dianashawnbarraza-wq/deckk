-- M5: events table

create table events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'America/Los_Angeles',
  is_all_day boolean not null default false,
  location text,
  is_online boolean not null default false,
  url text,
  cover_url text,
  community_opt_in boolean not null default false,
  city text,
  is_canceled boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_profile_starts_idx on events (profile_id, starts_at);
create index events_community_idx on events (community_opt_in, starts_at)
  where community_opt_in = true and is_active = true and is_canceled = false;

create trigger events_updated_at before update on events
  for each row execute function set_updated_at();

alter table events enable row level security;

-- Public read: active events on published profiles
create policy "events_public_select" on events for select
  using (
    is_active = true and exists (
      select 1 from profiles p
      where p.id = profile_id and p.is_published = true
    )
  );

-- Owner read all (including drafts/canceled)
create policy "events_owner_select" on events for select
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

create policy "events_owner_insert" on events for insert
  with check (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

create policy "events_owner_update" on events for update
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );

create policy "events_owner_delete" on events for delete
  using (
    auth.uid() = (select user_id from profiles p where p.id = profile_id)
  );
