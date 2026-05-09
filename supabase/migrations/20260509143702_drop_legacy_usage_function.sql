SET
  statement_timeout = 0;

SET
  lock_timeout = 0;

SET
  idle_in_transaction_session_timeout = 0;

SET
  client_encoding = 'UTF8';

SET
  standard_conforming_strings = on;

SELECT
  pg_catalog.set_config ('search_path', '', false);

SET
  check_function_bodies = false;

SET
  xmloption = content;

SET
  client_min_messages = warning;

SET
  row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron"
WITH
  SCHEMA "pg_catalog";

CREATE EXTENSION IF NOT EXISTS "pg_net"
WITH
  SCHEMA "extensions";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "http"
WITH
  SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "hypopg"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "index_advisor"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql"
WITH
  SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault"
WITH
  SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH
  SCHEMA "extensions";

CREATE
OR REPLACE FUNCTION "public"."check_and_increment_usage" ("usage_kind" "text") RETURNS TABLE ("used" integer, "usage_limit" integer) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
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
  if auth.uid() is null then 
    raise exception 'UNAUTHORIZED';
  end if;

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

ALTER FUNCTION "public"."check_and_increment_usage" ("usage_kind" "text") OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."cleanup_orphan_message_attachments" () RETURNS "void" LANGUAGE "plpgsql" SECURITY DEFINER AS $$
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

ALTER FUNCTION "public"."cleanup_orphan_message_attachments" () OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."handle_messages_updated_at" () RETURNS "trigger" LANGUAGE "plpgsql" AS $$begin
  new.updated_at = now();
  return new;
end;$$;

ALTER FUNCTION "public"."handle_messages_updated_at" () OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."handle_new_user" () RETURNS "trigger" LANGUAGE "plpgsql" SECURITY DEFINER AS $$
begin
  insert into public.profiles (
    id,
    user_id,
    name,
    username,
    avatar_url,
    bio,
    status,
    theme
  )
  values (
    gen_random_uuid(),
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
    coalesce(new.raw_user_meta_data->>'username', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    null,
    'offline',
    'system'
  );

  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user" () OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."handle_profiles_updated_at" () RETURNS "trigger" LANGUAGE "plpgsql" AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_profiles_updated_at" () OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."handle_subscriptions_updated_at" () RETURNS "trigger" LANGUAGE "plpgsql" AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_subscriptions_updated_at" () OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."rls_auto_enable" () RETURNS "event_trigger" LANGUAGE "plpgsql" SECURITY DEFINER
SET
  "search_path" TO 'pg_catalog' AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

ALTER FUNCTION "public"."rls_auto_enable" () OWNER TO "postgres";

SET
  default_tablespace = '';

SET
  default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS
  "public"."message_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid" () NOT NULL,
    "message_id" "uuid" NOT NULL,
    "path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now" (),
    "file_name" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "size" integer NOT NULL
  );

ALTER TABLE ONLY "public"."message_attachments" REPLICA IDENTITY FULL;

ALTER TABLE "public"."message_attachments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS
  "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid" () NOT NULL,
    "text" "text",
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now" (),
    "updated_at" timestamp with time zone DEFAULT "now" ()
  );

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;

ALTER TABLE "public"."messages" OWNER TO "postgres";

COMMENT ON TABLE "public"."messages" IS 'Stores the messages for each user in Chatly.';

CREATE TABLE IF NOT EXISTS
  "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid" () NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "username" "text",
    "avatar_url" "text",
    "bio" "text",
    "status" "text" DEFAULT 'offline'::"text" NOT NULL,
    "last_seen_at" timestamp with time zone,
    "theme" "text" DEFAULT 'system'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now" () NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now" () NOT NULL,
    CONSTRAINT "profiles_status_check" CHECK (
      (
        "status" = ANY (
          ARRAY[
            'online'::"text",
            'offline'::"text",
            'idle'::"text"
          ]
        )
      )
    ),
    CONSTRAINT "profiles_theme_check" CHECK (
      (
        "theme" = ANY (
          ARRAY['light'::"text", 'dark'::"text", 'system'::"text"]
        )
      )
    )
  );

ALTER TABLE "public"."profiles" OWNER TO "postgres";

COMMENT ON TABLE "public"."profiles" IS 'Stores Chatly user identity, presence, and preferences. 1:1 with auth.users.';

COMMENT ON COLUMN "public"."profiles"."user_id" IS 'FK to auth.users.id. One profile per user.';

