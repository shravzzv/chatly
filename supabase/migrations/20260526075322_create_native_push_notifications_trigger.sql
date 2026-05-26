create
or replace trigger native_push_notification
after insert on public.messages for each row
execute function supabase_functions.http_request (
  'https://npbjaqzidsmgbovyawtw.supabase.co/functions/v1/send-native-push',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);