-- ================================================
-- VERIFICAR E CORRIGIR RLS DA TABELA CLIENTES
-- ================================================

-- 1. Verificar políticas atuais
SELECT
    '=== POLÍTICAS ATUAIS DA TABELA CLIENTES ===' as info;

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes';

-- 2. Verificar se RLS está habilitado
SELECT
    '=== STATUS DO RLS ===' as info;

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'clientes';

-- 3. Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Clientes podem inserir seus próprios dados" ON clientes;
DROP POLICY IF EXISTS "Clientes podem ver apenas seus dados" ON clientes;
DROP POLICY IF EXISTS "Clientes podem atualizar seus dados" ON clientes;

-- 4. Criar política que permite INSERT para usuários anônimos e autenticados
CREATE POLICY "Permitir INSERT de clientes"
    ON clientes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 5. Criar política que permite SELECT para o próprio usuário
CREATE POLICY "Clientes podem ver seus dados"
    ON clientes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Criar política que permite UPDATE para o próprio usuário
CREATE POLICY "Clientes podem atualizar seus dados"
    ON clientes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Garantir permissões
GRANT INSERT ON clientes TO anon, authenticated;
GRANT SELECT ON clientes TO authenticated;
GRANT UPDATE ON clientes TO authenticated;

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================

SELECT
    '=== POLÍTICAS APÓS CORREÇÃO ===' as info;

SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes';

SELECT
    '=== PERMISSÕES ===' as info;

SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'clientes';
