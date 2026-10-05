begin;

-- The owner must be able to read their own profile even while offline.
drop policy if exists "Profissional vê próprio perfil" on public.acompanhantes;
create policy "Profissional vê próprio perfil" on public.acompanhantes
for select to authenticated using (auth.uid() = auth_user_id);

-- Password login is available immediately; this Auth flag is NOT trust proof.
-- Existing professional registrations can resume with their original password.
update auth.users u
set email_confirmed_at = now(), updated_at = now()
where u.email_confirmed_at is null and u.email is not null
  and (u.raw_user_meta_data->>'user_type' = 'companion'
    or exists (select 1 from public.acompanhantes a where a.auth_user_id = u.id));

-- Keep the stored percentage consistent with the six 20-point UI tasks.
create or replace function public.calculate_reliability_score()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare v_tasks integer := 0;
begin
  if new.email_verified then v_tasks := v_tasks + 1; end if;
  if new.profile_completed then v_tasks := v_tasks + 1; end if;
  if new.document_verified or new.document_status = 'pending' then v_tasks := v_tasks + 1; end if;
  if new.photo_verified or new.photo_status = 'pending' then v_tasks := v_tasks + 1; end if;
  if new.video_verified or new.video_status = 'pending' then v_tasks := v_tasks + 1; end if;
  if new.media_comparison_verified or new.media_comparison_status = 'pending' then v_tasks := v_tasks + 1; end if;
  new.reliability_score := least(round(v_tasks * 100.0 / 6), 100)::integer;
  new.updated_at := now();
  return new;
end $$;

create or replace function public.guard_companion_email_verification()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  v_claims jsonb := auth.jwt();
begin
  if v_claims->>'role' = 'service_role' or
    (coalesce(v_claims, '{}'::jsonb) = '{}'::jsonb and current_user in ('postgres', 'supabase_admin'))
    then return new; end if;
  if not coalesce(new.email_verified, false) then return new; end if;
  if tg_op = 'UPDATE' then
    if old.email_verified and new.email_verified_at is not distinct from old.email_verified_at
      and new.companion_id = old.companion_id then return new; end if;
  end if;
  if not exists (
    select 1 from public.acompanhantes a
    where a.id = new.companion_id and a.auth_user_id = auth.uid()
      and lower(a.email) = lower(v_claims->>'email')
  ) then raise exception 'Verificação não autorizada para este perfil.' using errcode = '42501'; end if;
  if not exists (
    select 1 from jsonb_array_elements(coalesce(v_claims->'amr', '[]'::jsonb)) m
    where m->>'method' = 'otp'
      and (m->>'timestamp')::bigint between extract(epoch from now())::bigint - 600
        and extract(epoch from now())::bigint + 60
  ) then raise exception 'Abra um novo link enviado pela tarefa Confirmar e-mail para concluir a verificação.' using errcode = '42501'; end if;
  new.email_verified_at := now();
  return new;
end $$;

drop trigger if exists guard_companion_email_verification on public.companion_verifications;
create trigger guard_companion_email_verification
before insert or update on public.companion_verifications
for each row execute function public.guard_companion_email_verification();

create or replace function public.confirm_companion_email(p_companion_id uuid)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.acompanhantes where id = p_companion_id and auth_user_id = auth.uid()
  ) then raise exception 'Verificação não autorizada para este perfil.' using errcode = '42501'; end if;
  update public.companion_verifications set email_verified = true,
    email_verified_at = now(), updated_at = now() where companion_id = p_companion_id;
  if not found then raise exception 'Registro de verificação não encontrado.'; end if;
end $$;
revoke all on function public.confirm_companion_email(uuid) from public, anon;
grant execute on function public.confirm_companion_email(uuid) to authenticated;

commit;
