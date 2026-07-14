-- Featured shop items (star up to 4 in Studio)
alter table cards
  add column if not exists featured boolean not null default false;

create index if not exists cards_deck_featured_idx
  on cards (deck_id)
  where featured = true and type = 'item';
