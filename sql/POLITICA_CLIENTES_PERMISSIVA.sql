-- ================================================
-- POLÍTICA MAIS PERMISSIVA PARA CLIENTES (TESTE)
-- ================================================
-- Vamos tornar o INSERT mais permissivo para testar

-- 1. REMOVER política de INSERT atual
DROP POLICY IF EXISTS "Permitir criação de perfil cliente" ON public.clientes;

-- 2. CRIAR política de INSERT mais permissiva
-- Permite que usuários autenticados criem clientes sem verificação estrita
CREATE POLICY "Permitir criação de perfil cliente"
    ON public.clientes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);  -- Permite qualquer inserção de usuário autenticado

-- 3. Verificar
SELECT
    '=== POLÍTICA INSERT ATUALIZADA ===' as info,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
    AND cmd = 'INSERT';

-- ================================================
-- Execute este SQL e teste novamente
-- ================================================
