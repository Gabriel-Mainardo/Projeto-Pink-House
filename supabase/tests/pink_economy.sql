begin;

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void language plpgsql as $$
begin
  if not coalesce(condition, false) then
    raise exception 'ASSERTION_FAILED: %', message;
  end if;
end;
$$;

do $$
declare
  v_user_id uuid;
  v_wallet_id uuid;
  v_payment_id uuid;
  v_rositas_payment_id uuid;
  v_reward_id uuid;
  v_plan_id uuid;
  v_free_boost_id uuid;
  v_duplicate_boost_id uuid;
  v_result jsonb;
  v_count bigint;
begin
  select auth_user_id into v_user_id
  from public.acompanhantes
  where auth_user_id is not null
    and not exists (
      select 1 from public.active_boosts boost
      where boost.companion_id = acompanhantes.id
        and boost.started_at >= now() - interval '24 hours'
        and boost.payment_status = 'approved'
    )
  order by created_at
  limit 1;

  perform pg_temp.assert_true(v_user_id is not null, 'an authenticated companion is required');
  perform set_config('request.jwt.claim.sub', v_user_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_user_id, 'role', 'authenticated')::text, true);

  select id into v_wallet_id from public.user_wallets where user_id = v_user_id for update;
  update public.user_wallets
  set pinkcoins_balance = 0, pink_points_balance = 0, rositas_balance = 0
  where id = v_wallet_id;

  -- Existing Rositas rewards remain independent but now use the PinkPoints ledger.
  insert into public.payment_transactions (
    user_id, asaas_payment_id, transaction_type, reference_id, amount,
    billing_type, status, metadata, idempotency_key, confirmed_at
  ) values (
    v_user_id, 'test-rositas-confirmed', 'rositas', 'TEST_ROSITAS', 1,
    'PIX', 'CONFIRMED', '{}'::jsonb, 'test-rositas-payment', now()
  ) returning id into v_rositas_payment_id;

  perform public.credit_rositas(v_user_id, 10, 25, 'Test Rositas purchase', v_rositas_payment_id);
  perform public.credit_rositas(v_user_id, 10, 25, 'Test Rositas purchase', v_rositas_payment_id);
  perform pg_temp.assert_true((select rositas_balance from public.user_wallets where id = v_wallet_id) = 10, 'Rositas payment duplicated');
  perform pg_temp.assert_true((select pink_points_balance from public.user_wallets where id = v_wallet_id) = 25, 'Rositas PinkPoints were not credited');
  perform pg_temp.assert_true((select count(*) from public.rositas_transactions where payment_transaction_id = v_rositas_payment_id) = 1, 'Rositas ledger duplicated');
  perform pg_temp.assert_true((select count(*) from public.pinkpoint_transactions where source = 'rositas_purchase_reward' and reference_id = v_rositas_payment_id::text) = 1, 'Rositas PinkPoints ledger is missing or duplicated');

  update public.user_wallets set rositas_balance = 0, pink_points_balance = 0 where id = v_wallet_id;

  -- A pending payment must not credit PinkCoins.
  insert into public.payment_transactions (
    user_id, asaas_payment_id, transaction_type, reference_id, amount,
    billing_type, status, metadata, idempotency_key
  ) values (
    v_user_id, 'test-pinkcoins-pending', 'pinkcoins', 'TEST_PACKAGE', 9.90,
    'PIX', 'PENDING', '{"coins_amount": 50}'::jsonb, 'test-payment-pending'
  ) returning id into v_payment_id;

  begin
    perform public.credit_pinkcoins_from_payment(v_payment_id);
    raise exception 'EXPECTED_PAYMENT_NOT_CONFIRMED';
  exception when others then
    if sqlerrm not like '%PAYMENT_NOT_CONFIRMED%' then raise; end if;
  end;
  perform pg_temp.assert_true((select pinkcoins_balance from public.user_wallets where id = v_wallet_id) = 0, 'pending payment changed balance');

  -- Confirmation credits once and never creates PinkPoints.
  update public.payment_transactions set status = 'CONFIRMED', confirmed_at = now() where id = v_payment_id;
  perform public.credit_pinkcoins_from_payment(v_payment_id);
  perform public.credit_pinkcoins_from_payment(v_payment_id);
  perform pg_temp.assert_true((select pinkcoins_balance from public.user_wallets where id = v_wallet_id) = 50, 'confirmed payment did not credit exactly once');
  perform pg_temp.assert_true((select pink_points_balance from public.user_wallets where id = v_wallet_id) = 0, 'PinkCoin purchase generated PinkPoints');
  select count(*) into v_count from public.pinkcoin_transactions where payment_transaction_id = v_payment_id;
  perform pg_temp.assert_true(v_count = 1, 'duplicate payment created duplicate ledger rows');

  -- Consumption charges the server-side price and credits 20 points per coin.
  insert into public.platform_resources (
    code, name, pinkcoin_cost, active, fulfillment_type
  ) values ('TEST_PAID_RESOURCE', 'Test paid resource', 20, true, 'entitlement');

  v_result := public.consume_pinkcoin_resource('TEST_PAID_RESOURCE', 'test-consumption', 'test-consumption-key', '{}'::jsonb);
  perform pg_temp.assert_true((v_result ->> 'pinkcoins_spent')::bigint = 20, 'wrong consumption amount');
  perform pg_temp.assert_true((select pinkcoins_balance from public.user_wallets where id = v_wallet_id) = 30, 'consumption balance is wrong');
  perform pg_temp.assert_true((select pink_points_balance from public.user_wallets where id = v_wallet_id) = 400, 'cashback conversion is wrong');

  v_result := public.consume_pinkcoin_resource('TEST_PAID_RESOURCE', 'test-consumption', 'test-consumption-key', '{}'::jsonb);
  perform pg_temp.assert_true((v_result ->> 'idempotent')::boolean, 'duplicate consumption was not idempotent');
  perform pg_temp.assert_true((select pinkcoins_balance from public.user_wallets where id = v_wallet_id) = 30, 'duplicate consumption charged again');
  perform pg_temp.assert_true((select pink_points_balance from public.user_wallets where id = v_wallet_id) = 400, 'duplicate consumption duplicated cashback');
  select count(*) into v_count from public.pinkpoint_transactions where source = 'pinkcoin_cashback' and user_id = v_user_id;
  perform pg_temp.assert_true(v_count = 1, 'cashback ledger row is missing or duplicated');

  update public.platform_resources set pinkcoin_cost = 31 where code = 'TEST_PAID_RESOURCE';
  begin
    perform public.consume_pinkcoin_resource('TEST_PAID_RESOURCE', 'test-insufficient', 'test-insufficient-key', '{}'::jsonb);
    raise exception 'EXPECTED_INSUFFICIENT_PINKCOINS';
  exception when others then
    if sqlerrm not like '%INSUFFICIENT_PINKCOINS%' then raise; end if;
  end;
  perform pg_temp.assert_true((select pinkcoins_balance from public.user_wallets where id = v_wallet_id) = 30, 'insufficient consumption changed balance');

  -- The compatibility free flow is owner-only, idempotent and closes as soon
  -- as the corresponding plan is monetized.
  select plan.id into v_plan_id
  from public.boost_plans plan
  join public.platform_resources resource
    on resource.fulfillment_config ->> 'plan_id' = plan.id::text
  where plan.is_active
  order by plan.duration_hours
  limit 1;
  perform pg_temp.assert_true(v_plan_id is not null, 'a boost resource is required');

  update public.platform_resources
  set active = false
  where fulfillment_config ->> 'plan_id' = v_plan_id::text;

  v_free_boost_id := public.create_free_boost(v_plan_id, 'test-free-boost-key');
  v_duplicate_boost_id := public.create_free_boost(v_plan_id, 'test-free-boost-key');
  perform pg_temp.assert_true(v_free_boost_id = v_duplicate_boost_id, 'free boost duplicate was not idempotent');

  update public.platform_resources
  set pinkcoin_cost = 1, active = true
  where fulfillment_config ->> 'plan_id' = v_plan_id::text;
  begin
    perform public.create_free_boost(v_plan_id, 'test-paid-plan-free-key');
    raise exception 'EXPECTED_RESOURCE_REQUIRES_PINKCOINS';
  exception when others then
    if sqlerrm not like '%RESOURCE_REQUIRES_PINKCOINS%' then raise; end if;
  end;

  -- Reward validation: minimum, active state, stock, debit and duplicate click.
  select id into v_reward_id from public.reward_categories where code = 'gift_cards';
  insert into public.rewards (category_id, code, name, pinkpoints_cost, stock, active)
  values (v_reward_id, 'TEST_REWARD', 'Test reward', 5000, 1, true)
  returning id into v_reward_id;

  update public.user_wallets set pink_points_balance = 4999 where id = v_wallet_id;
  begin
    perform public.redeem_reward(v_reward_id, 'test-minimum-key', '{}'::jsonb);
    raise exception 'EXPECTED_MINIMUM_REDEMPTION_NOT_REACHED';
  exception when others then
    if sqlerrm not like '%MINIMUM_REDEMPTION_NOT_REACHED%' then raise; end if;
  end;

  update public.user_wallets set pink_points_balance = 6000 where id = v_wallet_id;
  update public.rewards set stock = 0 where id = v_reward_id;
  begin
    perform public.redeem_reward(v_reward_id, 'test-stock-key', '{}'::jsonb);
    raise exception 'EXPECTED_REWARD_OUT_OF_STOCK';
  exception when others then
    if sqlerrm not like '%REWARD_OUT_OF_STOCK%' then raise; end if;
  end;

  update public.rewards set stock = 1 where id = v_reward_id;
  v_result := public.redeem_reward(v_reward_id, 'test-redeem-key', '{}'::jsonb);
  perform pg_temp.assert_true((select pink_points_balance from public.user_wallets where id = v_wallet_id) = 1000, 'redemption did not debit points');
  perform pg_temp.assert_true((select stock from public.rewards where id = v_reward_id) = 0, 'redemption did not decrement stock');
  perform pg_temp.assert_true((select count(*) from public.reward_redemptions where reward_id = v_reward_id) = 1, 'redemption history is missing');

  v_result := public.redeem_reward(v_reward_id, 'test-redeem-key', '{}'::jsonb);
  perform pg_temp.assert_true((v_result ->> 'idempotent')::boolean, 'duplicate redemption was not idempotent');
  perform pg_temp.assert_true((select pink_points_balance from public.user_wallets where id = v_wallet_id) = 1000, 'duplicate redemption debited again');

  update public.user_wallets set pink_points_balance = 6000 where id = v_wallet_id;
  update public.rewards set active = false, stock = 1 where id = v_reward_id;
  begin
    perform public.redeem_reward(v_reward_id, 'test-inactive-key', '{}'::jsonb);
    raise exception 'EXPECTED_REWARD_UNAVAILABLE';
  exception when others then
    if sqlerrm not like '%REWARD_UNAVAILABLE%' then raise; end if;
  end;

  -- Database constraints remain the final guard against negative balances.
  begin
    update public.user_wallets set pinkcoins_balance = -1 where id = v_wallet_id;
    raise exception 'EXPECTED_NONNEGATIVE_CONSTRAINT';
  exception when check_violation then
    null;
  end;
