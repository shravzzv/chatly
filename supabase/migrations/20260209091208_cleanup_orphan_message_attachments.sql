-- Enable pg_cron if not already enabled
create extension if not exists pg_cron;

-- Cleanup orphaned message attachment files
create
or replace function cleanup_orphan_message_attachments () returns void language plpgsql security definer as $$
declare
  orphan record;
begin
  for orphan in
    select o.name
    from storage.objects o
    left join message_attachments ma
      on ma.path = o.name
    where o.bucket_id = 'message_attachments'
      and ma.id is null
  loop
    delete from storage.objects
    where bucket_id = 'message_attachments'
      and name = orphan.name;
  end loop;
end;
$$;

-- Schedule weekly cleanup (Sunday 03:00 UTC)
select
  cron.schedule (
    'weekly_message_attachment_cleanup',
    '0 3 * * 0',
    $$select cleanup_orphan_message_attachments();$$
  );