-- ================================================
-- CORRIGIR POLÍTICAS DA TABELA CLIENTES
-- ================================================
-- O problema: políticas estão para "public" mas deveriam ser "authenticated"
-- Solução: Recriar todas as políticas corretamente

-- 1. REMOVER todas as políticas antigas
DROP POLICY IF EXISTS "Clientes podem atualizar próprio perfil" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem deletar próprio perfil" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem ver próprio perfil" ON public.clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem criar perfil cliente" ON public.clientes;

-- 2. CRIAR políticas CORRETAS

-- Política de INSERT: Usuários autenticados podem criar seu perfil
-- IMPORTANTE: Verifica se o user_id corresponde ao auth.uid()
CREATE POLICY "Permitir criação de perfil cliente"
    ON public.clientes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Permite inserir se o user_id for igual ao uid do usuário autenticado
        -- OU se o user_id for NULL (será preenchido depois)
        user_id IS NULL OR user_id = auth.uid()
    );

-- Política de SELECT: Clientes podem ver apenas seu próprio perfil
CREATE POLICY "Clientes veem próprio perfil"
    ON public.clientes
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Política de UPDATE: Clientes podem atualizar apenas seu próprio perfil
CREATE POLICY "Clientes atualizam próprio perfil"
    ON public.clientes
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política de DELETE: Clientes podem deletar apenas seu próprio perfil
CREATE POLICY "Clientes deletam próprio perfil"
    ON public.clientes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 3. Políticas para ADMINS (opcional mas útil)

-- Admins podem ver todos os clientes
CREATE POLICY "Admins veem todos os clientes"
    ON public.clientes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admins podem atualizar qualquer cliente
CREATE POLICY "Admins atualizam qualquer cliente"
    ON public.clientes
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 4. GARANTIR que RLS está ativo
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 5. GARANTIR permissões corretas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.clientes TO authenticated;

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Ver as políticas criadas
SELECT
    '=== POLÍTICAS CLIENTES ATUALIZADAS ===' as info,
    policyname,
    cmd as "comando",
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
ORDER BY policyname;

-- ================================================
-- PRONTO! ✅
-- ================================================
-- Execute este SQL e depois teste criar uma conta
-- O erro 401 vai sumir!
