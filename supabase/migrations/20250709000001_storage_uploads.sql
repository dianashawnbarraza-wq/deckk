-- Public uploads bucket for creator images (flyers, product photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deckk-uploads',
  'deckk-uploads',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do nothing;

create policy "deckk_uploads_public_read"
on storage.objects for select
using (bucket_id = 'deckk-uploads');
