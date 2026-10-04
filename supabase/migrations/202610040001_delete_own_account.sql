-- Called only by the delete-account Edge Function after validating the user's JWT.
-- Storage files are removed through the Storage API before delete_account_data runs.

CREATE OR REPLACE FUNCTION public.list_account_storage_objects(p_user_id uuid)
RETURNS TABLE(bucket_id text, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT objects.bucket_id, objects.name
  FROM storage.objects AS objects
  WHERE objects.owner_id = p_user_id::text OR objects.owner = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.list_account_storage_objects(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_account_storage_objects(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.delete_account_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  account_email text;
BEGIN
  SELECT email INTO account_email
  FROM auth.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta não encontrada';
  END IF;

  -- Conversations cascade to their messages and security steps.
  DELETE FROM public.conversations
  WHERE client_id = p_user_id
     OR companion_id IN (
       SELECT id FROM public.acompanhantes WHERE auth_user_id = p_user_id
     );
  DELETE FROM public.messages WHERE sender_id = p_user_id;
  DELETE FROM public.conversation_security_steps WHERE activated_by = p_user_id;

  -- These legacy tables have no user foreign key. Payment children must go first.
  DELETE FROM public.story_purchases
  WHERE user_id = p_user_id
     OR payment_id IN (
       SELECT id FROM public.payment_transactions WHERE user_id = p_user_id
     );
  DELETE FROM public.rositas_transactions
  WHERE user_id = p_user_id
     OR payment_transaction_id IN (
       SELECT id FROM public.payment_transactions WHERE user_id = p_user_id
     );
  DELETE FROM public.payment_transactions WHERE user_id = p_user_id;
  DELETE FROM public.cadastros_pendentes
  WHERE lower(email) = lower(account_email);

  -- Companion-dependent rows cascade. Client, wallet and Auth rows cascade
  -- from auth.users; deleting the profile first satisfies its NO ACTION FK.
  DELETE FROM public.acompanhantes WHERE auth_user_id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_account_data(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_account_data(uuid) TO service_role;
