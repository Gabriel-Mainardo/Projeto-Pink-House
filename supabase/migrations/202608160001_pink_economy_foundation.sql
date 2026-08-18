begin;

-- PinkWallet extends the existing user_wallets aggregate without touching Rositas.
alter table public.user_wallets
  add column if not exists pinkcoins_balance bigint not null default 0;

update public.user_wallets
set pink_points_balance = coalesce(pink_points_balance, 0),
    pinkcoins_balance = coalesce(pinkcoins_balance, 0)
where pink_points_balance is null or pinkcoins_balance is null;

alter table public.user_wallets
  alter column pink_points_balance set default 0,
  alter column pink_points_balance set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_wallets_pinkcoins_nonnegative'
  ) then
    alter table public.user_wallets
      add constraint user_wallets_pinkcoins_nonnegative check (pinkcoins_balance >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_wallets_pinkpoints_nonnegative'
  ) then
    alter table public.user_wallets
      add constraint user_wallets_pinkpoints_nonnegative check (pink_points_balance >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_wallets_user_id_fkey'
  ) then
    alter table public.user_wallets
      add constraint user_wallets_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end;
$$;

-- Payment metadata is written only by the payment Edge Function/service role.
alter table public.payment_transactions
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists idempotency_key text;

alter table public.payment_transactions
  drop constraint if exists payment_transactions_transaction_type_check;

alter table public.payment_transactions
  add constraint payment_transactions_transaction_type_check
  check (transaction_type in ('rositas', 'pinkcoins', 'boost', 'story', 'secure_payment'));

create unique index if not exists uq_payment_transactions_idempotency
  on public.payment_transactions (user_id, transaction_type, idempotency_key)
  where idempotency_key is not null;

create table if not exists public.economy_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.economy_settings (key, value, description)
values
  ('pinkpoints_per_pinkcoin', '{"value": 20}'::jsonb, 'PinkPoints creditados por PinkCoin consumida.'),
  ('minimum_redemption_balance', '{"value": 5000}'::jsonb, 'Saldo minimo para solicitar um resgate.')
on conflict (key) do nothing;

create table if not exists public.platform_resources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  pinkcoin_cost bigint,
  active boolean not null default false,
  fulfillment_type text not null default 'entitlement'
    check (fulfillment_type in ('entitlement', 'boost')),
  fulfillment_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_resources_cost_nonnegative
    check (pinkcoin_cost is null or pinkcoin_cost >= 0),
  constraint platform_resources_active_has_cost
    check (not active or pinkcoin_cost is not null)
);

-- These entries intentionally have no cost and stay disabled until commercial configuration.
insert into public.platform_resources (
  code, name, description, pinkcoin_cost, active, fulfillment_type, fulfillment_config
)
select
  case bp.duration_hours
    when 1 then 'MANUAL_UP_1H'
    when 24 then 'BOOST_UP_24H'
    when 72 then 'SUPER_UP_3D'
    when 168 then 'SUPER_UP_7D'
    else 'BOOST_PLAN_' || replace(bp.id::text, '-', '_')
  end,
  bp.name,
  bp.description,
  null,
  false,
  'boost',
  jsonb_build_object(
    'plan_id', bp.id,
    'daily_limit', 3,
    'cooldown_hours', 6
  )
from public.boost_plans bp
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    fulfillment_type = excluded.fulfillment_type,
    fulfillment_config = excluded.fulfillment_config,
    updated_at = now();

insert into public.platform_resources (code, name, description)
values
  ('STORY_PUBLISH', 'Publicacao de Story', 'Direito de publicar um Story pago.'),
  ('PHOTO_UPLOAD', 'Envio de foto', 'Direito adicional para envio de foto.'),
  ('VIDEO_UPLOAD', 'Envio de video', 'Direito adicional para envio de video.'),
  ('PROFILE_HIGHLIGHT', 'Destaque de perfil', 'Destaque adicional no catalogo.')
on conflict (code) do nothing;

create table if not exists public.pinkcoin_packages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  coins_amount bigint,
  price_brl numeric(12,2),
  active boolean not null default false,
  display_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pinkcoin_packages_coins_positive check (coins_amount is null or coins_amount > 0),
  constraint pinkcoin_packages_price_positive check (price_brl is null or price_brl > 0),
  constraint pinkcoin_packages_active_complete
    check (not active or (coins_amount is not null and price_brl is not null))
);

