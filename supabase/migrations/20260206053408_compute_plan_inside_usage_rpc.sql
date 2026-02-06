-- RPC for enforcing and incrementing paid feature usage.
create
or replace function check_and_increment_usage (usage_kind text) returns table (used int, usage_limit int) language plpgsql security definer as $$
declare
  /** Current usage window (one row per user per day) */
  today date := current_date;

  /** Current usage count for the requested feature */
  current_used int;

  /** Maximum allowed usage for this feature and plan */
  usage_limit int;

  /** Most effective paid plan for the authenticated user */
  effective_plan text;
begin
  /**
   * 1. Validate input
   * The database only recognizes explicitly supported usage kinds.
   */
  if usage_kind not in ('media', 'ai') then
    raise exception 'INVALID_USAGE_KIND';
  end if;

  /**
   * 2. Resolve the user's effective subscription plan
   *
   * A subscription is considered effective if:
   * - It is in an active-like paid status, OR
   * - It was cancelled but has not yet ended
   *
   * If multiple subscriptions exist, we prefer:
   * - Stronger plans (enterprise > pro)
   * - More recently valid subscriptions
   */
  select s.plan
  into effective_plan
  from subscriptions s
  where s.user_id = auth.uid()
    and (
      s.status in ('active', 'on_trial', 'paused', 'past_due', 'unpaid')
      or (
        s.status = 'cancelled'
        and s.ends_at is not null
        and s.ends_at > now()
      )
    )
  order by
    case s.plan
      when 'enterprise' then 2
      when 'pro' then 1
      else 0
    end desc,
    coalesce(s.ends_at, s.created_at) desc
  limit 1;

  /** No effective subscription → free plan */
  if effective_plan is null then
    raise exception 'USER_ON_FREE_PLAN';
  end if;

  /**
   * 3. Resolve usage limits for the plan and feature
   * -------------------------------------------------------------------
   * Limits are enforced centrally here to keep the database authoritative.
   */
  usage_limit :=
    case
      when effective_plan = 'pro' and usage_kind = 'media' then 5
      when effective_plan = 'pro' and usage_kind = 'ai' then 5
      when effective_plan = 'enterprise' and usage_kind = 'media' then 50
      when effective_plan = 'enterprise' and usage_kind = 'ai' then 20
      else 0
    end;

  if usage_limit = 0 then
    raise exception 'FEATURE_NOT_AVAILABLE';
  end if;

  /**
   * 4. Ensure a usage window row exists for today
   * -------------------------------------------------------------------
   * This operation is idempotent and safe under concurrency.
   */
  insert into usage_windows (user_id, window_date)
  values (auth.uid(), today)
  on conflict (user_id, window_date)
  do nothing;

  /**
   * 5. Lock the usage row and read the current counter
   * -------------------------------------------------------------------
   * Row-level locking ensures correct behavior under concurrent requests.
   */
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

  /**
   * 6. Enforce the usage limit
   * -------------------------------------------------------------------
   * If the limit has been reached, abort the transaction.
   */
  if current_used >= usage_limit then
    raise exception 'USAGE_LIMIT_EXCEEDED';
  end if;

  /** 
   * 7. Increment the appropriate usage counter
   * -------------------------------------------------------------------
   * At this point:
   * - The row exists
   * - The row is locked
   * - The limit has not been exceeded
   */
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

  /**
   * 8. Return the updated usage state
   * -------------------------------------------------------------------
   */
  return query
  select current_used + 1, usage_limit;
end;
$$;