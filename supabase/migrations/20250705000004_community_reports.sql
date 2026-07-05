-- M6: community reports for takedown path

create type report_target_type as enum ('profile', 'event');
create type report_status as enum ('pending', 'reviewed', 'actioned');

create table reports (
  id uuid primary key default gen_random_uuid(),
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text not null default '',
  reporter_email text,
  status report_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_target_idx on reports (target_type, target_id);
create index reports_status_idx on reports (status, created_at desc);

create trigger reports_updated_at before update on reports
  for each row execute function set_updated_at();

alter table reports enable row level security;

-- No public access; reports written only via service-role API route
create policy "reports_no_public" on reports for all
  using (false);

-- Directory index for published opt-in profiles
create index profiles_directory_idx on profiles (community_opt_in, is_published)
  where community_opt_in = true and is_published = true;
