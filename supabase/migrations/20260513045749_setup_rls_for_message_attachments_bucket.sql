create policy "Users can insert attachments only for messages they own" on storage.objects for insert to authenticated
with
  check (
    bucket_id = 'message_attachments'
    and exists (
      select
        1
      from
        public.messages m
      where
        m.id = (split_part(name, '/', 1))::uuid
        and m.sender_id = auth.uid ()
    )
  );

create policy "Users can select attachments only if they are a participant" on storage.objects for
select
  to authenticated using (
    bucket_id = 'message_attachments'
    and exists (
      select
        1
      from
        public.messages m
      where
        m.id = (split_part(name, '/', 1))::uuid
        and (
          m.sender_id = auth.uid ()
          or m.receiver_id = auth.uid ()
        )
    )
  );

create policy "Users can delete attachments only for messages they own" on storage.objects for delete to authenticated using (
  bucket_id = 'message_attachments'
  and exists (
    select
      1
    from
      public.messages m
    where
      m.id = (split_part(name, '/', 1))::uuid
      and m.sender_id = auth.uid ()
  )
);