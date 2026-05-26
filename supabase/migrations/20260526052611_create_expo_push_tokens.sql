create table
  expo_push_tokens (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references auth.users (id) on delete cascade not null,
    token text unique not null,
    created_at timestamptz default now()
  );

alter table expo_push_tokens enable row level security;

create policy "Users can insert their own push tokens" on expo_push_tokens for insert to authenticated
with
  check (auth.uid () = user_id);

create policy "Users can delete their own push tokens" on expo_push_tokens for delete to authenticated using (auth.uid () = user_id);

create policy "Users can select their own push tokens" on expo_push_tokens for
select
  to authenticated using (auth.uid () = user_id);