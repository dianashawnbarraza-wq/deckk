-- Profile header background image for public deck hero
alter table profiles
  add column if not exists header_url text;