create table if not exists public.pinkcoin_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.user_wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('purchase', 'consumption', 'refund', 'adjustment', 'reward')),
  amount bigint not null check (amount <> 0),
  balance_before bigint not null check (balance_before >= 0),
  balance_after bigint not null check (balance_after >= 0),
  resource_code text references public.platform_resources(code) on update cascade,
  reference_id text,
  idempotency_key text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  payment_transaction_id uuid references public.payment_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint pinkcoin_transactions_balance_math
    check (balance_after = balance_before + amount),
  constraint pinkcoin_transactions_wallet_idempotency
    unique (wallet_id, idempotency_key)
);

create table if not exists public.pinkpoint_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.user_wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('credit', 'redemption', 'refund', 'adjustment')),
  amount bigint not null check (amount <> 0),
  balance_before bigint not null check (balance_before >= 0),
  balance_after bigint not null check (balance_after >= 0),
  source text not null,
  reference_id text,
  idempotency_key text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint pinkpoint_transactions_balance_math
    check (balance_after = balance_before + amount),
  constraint pinkpoint_transactions_wallet_idempotency
    unique (wallet_id, idempotency_key)
);

create table if not exists public.resource_fulfillments (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.user_wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.platform_resources(id),
  reference_id text,
  idempotency_key text not null,
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed', 'cancelled')),
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wallet_id, idempotency_key)
);

create table if not exists public.reward_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.reward_categories (code, name, description, display_order)
values
  ('platform', 'Recursos da plataforma', 'Subidas, Stories e destaques.', 10),
  ('gift_cards', 'Gift Cards', 'Beneficios de mobilidade, alimentacao e parceiros.', 20),
  ('beauty', 'Estetica', 'Servicos de beleza e autocuidado.', 30),
  ('premium', 'Premium', 'Experiencias e producoes profissionais.', 40)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    display_order = excluded.display_order,
    updated_at = now();

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.reward_categories(id),
  code text not null unique,
  name text not null,
  description text,
  pinkpoints_cost bigint not null check (pinkpoints_cost > 0),
  image_url text,
  stock integer check (stock is null or stock >= 0),
  active boolean not null default false,
  fulfillment_type text not null default 'manual'
    check (fulfillment_type in ('manual', 'platform_entitlement', 'digital', 'partner')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.user_wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id),
  points_spent bigint not null check (points_spent > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'processing', 'completed', 'cancelled', 'refunded')),
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  unique (wallet_id, idempotency_key)
);

create index if not exists idx_pinkcoin_transactions_user_created
  on public.pinkcoin_transactions (user_id, created_at desc);
create index if not exists idx_pinkpoint_transactions_user_created
  on public.pinkpoint_transactions (user_id, created_at desc);
create index if not exists idx_resource_fulfillments_user_created
  on public.resource_fulfillments (user_id, created_at desc);
create index if not exists idx_rewards_active_category
  on public.rewards (active, category_id);
create index if not exists idx_reward_redemptions_user_created
  on public.reward_redemptions (user_id, created_at desc);
create index if not exists idx_reward_redemptions_status_created
  on public.reward_redemptions (status, created_at);

create or replace function public.pink_economy_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'economy_settings',
    'platform_resources',
    'pinkcoin_packages',
    'resource_fulfillments',
    'reward_categories',
    'rewards',
    'reward_redemptions'
  ] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', v_table, v_table);
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.pink_economy_set_updated_at()',
      v_table,
      v_table
    );
  end loop;
end;
$$;

create or replace function public.pink_economy_ledger_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception using message = 'LEDGER_ENTRIES_ARE_IMMUTABLE', errcode = 'P0001';
end;
$$;

drop trigger if exists trg_pinkcoin_transactions_immutable on public.pinkcoin_transactions;
create trigger trg_pinkcoin_transactions_immutable
before update or delete on public.pinkcoin_transactions
for each row execute function public.pink_economy_ledger_immutable();

drop trigger if exists trg_pinkpoint_transactions_immutable on public.pinkpoint_transactions;
create trigger trg_pinkpoint_transactions_immutable
before update or delete on public.pinkpoint_transactions
for each row execute function public.pink_economy_ledger_immutable();

create or replace function public.is_pinkhouse_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where coalesce(admin_user.is_active, false)
      and (
        admin_user.id = auth.uid()
        or lower(admin_user.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.pink_economy_setting_int(
  p_key text,
  p_default bigint
)
returns bigint
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      select (setting.value ->> 'value')::bigint
      from public.economy_settings setting
      where setting.key = p_key
    ),
    p_default
  );
$$;

create or replace function public.ensure_pink_wallet(p_user_id uuid)
returns public.user_wallets
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_wallet public.user_wallets%rowtype;
begin
  if p_user_id is null then
    raise exception using message = 'AUTHENTICATION_REQUIRED', errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.acompanhantes companion
    where companion.auth_user_id = p_user_id
  ) then
    raise exception using message = 'COMPANION_PROFILE_REQUIRED', errcode = 'P0001';
  end if;

  insert into public.user_wallets (user_id, pinkcoins_balance, pink_points_balance)
  values (p_user_id, 0, 0)
  on conflict (user_id) do nothing;

  select * into strict v_wallet
  from public.user_wallets wallet
  where wallet.user_id = p_user_id;

  return v_wallet;