COMMENT ON COLUMN "public"."profiles"."name" IS 'Display name of the user. Pulled from OAuth metadata if available.';

COMMENT ON COLUMN "public"."profiles"."username" IS 'Unique username chosen by the user.';

COMMENT ON COLUMN "public"."profiles"."avatar_url" IS 'User avatar URL. Sourced from OAuth providers or user upload.';

COMMENT ON COLUMN "public"."profiles"."status" IS 'Presence status: online, offline, or idle. Stored only as data; presence system not yet implemented.';

COMMENT ON COLUMN "public"."profiles"."last_seen_at" IS 'Timestamp of last seen activity.';

COMMENT ON COLUMN "public"."profiles"."theme" IS 'User-selected theme: light / dark / system.';

CREATE TABLE IF NOT EXISTS
  "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4" () NOT NULL,
    "user_id" "uuid",
    "subscription" "jsonb" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now" ()
  );

ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";

COMMENT ON TABLE "public"."push_subscriptions" IS 'Stores the data related to web push notifications.';

CREATE TABLE IF NOT EXISTS
  "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid" () NOT NULL,
    "user_id" "uuid",
    "ls_subscription_id" "text" NOT NULL,
    "plan" "text" NOT NULL,
    "billing" "text" NOT NULL,
    "status" "text" NOT NULL,
    "renews_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now" () NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now" () NOT NULL,
    "ls_customer_id" "text",
    CONSTRAINT "subscriptions_billing_check" CHECK (
      (
        "billing" = ANY (ARRAY['monthly'::"text", 'yearly'::"text"])
      )
    ),
    CONSTRAINT "subscriptions_plan_check" CHECK (
      (
        "plan" = ANY (ARRAY['pro'::"text", 'enterprise'::"text"])
      )
    ),
    CONSTRAINT "subscriptions_status_check" CHECK (
      (
        "status" = ANY (
          ARRAY[
            'on_trial'::"text",
            'active'::"text",
            'paused'::"text",
            'past_due'::"text",
            'unpaid'::"text",
            'cancelled'::"text",
            'expired'::"text"
          ]
        )
      )
    )
  );

ALTER TABLE "public"."subscriptions" OWNER TO "postgres";

COMMENT ON TABLE "public"."subscriptions" IS 'Acts as a mirror of the LS Chatly''s store. This is the table that the lemon squeezy webhook updates, and is used to gate features.';

COMMENT ON COLUMN "public"."subscriptions"."user_id" IS 'FK to auth.users. Subscription belongs to this user.';

COMMENT ON COLUMN "public"."subscriptions"."ls_subscription_id" IS 'Lemon Squeezy subscription ID (payload.data.id). Unique per subscription.';

COMMENT ON COLUMN "public"."subscriptions"."plan" IS 'Plan name: pro or enterprise. Derived from variant_name.';

COMMENT ON COLUMN "public"."subscriptions"."billing" IS 'Billing cycle: monthly or yearly. Derived from variant_name.';

COMMENT ON COLUMN "public"."subscriptions"."status" IS 'Current LS subscription status: active, paused, cancelled, expired, etc.';

COMMENT ON COLUMN "public"."subscriptions"."renews_at" IS 'Next scheduled billing timestamp.';

COMMENT ON COLUMN "public"."subscriptions"."ends_at" IS 'When subscription access ends (null if ongoing).';

CREATE TABLE IF NOT EXISTS
  "public"."usage_windows" (
    "user_id" "uuid" NOT NULL,
    "window_date" "date" NOT NULL,
    "media_used" integer DEFAULT 0 NOT NULL,
    "ai_used" integer DEFAULT 0 NOT NULL
  );

ALTER TABLE "public"."usage_windows" OWNER TO "postgres";

COMMENT ON TABLE "public"."usage_windows" IS 'Derived, time-bucketed accounting table.';

ALTER TABLE ONLY "public"."message_attachments"
ADD CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."messages"
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."profiles"
ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."push_subscriptions"
ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."subscriptions"
ADD CONSTRAINT "subscriptions_ls_subscription_id_key" UNIQUE ("ls_subscription_id");

ALTER TABLE ONLY "public"."subscriptions"
ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."usage_windows"
ADD CONSTRAINT "usage_windows_pkey" PRIMARY KEY ("user_id", "window_date");

CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("sender_id", "receiver_id");

CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at");

CREATE INDEX "idx_messages_receiver" ON "public"."messages" USING "btree" ("receiver_id");

CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");

