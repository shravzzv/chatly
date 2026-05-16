create policy "Avatars are viewable by everyone" on storage.objects for
select
  to public using (bucket_id = 'avatars');

create policy "Authenticated users can upload their own avatars" on storage.objects for insert to authenticated
with
  check (
    bucket_id = 'avatars'
    and (storage.foldername (name)) [1] = auth.uid ()::text
  );

create policy "Users can update their own avatars" on storage.objects for
update to authenticated using (
  bucket_id = 'avatars'
  AND (storage.foldername (name)) [1] = auth.uid ()::text
)
with
  check (
    bucket_id = 'avatars'
    AND (storage.foldername (name)) [1] = auth.uid ()::text
  );

create policy "Users can delete their own avatars" on storage.objects for delete to authenticated using (
  bucket_id = 'avatars'
  AND (storage.foldername (name)) [1] = auth.uid ()::text
);