-- ================================================
-- SOLUÇÃO: Permitir INSERT público na tabela clientes
-- ================================================
-- O problema é que após signUp, o usuário ainda não está "authenticated"
-- Vamos permitir INSERT para anon (anônimo) também

-- 1. REMOVER política de INSERT restritiva
DROP POLICY IF EXISTS "Permitir criação de perfil cliente" ON public.clientes;

-- 2. CRIAR nova política que permite INSERT para anon E authenticated
CREATE POLICY "Permitir criação de perfil cliente"
    ON public.clientes
    FOR INSERT
    TO anon, authenticated  -- Permite tanto anon quanto authenticated
    WITH CHECK (true);       -- Sem verificação

-- 3. Verificar
SELECT
    '=== POLÍTICA INSERT PÚBLICA ===' as info,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
    AND cmd = 'INSERT';

-- ================================================
-- Execute e teste novamente!
-- ================================================