CREATE INDEX "idx_profiles_created_at" ON "public"."profiles" USING "btree" ("created_at");

CREATE INDEX "idx_profiles_last_seen_at" ON "public"."profiles" USING "btree" ("last_seen_at");

CREATE INDEX "idx_profiles_status" ON "public"."profiles" USING "btree" ("status");

CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");

CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");

CREATE INDEX "idx_subscriptions_ends_at" ON "public"."subscriptions" USING "btree" ("ends_at");

CREATE INDEX "idx_subscriptions_ls_subscription_id" ON "public"."subscriptions" USING "btree" ("ls_subscription_id");

CREATE INDEX "idx_subscriptions_renews_at" ON "public"."subscriptions" USING "btree" ("renews_at");

CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");

CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");

CREATE INDEX "messages_updated_at_idx" ON "public"."messages" USING "btree" ("updated_at");

CREATE INDEX "usage_windows_window_date_idx" ON "public"."usage_windows" USING "btree" ("window_date");

CREATE
OR REPLACE TRIGGER "mirror-avatar"
AFTER INSERT ON "public"."profiles" FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request" (
  'https://cnmrbnphntasntzxeeqm.supabase.co/functions/v1/mirror-avatar',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

CREATE
OR REPLACE TRIGGER "set_messages_updated_at" BEFORE
UPDATE ON "public"."messages" FOR EACH ROW
EXECUTE FUNCTION "public"."handle_messages_updated_at" ();

CREATE
OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE
UPDATE ON "public"."profiles" FOR EACH ROW
EXECUTE FUNCTION "public"."handle_profiles_updated_at" ();

CREATE
OR REPLACE TRIGGER "set_subscriptions_updated_at" BEFORE
UPDATE ON "public"."subscriptions" FOR EACH ROW
EXECUTE FUNCTION "public"."handle_subscriptions_updated_at" ();

CREATE
OR REPLACE TRIGGER "web-push-notification"
AFTER INSERT ON "public"."messages" FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request" (
  'https://chatly-brown.vercel.app/notify',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

ALTER TABLE ONLY "public"."message_attachments"
ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."messages"
ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."messages"
ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."profiles"
ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."push_subscriptions"
ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."subscriptions"
ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."usage_windows"
ADD CONSTRAINT "usage_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

CREATE POLICY "Anyone can view all profiles" ON "public"."profiles" FOR
SELECT
  USING (true);

CREATE POLICY "Users can delete attachments for messages they sent" ON "public"."message_attachments" FOR DELETE TO "authenticated" USING (
  (
    EXISTS (
      SELECT
        1
      FROM
        "public"."messages"
      WHERE
        (
          (
            "messages"."id" = "message_attachments"."message_id"
          )
          AND ("messages"."sender_id" = "auth"."uid" ())
        )
    )
  )
);

CREATE POLICY "Users can delete their own push subscriptions" ON "public"."push_subscriptions" FOR DELETE USING (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can delete their own sent messages" ON "public"."messages" FOR DELETE USING (("auth"."uid" () = "sender_id"));

CREATE POLICY "Users can delete their own subscription" ON "public"."subscriptions" FOR DELETE USING (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can delete their own usage" ON "public"."usage_windows" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid" ()));

CREATE POLICY "Users can insert message attachments for their own messages" ON "public"."message_attachments" FOR INSERT TO "authenticated"
WITH
  CHECK (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."messages"
        WHERE
          (
            (
              "messages"."id" = "message_attachments"."message_id"
            )
            AND ("messages"."sender_id" = "auth"."uid" ())
          )
      )
    )
  );

CREATE POLICY "Users can insert messages as sender" ON "public"."messages" FOR INSERT
WITH
  CHECK (("auth"."uid" () = "sender_id"));

CREATE POLICY "Users can insert their own push subscriptions" ON "public"."push_subscriptions" FOR INSERT
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can insert their own subscription" ON "public"."subscriptions" FOR INSERT
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can insert their own usage" ON "public"."usage_windows" FOR INSERT TO "authenticated"
WITH
  CHECK (("user_id" = "auth"."uid" ()));

CREATE POLICY "Users can read their own usage" ON "public"."usage_windows" FOR
SELECT
  TO "authenticated" USING (("user_id" = "auth"."uid" ()));