end;
$$;

create or replace function public.create_pink_wallet_for_companion()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.auth_user_id is not null then
    insert into public.user_wallets (user_id, pinkcoins_balance, pink_points_balance)
    values (new.auth_user_id, 0, 0)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_create_pink_wallet_for_companion on public.acompanhantes;
create trigger trg_create_pink_wallet_for_companion
after insert or update of auth_user_id on public.acompanhantes
for each row execute function public.create_pink_wallet_for_companion();

insert into public.user_wallets (user_id, pinkcoins_balance, pink_points_balance)
select distinct companion.auth_user_id, 0, 0
from public.acompanhantes companion
where companion.auth_user_id is not null
on conflict (user_id) do nothing;

create or replace function public.get_my_pinkwallet()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.user_wallets%rowtype;
begin
  v_wallet := public.ensure_pink_wallet(v_user_id);

  return jsonb_build_object(
    'wallet_id', v_wallet.id,
    'user_id', v_wallet.user_id,
    'pinkcoins_balance', v_wallet.pinkcoins_balance,
    'pinkpoints_balance', v_wallet.pink_points_balance,
    'pinkpoints_per_pinkcoin', public.pink_economy_setting_int('pinkpoints_per_pinkcoin', 20),
    'minimum_redemption_balance', public.pink_economy_setting_int('minimum_redemption_balance', 5000),
    'updated_at', v_wallet.updated_at
  );
end;
$$;

create or replace function public.credit_pinkpoints(
  p_user_id uuid,
  p_amount bigint,
  p_source text,
  p_reference_id text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb,
  p_idempotency_key text default null,
  p_type text default 'credit'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_wallet public.user_wallets%rowtype;
  v_existing public.pinkpoint_transactions%rowtype;
  v_before bigint;
  v_after bigint;
  v_key text;
begin
  if p_amount <= 0 then
    raise exception using message = 'INVALID_PINKPOINT_AMOUNT', errcode = 'P0001';
  end if;

  if p_type not in ('credit', 'refund', 'adjustment') then
    raise exception using message = 'INVALID_PINKPOINT_TRANSACTION_TYPE', errcode = 'P0001';
  end if;

  v_key := coalesce(nullif(trim(p_idempotency_key), ''), gen_random_uuid()::text);
  v_wallet := public.ensure_pink_wallet(p_user_id);

  select * into v_wallet
  from public.user_wallets wallet
  where wallet.id = v_wallet.id
  for update;

  select * into v_existing
  from public.pinkpoint_transactions transaction
  where transaction.wallet_id = v_wallet.id
    and transaction.idempotency_key = v_key;

  if found then
    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'transaction_id', v_existing.id,
      'balance', v_existing.balance_after
    );
  end if;

  v_before := v_wallet.pink_points_balance;
  v_after := v_before + p_amount;

  update public.user_wallets
  set pink_points_balance = v_after,
      updated_at = now()
  where id = v_wallet.id;

  insert into public.pinkpoint_transactions (
    wallet_id, user_id, type, amount, balance_before, balance_after,
    source, reference_id, idempotency_key, description, metadata
  ) values (
    v_wallet.id, p_user_id, p_type, p_amount, v_before, v_after,
    p_source, p_reference_id, v_key, p_description, coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_existing;

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'transaction_id', v_existing.id,
    'balance', v_after,
    'credited', p_amount
  );
end;
$$;

