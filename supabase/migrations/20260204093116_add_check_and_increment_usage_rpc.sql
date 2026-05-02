-- RPC for handling increments.
create
or replace function check_and_increment_usage (usage_kind text, plan text) returns table (used int, usage_limit int) language plpgsql security definer as $$
declare
  today date := current_date;
  current_used int;
  usage_limit int;
begin
  -- 1. Validate inputs
  if usage_kind not in ('media', 'ai') then
    raise exception 'INVALID_USAGE_KIND';
  end if;

  if plan not in ('pro', 'enterprise') then
    raise exception 'INVALID_PLAN';
  end if;

  -- 2. Resolve the usage limit for the given plan and usage kind
  usage_limit :=
    case
      when plan = 'pro' and usage_kind = 'media' then 5
      when plan = 'pro' and usage_kind = 'ai' then 5
      when plan = 'enterprise' and usage_kind = 'media' then 50
      when plan = 'enterprise' and usage_kind = 'ai' then 20
    end;

  -- 3. Insert row if missing, idempotent initialization 
  insert into usage_windows (user_id, window_date)
  values (auth.uid(), today)
  on conflict (user_id, window_date)
  do nothing;

  -- 4. Lock the usage row and read the current counter
  select
    case
      when usage_kind = 'media' then media_used
      else ai_used
    end
  into current_used
  from usage_windows
  where user_id = auth.uid()
    and window_date = today
  for update;

  -- 5. Enforce the usage limit
  -- If the user has already reached the limit for this window,
  -- we abort the transaction. No changes are persisted.
  if current_used >= usage_limit then
    raise exception 'USAGE_LIMIT_EXCEEDED';
  end if;

  -- 6. Increment the appropriate counter
  -- At this point we know:
  --   - the row exists
  --   - the row is locked
  --   - the limit has not been exceeded
  -- It is now safe to increment the counter.
  if usage_kind = 'media' then
    update usage_windows
    set media_used = media_used + 1
    where user_id = auth.uid()
      and window_date = today;
  else
    update usage_windows
    set ai_used = ai_used + 1
    where user_id = auth.uid()
      and window_date = today;
  end if;

  -- 7. Return the updated usage state
  return query
  select current_used + 1, usage_limit;
end;
$$;