CREATE POLICY "Users can select their own subscription" ON "public"."subscriptions" FOR
SELECT
  USING (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR
UPDATE USING (("auth"."uid" () = "user_id"))
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can update their own push subscriptions" ON "public"."push_subscriptions" FOR
UPDATE USING (("auth"."uid" () = "user_id"))
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can update their own sent messages" ON "public"."messages" FOR
UPDATE USING (("auth"."uid" () = "sender_id"));

CREATE POLICY "Users can update their own subscription" ON "public"."subscriptions" FOR
UPDATE USING (("auth"."uid" () = "user_id"))
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can update their own usage" ON "public"."usage_windows" FOR
UPDATE TO "authenticated" USING (("user_id" = "auth"."uid" ()))
WITH
  CHECK (("user_id" = "auth"."uid" ()));

CREATE POLICY "Users can view message attachments if they are a participant" ON "public"."message_attachments" FOR
SELECT
  TO "authenticated" USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."messages"
        WHERE
          (
            (
              "messages"."id" = "message_attachments"."message_id"
            )
            AND (
              ("messages"."sender_id" = "auth"."uid" ())
              OR ("messages"."receiver_id" = "auth"."uid" ())
            )
          )
      )
    )
  );

CREATE POLICY "Users can view their own push subscriptions" ON "public"."push_subscriptions" FOR
SELECT
  USING (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can view their sent and received messages" ON "public"."messages" FOR
SELECT
  USING (
    (
      ("auth"."uid" () = "sender_id")
      OR ("auth"."uid" () = "receiver_id")
    )
  );

ALTER TABLE "public"."message_attachments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."usage_windows" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

ALTER PUBLICATION "supabase_realtime"
ADD TABLE ONLY "public"."message_attachments";

ALTER PUBLICATION "supabase_realtime"
ADD TABLE ONLY "public"."messages";

ALTER PUBLICATION "supabase_realtime"
ADD TABLE ONLY "public"."profiles";

ALTER PUBLICATION "supabase_realtime"
ADD TABLE ONLY "public"."usage_windows";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."bytea_to_text" ("data" "bytea") TO "postgres";

GRANT ALL ON FUNCTION "public"."bytea_to_text" ("data" "bytea") TO "anon";

GRANT ALL ON FUNCTION "public"."bytea_to_text" ("data" "bytea") TO "authenticated";

GRANT ALL ON FUNCTION "public"."bytea_to_text" ("data" "bytea") TO "service_role";

GRANT ALL ON FUNCTION "public"."check_and_increment_usage" ("usage_kind" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."check_and_increment_usage" ("usage_kind" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_and_increment_usage" ("usage_kind" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."cleanup_orphan_message_attachments" () TO "anon";

GRANT ALL ON FUNCTION "public"."cleanup_orphan_message_attachments" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."cleanup_orphan_message_attachments" () TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_messages_updated_at" () TO "anon";

GRANT ALL ON FUNCTION "public"."handle_messages_updated_at" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_messages_updated_at" () TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user" () TO "anon";

GRANT ALL ON FUNCTION "public"."handle_new_user" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_new_user" () TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_profiles_updated_at" () TO "anon";

GRANT ALL ON FUNCTION "public"."handle_profiles_updated_at" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_profiles_updated_at" () TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_subscriptions_updated_at" () TO "anon";

GRANT ALL ON FUNCTION "public"."handle_subscriptions_updated_at" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_subscriptions_updated_at" () TO "service_role";

GRANT ALL ON FUNCTION "public"."http" ("request" "public"."http_request") TO "postgres";

GRANT ALL ON FUNCTION "public"."http" ("request" "public"."http_request") TO "anon";

GRANT ALL ON FUNCTION "public"."http" ("request" "public"."http_request") TO "authenticated";

GRANT ALL ON FUNCTION "public"."http" ("request" "public"."http_request") TO "service_role";

GRANT ALL ON FUNCTION "public"."http_delete" ("uri" character varying) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_delete" ("uri" character varying) TO "anon";

GRANT ALL ON FUNCTION "public"."http_delete" ("uri" character varying) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_delete" ("uri" character varying) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_delete" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_delete" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "anon";

GRANT ALL ON FUNCTION "public"."http_delete" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_delete" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying) TO "anon";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying, "data" "jsonb") TO "postgres";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying, "data" "jsonb") TO "anon";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying, "data" "jsonb") TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_get" ("uri" character varying, "data" "jsonb") TO "service_role";

GRANT ALL ON FUNCTION "public"."http_head" ("uri" character varying) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_head" ("uri" character varying) TO "anon";

GRANT ALL ON FUNCTION "public"."http_head" ("uri" character varying) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_head" ("uri" character varying) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_header" (
  "field" character varying,
  "value" character varying
) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_header" (
  "field" character varying,
  "value" character varying
) TO "anon";

GRANT ALL ON FUNCTION "public"."http_header" (
  "field" character varying,
  "value" character varying
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_header" (
  "field" character varying,
  "value" character varying
) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_list_curlopt" () TO "postgres";

GRANT ALL ON FUNCTION "public"."http_list_curlopt" () TO "anon";

GRANT ALL ON FUNCTION "public"."http_list_curlopt" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_list_curlopt" () TO "service_role";

GRANT ALL ON FUNCTION "public"."http_patch" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_patch" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "anon";

GRANT ALL ON FUNCTION "public"."http_patch" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_patch" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_post" ("uri" character varying, "data" "jsonb") TO "postgres";

GRANT ALL ON FUNCTION "public"."http_post" ("uri" character varying, "data" "jsonb") TO "anon";

GRANT ALL ON FUNCTION "public"."http_post" ("uri" character varying, "data" "jsonb") TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_post" ("uri" character varying, "data" "jsonb") TO "service_role";

GRANT ALL ON FUNCTION "public"."http_post" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_post" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "anon";

GRANT ALL ON FUNCTION "public"."http_post" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_post" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_put" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_put" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "anon";

GRANT ALL ON FUNCTION "public"."http_put" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_put" (
  "uri" character varying,
  "content" character varying,
  "content_type" character varying
) TO "service_role";

GRANT ALL ON FUNCTION "public"."http_reset_curlopt" () TO "postgres";

GRANT ALL ON FUNCTION "public"."http_reset_curlopt" () TO "anon";

GRANT ALL ON FUNCTION "public"."http_reset_curlopt" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_reset_curlopt" () TO "service_role";

GRANT ALL ON FUNCTION "public"."http_set_curlopt" (
  "curlopt" character varying,
  "value" character varying
) TO "postgres";

GRANT ALL ON FUNCTION "public"."http_set_curlopt" (
  "curlopt" character varying,
  "value" character varying
) TO "anon";

GRANT ALL ON FUNCTION "public"."http_set_curlopt" (
  "curlopt" character varying,
  "value" character varying
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."http_set_curlopt" (
  "curlopt" character varying,
  "value" character varying
) TO "service_role";

GRANT ALL ON FUNCTION "public"."rls_auto_enable" () TO "anon";

GRANT ALL ON FUNCTION "public"."rls_auto_enable" () TO "authenticated";

GRANT ALL ON FUNCTION "public"."rls_auto_enable" () TO "service_role";

GRANT ALL ON FUNCTION "public"."text_to_bytea" ("data" "text") TO "postgres";

GRANT ALL ON FUNCTION "public"."text_to_bytea" ("data" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."text_to_bytea" ("data" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."text_to_bytea" ("data" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" "bytea") TO "postgres";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" "bytea") TO "anon";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" "bytea") TO "authenticated";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" "bytea") TO "service_role";

GRANT ALL ON FUNCTION "public"."urlencode" ("data" "jsonb") TO "postgres";

GRANT ALL ON FUNCTION "public"."urlencode" ("data" "jsonb") TO "anon";

GRANT ALL ON FUNCTION "public"."urlencode" ("data" "jsonb") TO "authenticated";

GRANT ALL ON FUNCTION "public"."urlencode" ("data" "jsonb") TO "service_role";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" character varying) TO "postgres";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" character varying) TO "anon";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" character varying) TO "authenticated";

GRANT ALL ON FUNCTION "public"."urlencode" ("string" character varying) TO "service_role";

GRANT ALL ON TABLE "public"."message_attachments" TO "anon";

GRANT ALL ON TABLE "public"."message_attachments" TO "authenticated";

GRANT ALL ON TABLE "public"."message_attachments" TO "service_role";

GRANT ALL ON TABLE "public"."messages" TO "anon";

GRANT ALL ON TABLE "public"."messages" TO "authenticated";

GRANT ALL ON TABLE "public"."messages" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";

GRANT ALL ON TABLE "public"."profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";

GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";

GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";

GRANT ALL ON TABLE "public"."subscriptions" TO "anon";

GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";

GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";

GRANT ALL ON TABLE "public"."usage_windows" TO "anon";

GRANT ALL ON TABLE "public"."usage_windows" TO "authenticated";

GRANT ALL ON TABLE "public"."usage_windows" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "service_role";

--
-- Dumped schema changes for auth and storage
--