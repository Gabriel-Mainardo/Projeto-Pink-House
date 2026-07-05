-- ================================================
-- CORREÇÃO: Erro ao criar cliente (foreign key constraint)
-- ================================================
-- Erro: insert or update on table "clientes" violates foreign key constraint "clientes_user_id_fkey"
-- Causa: user_id não existe na tabela auth.users quando tentamos inserir

-- SOLUÇÃO 1: Remover política restritiva e permitir INSERT para anon
-- Isso é necessário porque após signUp, o usuário ainda não está "authenticated"

-- 1. REMOVER políticas de INSERT antigas
DROP POLICY IF EXISTS "Permitir criação de perfil de cliente" ON public.clientes;
DROP POLICY IF EXISTS "Permitir criação de perfil cliente" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem inserir seus próprios dados" ON public.clientes;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.clientes;

-- 2. CRIAR nova política que permite INSERT para anon E authenticated
-- Isso permite que o usuário recém-criado (ainda anon) insira seu perfil
CREATE POLICY "Permitir criação de perfil cliente"
    ON public.clientes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 3. Garantir que anon tenha permissões necessárias
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.clientes TO anon, authenticated;

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Verificar políticas de INSERT
SELECT
    '=== POLÍTICAS DE INSERT ===' as info,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
    AND cmd = 'INSERT';

-- Verificar permissões
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'clientes'
    AND privilege_type = 'INSERT';

-- ================================================
-- INSTRUÇÕES
-- ================================================
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Teste criar uma conta de cliente novamente
-- 3. O erro de foreign key deve estar resolvido
-- ================================================
