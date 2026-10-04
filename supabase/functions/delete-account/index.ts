import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

const respond = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond(405, { error: 'Método não permitido.' });

  const authorization = request.headers.get('Authorization') || '';
  const accessToken = authorization.match(/^Bearer (.+)$/i)?.[1];
  if (!accessToken) return respond(401, { error: 'Entre na conta para continuar.' });

  const body = await request.json().catch(() => null);
  if (body?.confirmation !== 'EXCLUIR') {
    return respond(400, { error: 'Confirmação inválida.' });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return respond(503, { error: 'Serviço indisponível.' });

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
  if (authError || !authData.user) return respond(401, { error: 'Sessão inválida. Entre novamente.' });

  const userId = authData.user.id;
  const { data: files, error: listError } = await admin.rpc('list_account_storage_objects', {
    p_user_id: userId,
  });
  if (listError) {
    console.error('Falha ao listar arquivos da conta:', listError);
    return respond(500, { error: 'Não foi possível preparar a exclusão. Tente novamente.' });
  }

  const byBucket = new Map<string, string[]>();
  for (const file of files || []) {
    const paths = byBucket.get(file.bucket_id) || [];
    paths.push(file.name);
    byBucket.set(file.bucket_id, paths);
  }

  for (const [bucket, paths] of byBucket) {
    for (let start = 0; start < paths.length; start += 100) {
      const { error } = await admin.storage.from(bucket).remove(paths.slice(start, start + 100));
      if (error) {
        console.error('Falha ao remover arquivos da conta:', error);
        return respond(500, { error: 'Não foi possível remover seus arquivos. Sua conta permanece ativa.' });
      }
    }
  }

  const { error: deleteError } = await admin.rpc('delete_account_data', { p_user_id: userId });
  if (deleteError) {
    console.error('Falha ao excluir conta:', deleteError);
    return respond(500, { error: 'Não foi possível concluir a exclusão. Tente novamente.' });
  }

  return respond(200, { success: true });
});