create or replace function public.credit_pinkcoins_from_payment(p_payment_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.payment_transactions%rowtype;
  v_wallet public.user_wallets%rowtype;
  v_existing public.pinkcoin_transactions%rowtype;
  v_coins bigint;
  v_before bigint;
  v_after bigint;
  v_key text;
begin
  select * into v_payment
  from public.payment_transactions payment
  where payment.id = p_payment_transaction_id
  for update;

  if not found then
    raise exception using message = 'PAYMENT_NOT_FOUND', errcode = 'P0001';
  end if;

  if v_payment.transaction_type <> 'pinkcoins' then
    raise exception using message = 'INVALID_PAYMENT_TYPE', errcode = 'P0001';
  end if;

  if v_payment.status not in ('CONFIRMED', 'RECEIVED') then
    raise exception using message = 'PAYMENT_NOT_CONFIRMED', errcode = 'P0001';
  end if;

  v_coins := nullif(v_payment.metadata ->> 'coins_amount', '')::bigint;
  if v_coins is null or v_coins <= 0 then
    raise exception using message = 'INVALID_PINKCOIN_PACKAGE', errcode = 'P0001';
  end if;

  v_wallet := public.ensure_pink_wallet(v_payment.user_id);
  select * into v_wallet
  from public.user_wallets wallet
  where wallet.id = v_wallet.id
  for update;

  v_key := 'pinkcoins:purchase:' || v_payment.id::text;

  select * into v_existing
  from public.pinkcoin_transactions transaction
  where transaction.wallet_id = v_wallet.id
    and transaction.idempotency_key = v_key;

  if found then
    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'transaction_id', v_existing.id,
      'balance', v_existing.balance_after
    );
  end if;

  v_before := v_wallet.pinkcoins_balance;
  v_after := v_before + v_coins;

  update public.user_wallets
  set pinkcoins_balance = v_after,
      updated_at = now()
  where id = v_wallet.id;

  insert into public.pinkcoin_transactions (
    wallet_id, user_id, type, amount, balance_before, balance_after,
    reference_id, idempotency_key, description, metadata, payment_transaction_id
  ) values (
    v_wallet.id,
    v_payment.user_id,
    'purchase',
    v_coins,
    v_before,
    v_after,
    v_payment.reference_id,
    v_key,
    coalesce(v_payment.description, 'Compra de PinkCoins'),
    v_payment.metadata,
    v_payment.id
  )
  returning * into v_existing;

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'transaction_id', v_existing.id,
    'balance', v_after,
    'credited', v_coins
  );
end;
$$;

create or replace function public.consume_pinkcoin_resource(
  p_resource_code text,
  p_reference_id text,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_companion_id uuid;
  v_wallet public.user_wallets%rowtype;
  v_resource public.platform_resources%rowtype;
  v_existing public.pinkcoin_transactions%rowtype;
  v_fulfillment_id uuid;
  v_boost_id uuid;
  v_plan_id uuid;
  v_daily_limit integer;
  v_cooldown_hours integer;
  v_recent_count integer;
  v_last_boost_at timestamptz;
  v_before bigint;
  v_after bigint;
  v_points bigint;
  v_coin_transaction_id uuid;
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
  limit 1;

  if v_companion_id is null then
    raise exception using message = 'COMPANION_PROFILE_REQUIRED', errcode = 'P0001';
  end if;

  v_wallet := public.ensure_pink_wallet(v_user_id);
  select * into v_wallet
  from public.user_wallets wallet
  where wallet.id = v_wallet.id
  for update;

  select * into v_existing
  from public.pinkcoin_transactions transaction
  where transaction.wallet_id = v_wallet.id
    and transaction.idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'transaction_id', v_existing.id,
      'pinkcoins_balance', v_existing.balance_after
    );
  end if;

  select * into v_resource
  from public.platform_resources resource
  where resource.code = p_resource_code
  for share;

  if not found then
    raise exception using message = 'RESOURCE_NOT_FOUND', errcode = 'P0001';
  end if;

  if not v_resource.active or v_resource.pinkcoin_cost is null then
    raise exception using message = 'RESOURCE_DISABLED', errcode = 'P0001';
  end if;

  if v_wallet.pinkcoins_balance < v_resource.pinkcoin_cost then
    raise exception using message = 'INSUFFICIENT_PINKCOINS', errcode = 'P0001';
  end if;

  if v_resource.fulfillment_type = 'boost' then
    v_plan_id := nullif(v_resource.fulfillment_config ->> 'plan_id', '')::uuid;
    v_daily_limit := coalesce((v_resource.fulfillment_config ->> 'daily_limit')::integer, 3);
    v_cooldown_hours := coalesce((v_resource.fulfillment_config ->> 'cooldown_hours')::integer, 6);

    if v_plan_id is null or not exists (
      select 1 from public.boost_plans plan where plan.id = v_plan_id and plan.is_active
    ) then
      raise exception using message = 'RESOURCE_CONFIGURATION_INVALID', errcode = 'P0001';
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

    v_boost_id := public.create_boost(
      v_companion_id,
      v_plan_id,
      'pinkcoins-' || p_idempotency_key,
      'approved',
      'pinkcoins'
    );
  end if;

  insert into public.resource_fulfillments (
    wallet_id, user_id, resource_id, reference_id, idempotency_key, status, result
  ) values (
    v_wallet.id,
    v_user_id,
    v_resource.id,
    p_reference_id,
    p_idempotency_key,
    'completed',
    jsonb_strip_nulls(jsonb_build_object('boost_id', v_boost_id))
  )
  returning id into v_fulfillment_id;

  v_before := v_wallet.pinkcoins_balance;
  v_after := v_before - v_resource.pinkcoin_cost;

  update public.user_wallets
  set pinkcoins_balance = v_after,
      updated_at = now()
  where id = v_wallet.id;

  insert into public.pinkcoin_transactions (
    wallet_id, user_id, type, amount, balance_before, balance_after,
    resource_code, reference_id, idempotency_key, description, metadata
  ) values (
    v_wallet.id,
    v_user_id,
    'consumption',
    -v_resource.pinkcoin_cost,
    v_before,
    v_after,
    v_resource.code,
    coalesce(p_reference_id, v_fulfillment_id::text),
    p_idempotency_key,
    v_resource.name,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('fulfillment_id', v_fulfillment_id)
  )
  returning id into v_coin_transaction_id;

  v_points := v_resource.pinkcoin_cost
    * public.pink_economy_setting_int('pinkpoints_per_pinkcoin', 20);

  if v_points > 0 then
    perform public.credit_pinkpoints(
      v_user_id,
      v_points,
      'pinkcoin_cashback',
      v_coin_transaction_id::text,
      'Cashback: ' || v_resource.name,
      jsonb_build_object(
        'resource_code', v_resource.code,
        'pinkcoins_spent', v_resource.pinkcoin_cost,
        'fulfillment_id', v_fulfillment_id
      ),
      'cashback:' || v_coin_transaction_id::text,
      'credit'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'transaction_id', v_coin_transaction_id,
    'fulfillment_id', v_fulfillment_id,
    'boost_id', v_boost_id,
    'pinkcoins_spent', v_resource.pinkcoin_cost,
    'pinkcoins_balance', v_after,
    'pinkpoints_credited', v_points
  );
