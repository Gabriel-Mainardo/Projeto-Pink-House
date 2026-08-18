begin;

create unique index if not exists uq_rositas_transactions_payment
  on public.rositas_transactions (payment_transaction_id)
  where payment_transaction_id is not null;

create or replace function public.credit_rositas(
  p_user_id uuid,
  p_rositas integer,
  p_pink_points integer default 0,
  p_description text default 'Compra de Rositas',
  p_payment_transaction_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_wallet public.user_wallets%rowtype;
  v_rositas_transaction_id uuid;
  v_existing public.rositas_transactions%rowtype;
  v_new_balance integer;
begin
  if p_rositas <= 0 or p_pink_points < 0 then
    raise exception using message = 'INVALID_ROSITAS_CREDIT', errcode = 'P0001';
  end if;

  if p_payment_transaction_id is not null then
    select * into v_existing
    from public.rositas_transactions transaction
    where transaction.payment_transaction_id = p_payment_transaction_id;

    if found then
      return jsonb_build_object(
        'success', true,
        'idempotent', true,
        'new_balance', v_existing.balance_after,
        'credited', v_existing.amount
      );
    end if;
  end if;

  v_wallet := public.ensure_pink_wallet(p_user_id);
  select * into v_wallet
  from public.user_wallets wallet
  where wallet.id = v_wallet.id
  for update;

  v_new_balance := coalesce(v_wallet.rositas_balance, 0) + p_rositas;
  update public.user_wallets
  set rositas_balance = v_new_balance,
      updated_at = now()
  where id = v_wallet.id;

  insert into public.rositas_transactions (
    user_id, amount, pink_points, balance_after, description, payment_transaction_id
  ) values (
    p_user_id, p_rositas, p_pink_points, v_new_balance, p_description, p_payment_transaction_id
  )
  returning id into v_rositas_transaction_id;

  if p_pink_points > 0 then
    perform public.credit_pinkpoints(
      p_user_id,
      p_pink_points,
      'rositas_purchase_reward',
      coalesce(p_payment_transaction_id::text, v_rositas_transaction_id::text),
      'PinkPoints da compra de Rositas',
      jsonb_build_object('rositas_transaction_id', v_rositas_transaction_id),
      'rositas-points:' || coalesce(p_payment_transaction_id::text, v_rositas_transaction_id::text),
      'credit'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'new_balance', v_new_balance,
    'credited', p_rositas,
    'pinkpoints_credited', p_pink_points
  );
end;
$$;

revoke all on function public.credit_rositas(uuid, integer, integer, text, uuid)
  from public, anon, authenticated;
grant execute on function public.credit_rositas(uuid, integer, integer, text, uuid)
  to service_role;

comment on function public.credit_rositas(uuid, integer, integer, text, uuid) is
  'Credits Rositas independently and delegates any legacy PinkPoint reward to the auditable PinkPoints service.';

commit;
