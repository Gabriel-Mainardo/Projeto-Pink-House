-- ============================================
-- CORREÇÃO DE SEGURANÇA - POLICIES DO CHAT
-- Execute este script no Supabase SQL Editor
-- ============================================

-- ⚠️ IMPORTANTE: Este script corrige as policies perigosas
-- Somente usuários AUTENTICADOS podem usar o chat
-- Somente o CLIENTE pode iniciar conversa

-- ============================================
-- 1. REMOVER TODAS AS POLICIES ANTIGAS
-- ============================================

-- Conversations - remover todas
DROP POLICY IF EXISTS "Permitir criar conversas" ON conversations;
DROP POLICY IF EXISTS "Usuários veem suas conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes podem atualizar conversa" ON conversations;
DROP POLICY IF EXISTS "Público cria conversa" ON conversations;
DROP POLICY IF EXISTS "Público vê conversas" ON conversations;
DROP POLICY IF EXISTS "Público atualiza conversa" ON conversations;
DROP POLICY IF EXISTS "Cliente autenticado cria conversa" ON conversations;
DROP POLICY IF EXISTS "Usuário vê suas conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes atualizam conversa" ON conversations;
DROP POLICY IF EXISTS "Usuários autenticados criam conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes veem suas conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes atualizam suas conversas" ON conversations;

-- Messages - remover todas
DROP POLICY IF EXISTS "Permitir enviar mensagens" ON messages;
DROP POLICY IF EXISTS "Usuários veem mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Marcar mensagens como lidas" ON messages;
DROP POLICY IF EXISTS "Público envia mensagem" ON messages;
DROP POLICY IF EXISTS "Público vê mensagens" ON messages;
DROP POLICY IF EXISTS "Público atualiza mensagens" ON messages;
DROP POLICY IF EXISTS "Participante autenticado envia mensagem" ON messages;
DROP POLICY IF EXISTS "Usuário lê mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Usuário marca mensagens como lidas" ON messages;
DROP POLICY IF EXISTS "Participantes enviam mensagens" ON messages;
DROP POLICY IF EXISTS "Participantes veem mensagens" ON messages;
DROP POLICY IF EXISTS "Participantes atualizam mensagens" ON messages;

-- ============================================
-- POLICIES CORRETAS - CONVERSATIONS
-- ============================================

-- Policy 1: SOMENTE CLIENTE AUTENTICADO pode criar conversa
-- (Acompanhante NÃO pode iniciar conversa)
CREATE POLICY "Cliente autenticado cria conversa"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = client_id
);

-- Policy 2: Usuário vê conversas onde participa
CREATE POLICY "Usuário vê suas conversas"
ON conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = client_id
  OR auth.uid() = companion_id
);

-- Policy 3: Participantes podem atualizar conversa
CREATE POLICY "Participantes atualizam conversa"
ON conversations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = client_id
  OR auth.uid() = companion_id
);

-- ============================================
-- POLICIES CORRETAS - MESSAGES
-- ============================================

-- Policy 1: SOMENTE usuário autenticado pode enviar mensagem
-- E somente se for participante da conversa
CREATE POLICY "Participante autenticado envia mensagem"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.client_id = auth.uid()
      OR conversations.companion_id = auth.uid()
    )
  )
);

-- Policy 2: Usuário lê mensagens de suas conversas
CREATE POLICY "Usuário lê mensagens de suas conversas"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.client_id = auth.uid()
      OR conversations.companion_id = auth.uid()
    )
  )
);

-- Policy 3: Usuário pode marcar mensagens como lidas
CREATE POLICY "Usuário marca mensagens como lidas"
ON messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.client_id = auth.uid()
      OR conversations.companion_id = auth.uid()
    )
  )
);

-- ============================================
-- 2. GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. PERMISSÕES PARA O ROLE AUTHENTICATED
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Também permitir anon ver acompanhantes (para buscar dados)
GRANT SELECT ON public.acompanhantes TO anon;
GRANT SELECT ON public.acompanhantes TO authenticated;

-- ============================================
-- 4. REMOVER FUNÇÃO PERIGOSA (SE EXISTIR)
-- ============================================

-- A função get_or_create_conversation com SECURITY DEFINER é perigosa
-- A lógica agora é feita no frontend com as policies aplicadas
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID);

-- ============================================
-- 5. HABILITAR REALTIME (CASO NÃO ESTEJA)
-- ============================================

-- Isso pode dar erro se já estiver habilitado, é normal
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- ============================================
-- 6. VERIFICAR POLICIES APLICADAS
-- ============================================

SELECT '=== POLICIES DE CONVERSATIONS ===' as info;
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'conversations'
ORDER BY cmd, policyname;

SELECT '=== POLICIES DE MESSAGES ===' as info;
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY cmd, policyname;

-- ============================================
-- 7. VERIFICAR RLS ESTÁ ATIVO
-- ============================================

SELECT
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages');

-- ============================================
-- PRONTO! 🔒
-- ============================================
--
-- RESUMO DAS POLÍTICAS APLICADAS:
--
-- CONVERSATIONS:
--   INSERT: Somente usuário autenticado, e client_id = auth.uid()
--   SELECT: Participantes (client_id ou companion_id = auth.uid())
--   UPDATE: Participantes
--
-- MESSAGES:
--   INSERT: Participantes autenticados, sender_id = auth.uid()
--   SELECT: Participantes da conversa
--   UPDATE: Participantes (para marcar como lido)
--
-- ============================================