end;
$$;

create or replace function public.redeem_reward(
  p_reward_id uuid,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.user_wallets%rowtype;
  v_reward public.rewards%rowtype;
  v_existing public.reward_redemptions%rowtype;
  v_redemption public.reward_redemptions%rowtype;
  v_minimum bigint;
  v_before bigint;
  v_after bigint;
begin
  if v_user_id is null then
    raise exception using message = 'AUTHENTICATION_REQUIRED', errcode = 'P0001';
  end if;

  if nullif(trim(p_idempotency_key), '') is null then
    raise exception using message = 'IDEMPOTENCY_KEY_REQUIRED', errcode = 'P0001';
  end if;

  v_wallet := public.ensure_pink_wallet(v_user_id);
  select * into v_wallet
  from public.user_wallets wallet
  where wallet.id = v_wallet.id
  for update;

  select * into v_existing
  from public.reward_redemptions redemption
  where redemption.wallet_id = v_wallet.id
    and redemption.idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'redemption_id', v_existing.id,
      'status', v_existing.status,
      'pinkpoints_balance', v_wallet.pink_points_balance
    );
  end if;

  select * into v_reward
  from public.rewards reward
  where reward.id = p_reward_id
  for update;

  if not found then
    raise exception using message = 'REWARD_NOT_FOUND', errcode = 'P0001';
  end if;

  if not v_reward.active then
    raise exception using message = 'REWARD_UNAVAILABLE', errcode = 'P0001';
  end if;

  if v_reward.stock is not null and v_reward.stock <= 0 then
    raise exception using message = 'REWARD_OUT_OF_STOCK', errcode = 'P0001';
  end if;

  v_minimum := public.pink_economy_setting_int('minimum_redemption_balance', 5000);
  if v_wallet.pink_points_balance < v_minimum then
    raise exception using message = 'MINIMUM_REDEMPTION_NOT_REACHED', errcode = 'P0001';
  end if;

  if v_wallet.pink_points_balance < v_reward.pinkpoints_cost then
    raise exception using message = 'INSUFFICIENT_PINKPOINTS', errcode = 'P0001';
  end if;

  if v_reward.stock is not null then
    update public.rewards
    set stock = stock - 1,
        updated_at = now()
    where id = v_reward.id;
  end if;

  v_before := v_wallet.pink_points_balance;
  v_after := v_before - v_reward.pinkpoints_cost;

  update public.user_wallets
  set pink_points_balance = v_after,
      updated_at = now()
  where id = v_wallet.id;

  insert into public.reward_redemptions (
    wallet_id, user_id, reward_id, points_spent, status, idempotency_key, metadata
  ) values (
    v_wallet.id,
    v_user_id,
    v_reward.id,
    v_reward.pinkpoints_cost,
    'pending',
    p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_redemption;

  insert into public.pinkpoint_transactions (
    wallet_id, user_id, type, amount, balance_before, balance_after,
    source, reference_id, idempotency_key, description, metadata
  ) values (
    v_wallet.id,
    v_user_id,
    'redemption',
    -v_reward.pinkpoints_cost,
    v_before,
    v_after,
    'reward_redemption',
    v_redemption.id::text,
    'redemption:' || v_redemption.id::text,
    'Resgate: ' || v_reward.name,
    jsonb_build_object('reward_id', v_reward.id, 'reward_code', v_reward.code)
  );

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'redemption_id', v_redemption.id,
    'status', v_redemption.status,
    'points_spent', v_reward.pinkpoints_cost,
    'pinkpoints_balance', v_after
  );
