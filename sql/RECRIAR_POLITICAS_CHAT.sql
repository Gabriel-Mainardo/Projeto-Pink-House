-- ================================================
-- RECRIAR POLÍTICAS DE CHAT (FORÇA REMOÇÃO)
-- ================================================

-- ========================================
-- 1. REMOVER TODAS AS POLÍTICAS (FORÇADO)
-- ========================================

-- Conversations
DROP POLICY IF EXISTS "Público cria conversa" ON public.conversations CASCADE;
DROP POLICY IF EXISTS "Público vê conversas" ON public.conversations CASCADE;
DROP POLICY IF EXISTS "Público atualiza conversa" ON public.conversations CASCADE;
DROP POLICY IF EXISTS "Usuários autenticados criam conversas" ON public.conversations CASCADE;
DROP POLICY IF EXISTS "Participantes veem suas conversas" ON public.conversations CASCADE;
DROP POLICY IF EXISTS "Participantes atualizam suas conversas" ON public.conversations CASCADE;

-- Messages
DROP POLICY IF EXISTS "Público envia mensagem" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Público vê mensagens" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Público atualiza mensagens" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Participantes enviam mensagens" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Participantes veem mensagens" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Participantes atualizam mensagens" ON public.messages CASCADE;

-- ========================================
-- 2. CRIAR POLÍTICAS SEGURAS
-- ========================================

-- CONVERSATIONS - INSERT
CREATE POLICY "Usuários autenticados criam conversas"
    ON public.conversations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- CONVERSATIONS - SELECT
CREATE POLICY "Participantes veem suas conversas"
    ON public.conversations
    FOR SELECT
    TO authenticated
    USING (
        client_id::text IN (
            SELECT user_id::text FROM public.clientes WHERE user_id = auth.uid()
        )
        OR
        companion_id::text IN (
            SELECT auth_user_id::text FROM public.acompanhantes WHERE auth_user_id = auth.uid()
        )
    );

-- CONVERSATIONS - UPDATE
CREATE POLICY "Participantes atualizam suas conversas"
    ON public.conversations
    FOR UPDATE
    TO authenticated
    USING (
        client_id::text IN (
            SELECT user_id::text FROM public.clientes WHERE user_id = auth.uid()
        )
        OR
        companion_id::text IN (
            SELECT auth_user_id::text FROM public.acompanhantes WHERE auth_user_id = auth.uid()
        )
    );

-- MESSAGES - INSERT
CREATE POLICY "Participantes enviam mensagens"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (
                (c.client_id::text IN (
                    SELECT user_id::text FROM public.clientes WHERE user_id = auth.uid()
                ) AND sender_id = auth.uid())
                OR
                (c.companion_id::text IN (
                    SELECT auth_user_id::text FROM public.acompanhantes WHERE auth_user_id = auth.uid()
                ) AND sender_id = auth.uid())
            )
        )
    );

-- MESSAGES - SELECT
CREATE POLICY "Participantes veem mensagens"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (
                c.client_id::text IN (
                    SELECT user_id::text FROM public.clientes WHERE user_id = auth.uid()
                )
                OR
                c.companion_id::text IN (
                    SELECT auth_user_id::text FROM public.acompanhantes WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- MESSAGES - UPDATE
CREATE POLICY "Participantes atualizam mensagens"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (
                c.client_id::text IN (
                    SELECT user_id::text FROM public.clientes WHERE user_id = auth.uid()
                )
                OR
                c.companion_id::text IN (
                    SELECT auth_user_id::text FROM public.acompanhantes WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- ========================================
-- 3. GARANTIR RLS ATIVO
-- ========================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== ✅ POLÍTICAS CONVERSATIONS ===' as info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'conversations'
ORDER BY cmd, policyname;

SELECT '=== ✅ POLÍTICAS MESSAGES ===' as info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY cmd, policyname;

-- ================================================
-- ✅ PRONTO! Execute este SQL
-- ================================================
