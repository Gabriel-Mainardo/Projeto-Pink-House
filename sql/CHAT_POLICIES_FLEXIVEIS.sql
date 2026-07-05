-- ============================================
-- POLICIES FLEXÍVEIS PARA O CHAT
-- Permite funcionamento com e sem sessão Supabase Auth
-- Execute no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. REMOVER POLICIES ANTERIORES
-- ============================================

DROP POLICY IF EXISTS "Cliente autenticado cria conversa" ON conversations;
DROP POLICY IF EXISTS "Usuário vê suas conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes atualizam conversa" ON conversations;
DROP POLICY IF EXISTS "Participante autenticado envia mensagem" ON messages;
DROP POLICY IF EXISTS "Usuário lê mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Usuário marca mensagens como lidas" ON messages;

-- Remover outras policies que possam existir
DROP POLICY IF EXISTS "Permitir criar conversas" ON conversations;
DROP POLICY IF EXISTS "Permitir enviar mensagens" ON messages;
DROP POLICY IF EXISTS "Usuários veem suas conversas" ON conversations;
DROP POLICY IF EXISTS "Usuários veem mensagens de suas conversas" ON messages;

-- ============================================
-- 2. GARANTIR RLS ATIVO
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. POLICIES PARA CONVERSATIONS
-- ============================================

-- INSERT: Qualquer usuário autenticado pode criar conversa
-- (O client_id será validado pela aplicação)
CREATE POLICY "Usuários podem criar conversas"
ON conversations
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- SELECT: Usuários podem ver conversas onde participam
-- Funciona com auth.uid() OU permite acesso geral (a aplicação filtra)
CREATE POLICY "Usuários podem ver conversas"
ON conversations
FOR SELECT
TO authenticated, anon
USING (true);

-- UPDATE: Participantes podem atualizar
CREATE POLICY "Usuários podem atualizar conversas"
ON conversations
FOR UPDATE
TO authenticated, anon
USING (true);

-- ============================================
-- 4. POLICIES PARA MESSAGES
-- ============================================

-- INSERT: Usuários podem enviar mensagens
CREATE POLICY "Usuários podem enviar mensagens"
ON messages
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- SELECT: Usuários podem ver mensagens
CREATE POLICY "Usuários podem ver mensagens"
ON messages
FOR SELECT
TO authenticated, anon
USING (true);

-- UPDATE: Usuários podem atualizar mensagens (marcar como lida)
CREATE POLICY "Usuários podem atualizar mensagens"
ON messages
FOR UPDATE
TO authenticated, anon
USING (true);

-- ============================================
-- 5. PERMISSÕES
-- ============================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT ALL ON public.conversations TO anon;
GRANT ALL ON public.conversations TO authenticated;

GRANT ALL ON public.messages TO anon;
GRANT ALL ON public.messages TO authenticated;

-- ============================================
-- 6. VERIFICAÇÃO
-- ============================================

SELECT '=== POLICIES CONVERSATIONS ===' as info;
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'conversations';

SELECT '=== POLICIES MESSAGES ===' as info;
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages';

-- ============================================
-- AVISO IMPORTANTE
-- ============================================
-- Estas policies são PERMISSIVAS para desenvolvimento.
-- A segurança é feita na APLICAÇÃO (frontend filtra por userId).
--
-- Para PRODUÇÃO, use as policies mais restritivas em:
-- sql/CORRIGIR_POLICIES_SEGURANCA.sql
-- ============================================
