begin;

create unique index if not exists uq_active_boosts_companion_payment
  on public.active_boosts (companion_id, payment_id)
  where payment_id is not null;

create or replace function public.create_free_boost(
  p_plan_id uuid,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_companion_id uuid;
  v_existing_id uuid;
  v_resource public.platform_resources%rowtype;
  v_daily_limit integer := 3;
  v_cooldown_hours integer := 6;
  v_recent_count integer;
  v_last_boost_at timestamptz;
begin
  if v_user_id is null then
    raise exception using message = 'AUTHENTICATION_REQUIRED', errcode = 'P0001';
  end if;

  if nullif(trim(p_idempotency_key), '') is null then
    raise exception using message = 'IDEMPOTENCY_KEY_REQUIRED', errcode = 'P0001';
  end if;

  select companion.id into v_companion_id
  from public.acompanhantes companion
  where companion.auth_user_id = v_user_id
  order by companion.updated_at desc nulls last, companion.created_at desc
  limit 1
  for update;

  if v_companion_id is null then
    raise exception using message = 'COMPANION_PROFILE_REQUIRED', errcode = 'P0001';
  end if;

  select boost.id into v_existing_id
  from public.active_boosts boost
  where boost.companion_id = v_companion_id
    and boost.payment_id = 'free:' || p_idempotency_key;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  if not exists (
    select 1 from public.boost_plans plan
    where plan.id = p_plan_id and plan.is_active
  ) then
    raise exception using message = 'RESOURCE_CONFIGURATION_INVALID', errcode = 'P0001';
  end if;

  select * into v_resource
  from public.platform_resources resource
  where resource.fulfillment_type = 'boost'
    and resource.fulfillment_config ->> 'plan_id' = p_plan_id::text
  limit 1;

  if found then
    if v_resource.active then
      raise exception using message = 'RESOURCE_REQUIRES_PINKCOINS', errcode = 'P0001';
    end if;
    v_daily_limit := coalesce((v_resource.fulfillment_config ->> 'daily_limit')::integer, v_daily_limit);
    v_cooldown_hours := coalesce((v_resource.fulfillment_config ->> 'cooldown_hours')::integer, v_cooldown_hours);
  end if;

  select count(*), max(boost.started_at)
  into v_recent_count, v_last_boost_at
  from public.active_boosts boost
  where boost.companion_id = v_companion_id
    and boost.started_at >= now() - interval '24 hours'
    and boost.payment_status = 'approved';

  if v_recent_count >= v_daily_limit then
    raise exception using message = 'RESOURCE_DAILY_LIMIT_REACHED', errcode = 'P0001';
  end if;

  if v_last_boost_at is not null
     and v_last_boost_at + make_interval(hours => v_cooldown_hours) > now() then
    raise exception using message = 'RESOURCE_COOLDOWN_ACTIVE', errcode = 'P0001';
  end if;

  return public.create_boost(
    v_companion_id,
    p_plan_id,
    'free:' || p_idempotency_key,
    'approved',
    'free_mvp'
  );
end;
$$;

revoke execute on function public.create_boost(uuid, uuid, varchar, varchar, varchar)
  from public, anon, authenticated;
grant execute on function public.create_boost(uuid, uuid, varchar, varchar, varchar)
  to service_role;

revoke all on function public.create_free_boost(uuid, text) from public, anon;
grant execute on function public.create_free_boost(uuid, text) to authenticated;

comment on function public.create_free_boost(uuid, text) is
  'Owner-only compatibility flow. Refuses free activation when the plan is monetized with PinkCoins.';

commit;