end;
$$;

-- Exercise RLS using the same database role used by the browser client.
create temp table pink_economy_test_context as
select
  (select auth_user_id from public.acompanhantes where auth_user_id is not null order by created_at limit 1) as owner_id,
  (select auth_user_id from public.acompanhantes where auth_user_id is not null order by created_at offset 1 limit 1) as other_id,
  (select id from public.platform_resources order by created_at limit 1) as resource_id;
grant select on pink_economy_test_context to authenticated;

select set_config('request.jwt.claim.sub', owner_id::text, true) from pink_economy_test_context;
select set_config('request.jwt.claims', jsonb_build_object('sub', owner_id, 'role', 'authenticated')::text, true)
from pink_economy_test_context;
set local role authenticated;

do $$
declare
  v_owner uuid;
  v_other uuid;
  v_resource uuid;
  v_count bigint;
  v_rows bigint;
begin
  select owner_id, other_id, resource_id into v_owner, v_other, v_resource from pink_economy_test_context;
  select count(*) into v_count from public.user_wallets where user_id = v_owner;
  perform pg_temp.assert_true(v_count = 1, 'owner cannot read own wallet through RLS');
  select count(*) into v_count from public.user_wallets where user_id = v_other;
  perform pg_temp.assert_true(v_count = 0, 'user can read another wallet');
  select count(*) into v_count from public.pinkcoin_transactions where user_id <> v_owner;
  perform pg_temp.assert_true(v_count = 0, 'user can read another PinkCoin ledger');
  select count(*) into v_count from public.pinkpoint_transactions where user_id <> v_owner;
  perform pg_temp.assert_true(v_count = 0, 'user can read another PinkPoint ledger');
  select count(*) into v_count from public.reward_redemptions where user_id <> v_owner;
  perform pg_temp.assert_true(v_count = 0, 'user can read another redemption');

  update public.platform_resources set name = name where id = v_resource;
  get diagnostics v_rows = row_count;
  perform pg_temp.assert_true(v_rows = 0, 'non-admin can update resource pricing');
end;
$$;

reset role;
rollback;