end;
$$;

create or replace function public.admin_adjust_pinkwallet(
  p_user_id uuid,
  p_currency text,
  p_amount bigint,
  p_reason text,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_wallet public.user_wallets%rowtype;
  v_before bigint;
  v_after bigint;
begin
  if not public.is_pinkhouse_admin() then
    raise exception using message = 'ADMIN_AUTHORIZATION_REQUIRED', errcode = 'P0001';
  end if;

  if p_amount = 0 or nullif(trim(p_reason), '') is null
     or nullif(trim(p_idempotency_key), '') is null then
    raise exception using message = 'INVALID_ADJUSTMENT', errcode = 'P0001';
  end if;

  v_wallet := public.ensure_pink_wallet(p_user_id);
  select * into v_wallet
  from public.user_wallets wallet
  where wallet.id = v_wallet.id
  for update;

  if p_currency = 'pinkcoins' then
    if exists (
      select 1 from public.pinkcoin_transactions transaction
      where transaction.wallet_id = v_wallet.id
        and transaction.idempotency_key = p_idempotency_key
    ) then
      return jsonb_build_object('success', true, 'idempotent', true);
    end if;

    v_before := v_wallet.pinkcoins_balance;
    v_after := v_before + p_amount;
    if v_after < 0 then
      raise exception using message = 'INSUFFICIENT_PINKCOINS', errcode = 'P0001';
    end if;

    update public.user_wallets set pinkcoins_balance = v_after, updated_at = now()
    where id = v_wallet.id;

    insert into public.pinkcoin_transactions (
      wallet_id, user_id, type, amount, balance_before, balance_after,
      reference_id, idempotency_key, description, metadata
    ) values (
      v_wallet.id, p_user_id, 'adjustment', p_amount, v_before, v_after,
      auth.uid()::text, p_idempotency_key, p_reason, coalesce(p_metadata, '{}'::jsonb)
    );
  elsif p_currency = 'pinkpoints' then
    if p_amount > 0 then
      return public.credit_pinkpoints(
        p_user_id, p_amount, 'admin_adjustment', auth.uid()::text,
        p_reason, p_metadata, p_idempotency_key, 'adjustment'
      );
    end if;

    if exists (
      select 1 from public.pinkpoint_transactions transaction
      where transaction.wallet_id = v_wallet.id
        and transaction.idempotency_key = p_idempotency_key
    ) then
      return jsonb_build_object('success', true, 'idempotent', true);
    end if;

    v_before := v_wallet.pink_points_balance;
    v_after := v_before + p_amount;
    if v_after < 0 then
      raise exception using message = 'INSUFFICIENT_PINKPOINTS', errcode = 'P0001';
    end if;

    update public.user_wallets set pink_points_balance = v_after, updated_at = now()
    where id = v_wallet.id;

    insert into public.pinkpoint_transactions (
      wallet_id, user_id, type, amount, balance_before, balance_after,
      source, reference_id, idempotency_key, description, metadata
    ) values (
      v_wallet.id, p_user_id, 'adjustment', p_amount, v_before, v_after,
      'admin_adjustment', auth.uid()::text, p_idempotency_key, p_reason,
      coalesce(p_metadata, '{}'::jsonb)
    );
  else
    raise exception using message = 'INVALID_CURRENCY', errcode = 'P0001';
  end if;

  return jsonb_build_object('success', true, 'idempotent', false, 'balance', v_after);
end;
$$;

create or replace function public.admin_set_reward_redemption_status(
  p_redemption_id uuid,
  p_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_redemption public.reward_redemptions%rowtype;
  v_wallet public.user_wallets%rowtype;
  v_before bigint;
  v_after bigint;
begin
  if not public.is_pinkhouse_admin() then
    raise exception using message = 'ADMIN_AUTHORIZATION_REQUIRED', errcode = 'P0001';
  end if;

  if p_status not in ('approved', 'processing', 'completed', 'cancelled', 'refunded') then
    raise exception using message = 'INVALID_REDEMPTION_STATUS', errcode = 'P0001';
  end if;

  select * into v_redemption
  from public.reward_redemptions redemption
  where redemption.id = p_redemption_id
  for update;

  if not found then
    raise exception using message = 'REDEMPTION_NOT_FOUND', errcode = 'P0001';
  end if;

  if v_redemption.status in ('cancelled', 'refunded') then
    return jsonb_build_object('success', true, 'idempotent', true, 'status', v_redemption.status);
  end if;

  if p_status in ('cancelled', 'refunded') then
    select * into v_wallet
    from public.user_wallets wallet
    where wallet.id = v_redemption.wallet_id
    for update;

    if not exists (
      select 1 from public.pinkpoint_transactions transaction
      where transaction.wallet_id = v_wallet.id
        and transaction.idempotency_key = 'reward-refund:' || v_redemption.id::text
    ) then
      v_before := v_wallet.pink_points_balance;
      v_after := v_before + v_redemption.points_spent;

      update public.user_wallets
      set pink_points_balance = v_after, updated_at = now()
      where id = v_wallet.id;

      insert into public.pinkpoint_transactions (
        wallet_id, user_id, type, amount, balance_before, balance_after,
        source, reference_id, idempotency_key, description, metadata
      ) values (
        v_wallet.id, v_redemption.user_id, 'refund', v_redemption.points_spent,
        v_before, v_after, 'reward_refund', v_redemption.id::text,
        'reward-refund:' || v_redemption.id::text,
        'Estorno de resgate',
        jsonb_build_object('admin_id', auth.uid()) || coalesce(p_metadata, '{}'::jsonb)
      );

      update public.rewards
      set stock = case when stock is null then null else stock + 1 end,
          updated_at = now()
      where id = v_redemption.reward_id;
    end if;
  end if;

  update public.reward_redemptions
  set status = p_status,
      metadata = metadata || coalesce(p_metadata, '{}'::jsonb),
      fulfilled_at = case when p_status = 'completed' then now() else fulfilled_at end,
      updated_at = now()
  where id = v_redemption.id;

  return jsonb_build_object('success', true, 'idempotent', false, 'status', p_status);
end;
$$;

create or replace function public.get_my_pinkwallet_activity(
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  currency text,
  transaction_type text,
  amount bigint,
  description text,
  balance_after bigint,
  source text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select activity.id,
         activity.currency,
         activity.transaction_type,
         activity.amount,
         activity.description,
         activity.balance_after,
         activity.source,
         activity.created_at
  from (
    select transaction.id,
           'pinkcoins'::text currency,
           transaction.type transaction_type,
           transaction.amount,
           transaction.description,
           transaction.balance_after,
           coalesce(transaction.resource_code, transaction.type) source,
           transaction.created_at
    from public.pinkcoin_transactions transaction
    where transaction.user_id = auth.uid()

    union all

    select transaction.id,
           'pinkpoints'::text currency,
           transaction.type transaction_type,
           transaction.amount,
           transaction.description,
           transaction.balance_after,
           transaction.source,
           transaction.created_at
    from public.pinkpoint_transactions transaction
    where transaction.user_id = auth.uid()
  ) activity
  order by activity.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

-- RLS: balances and ledgers are visible only to their owner; mutations happen through RPCs.
alter table public.economy_settings enable row level security;
alter table public.platform_resources enable row level security;
alter table public.pinkcoin_packages enable row level security;
alter table public.pinkcoin_transactions enable row level security;
alter table public.pinkpoint_transactions enable row level security;
alter table public.resource_fulfillments enable row level security;
alter table public.reward_categories enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

drop policy if exists economy_settings_public_read on public.economy_settings;
create policy economy_settings_public_read on public.economy_settings
for select using (true);

drop policy if exists economy_settings_admin_all on public.economy_settings;
create policy economy_settings_admin_all on public.economy_settings
for all using (public.is_pinkhouse_admin()) with check (public.is_pinkhouse_admin());

drop policy if exists platform_resources_public_read on public.platform_resources;
create policy platform_resources_public_read on public.platform_resources
for select using (active or public.is_pinkhouse_admin());

drop policy if exists platform_resources_admin_all on public.platform_resources;
create policy platform_resources_admin_all on public.platform_resources
for all using (public.is_pinkhouse_admin()) with check (public.is_pinkhouse_admin());

drop policy if exists pinkcoin_packages_public_read on public.pinkcoin_packages;
create policy pinkcoin_packages_public_read on public.pinkcoin_packages
for select using (active or public.is_pinkhouse_admin());

drop policy if exists pinkcoin_packages_admin_all on public.pinkcoin_packages;
create policy pinkcoin_packages_admin_all on public.pinkcoin_packages
for all using (public.is_pinkhouse_admin()) with check (public.is_pinkhouse_admin());

drop policy if exists pinkcoin_transactions_owner_read on public.pinkcoin_transactions;
create policy pinkcoin_transactions_owner_read on public.pinkcoin_transactions
for select using (user_id = auth.uid() or public.is_pinkhouse_admin());

drop policy if exists pinkpoint_transactions_owner_read on public.pinkpoint_transactions;
create policy pinkpoint_transactions_owner_read on public.pinkpoint_transactions
for select using (user_id = auth.uid() or public.is_pinkhouse_admin());

drop policy if exists resource_fulfillments_owner_read on public.resource_fulfillments;
create policy resource_fulfillments_owner_read on public.resource_fulfillments
for select using (user_id = auth.uid() or public.is_pinkhouse_admin());

drop policy if exists reward_categories_public_read on public.reward_categories;
create policy reward_categories_public_read on public.reward_categories
for select using (active or public.is_pinkhouse_admin());

drop policy if exists reward_categories_admin_all on public.reward_categories;
create policy reward_categories_admin_all on public.reward_categories
for all using (public.is_pinkhouse_admin()) with check (public.is_pinkhouse_admin());

drop policy if exists rewards_public_read on public.rewards;
create policy rewards_public_read on public.rewards
for select using (active or public.is_pinkhouse_admin());

drop policy if exists rewards_admin_all on public.rewards;
create policy rewards_admin_all on public.rewards
for all using (public.is_pinkhouse_admin()) with check (public.is_pinkhouse_admin());

drop policy if exists reward_redemptions_owner_read on public.reward_redemptions;
create policy reward_redemptions_owner_read on public.reward_redemptions
for select using (user_id = auth.uid() or public.is_pinkhouse_admin());

-- Existing wallet policy remains valid; make admin reads explicit without adding writes.
drop policy if exists pinkwallet_admin_read on public.user_wallets;
create policy pinkwallet_admin_read on public.user_wallets
for select using (public.is_pinkhouse_admin());

revoke all on public.pinkcoin_transactions from anon, authenticated;
revoke all on public.pinkpoint_transactions from anon, authenticated;
revoke all on public.resource_fulfillments from anon, authenticated;
revoke insert, update, delete on public.user_wallets from anon, authenticated;
revoke insert, update, delete on public.reward_redemptions from anon, authenticated;

grant select on public.economy_settings to anon, authenticated;
grant select on public.platform_resources to anon, authenticated;
grant select on public.pinkcoin_packages to anon, authenticated;
grant select on public.reward_categories to anon, authenticated;
grant select on public.rewards to anon, authenticated;
grant select on public.user_wallets to authenticated;
grant select on public.pinkcoin_transactions to authenticated;
grant select on public.pinkpoint_transactions to authenticated;
grant select on public.resource_fulfillments to authenticated;
grant select on public.reward_redemptions to authenticated;

revoke all on function public.ensure_pink_wallet(uuid) from public, anon, authenticated;
revoke all on function public.pink_economy_setting_int(text, bigint) from public, anon, authenticated;
revoke all on function public.credit_pinkpoints(uuid, bigint, text, text, text, jsonb, text, text) from public, anon, authenticated;
revoke all on function public.credit_pinkcoins_from_payment(uuid) from public, anon, authenticated;

grant execute on function public.credit_pinkpoints(uuid, bigint, text, text, text, jsonb, text, text) to service_role;
grant execute on function public.credit_pinkcoins_from_payment(uuid) to service_role;
grant execute on function public.get_my_pinkwallet() to authenticated;
grant execute on function public.get_my_pinkwallet_activity(integer, integer) to authenticated;
grant execute on function public.consume_pinkcoin_resource(text, text, text, jsonb) to authenticated;
grant execute on function public.redeem_reward(uuid, text, jsonb) to authenticated;
grant execute on function public.is_pinkhouse_admin() to authenticated;
grant execute on function public.admin_adjust_pinkwallet(uuid, text, bigint, text, text, jsonb) to authenticated;
grant execute on function public.admin_set_reward_redemption_status(uuid, text, jsonb) to authenticated;

comment on table public.user_wallets is 'PinkWallet aggregate. Rositas, PinkCoins and PinkPoints remain separate balances.';
comment on table public.pinkcoin_transactions is 'Immutable PinkCoin ledger.';
comment on table public.pinkpoint_transactions is 'Immutable PinkPoint ledger independent from PinkCoins.';
comment on table public.platform_resources is 'Administrative PinkCoin pricing and fulfillment catalog.';
comment on table public.rewards is 'PinkPoint reward catalog.';
comment on function public.consume_pinkcoin_resource is 'Atomically charges PinkCoins, fulfills a resource and credits cashback.';
comment on function public.redeem_reward is 'Atomically validates and creates a PinkPoint reward redemption.';

commit;
