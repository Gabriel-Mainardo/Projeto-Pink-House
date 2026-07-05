-- ============================================
-- CORREÇÃO FINAL DAS POLICIES DO CHAT
-- Execute este script no Supabase SQL Editor
-- ============================================

-- ⚠️ IMPORTANTE: Este script corrige as policies com a estrutura correta
-- client_id = auth.uid() do cliente
-- companion_id = id da tabela acompanhantes (não é auth.uid())

-- ============================================
-- PASSO 1: CRIAR COLUNA auth_user_id NA TABELA ACOMPANHANTES
-- ============================================

-- Adicionar coluna auth_user_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'acompanhantes'
    AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE acompanhantes
    ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

    -- Criar índice para performance
    CREATE INDEX idx_acompanhantes_auth_user ON acompanhantes(auth_user_id);

    RAISE NOTICE '✅ Coluna auth_user_id criada com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna auth_user_id já existe';
  END IF;
END $$;

-- ============================================
-- PASSO 2: POPULAR auth_user_id COM DADOS EXISTENTES
-- ============================================

-- Se você já tem acompanhantes cadastradas com email,
-- este comando vai tentar vincular com auth.users
UPDATE acompanhantes a
SET auth_user_id = au.id
FROM auth.users au
WHERE a.email = au.email
AND a.auth_user_id IS NULL;

-- ============================================
-- PASSO 3: REMOVER POLICIES ANTIGAS
-- ============================================

DROP POLICY IF EXISTS "Cliente autenticado cria conversa" ON conversations;
DROP POLICY IF EXISTS "Usuário vê suas conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes atualizam conversa" ON conversations;
DROP POLICY IF EXISTS "Participante autenticado envia mensagem" ON messages;
DROP POLICY IF EXISTS "Usuário lê mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Usuário marca mensagens como lidas" ON messages;

-- ============================================
-- PASSO 4: CRIAR POLICIES CORRETAS - CONVERSATIONS
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
-- Cliente: auth.uid() = client_id
-- Acompanhante: auth.uid() = acompanhantes.auth_user_id (via JOIN)
CREATE POLICY "Usuário vê suas conversas"
ON conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = client_id
  OR EXISTS (
    SELECT 1 FROM acompanhantes
    WHERE acompanhantes.id = conversations.companion_id
    AND acompanhantes.auth_user_id = auth.uid()
  )
);

-- Policy 3: Participantes podem atualizar conversa
CREATE POLICY "Participantes atualizam conversa"
ON conversations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = client_id
  OR EXISTS (
    SELECT 1 FROM acompanhantes
    WHERE acompanhantes.id = conversations.companion_id
    AND acompanhantes.auth_user_id = auth.uid()
  )
);

-- ============================================
-- PASSO 5: CRIAR POLICIES CORRETAS - MESSAGES
-- ============================================

-- Policy 1: SOMENTE participante autenticado pode enviar mensagem
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
      OR EXISTS (
        SELECT 1 FROM acompanhantes
        WHERE acompanhantes.id = conversations.companion_id
        AND acompanhantes.auth_user_id = auth.uid()
      )
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
      OR EXISTS (
        SELECT 1 FROM acompanhantes
        WHERE acompanhantes.id = conversations.companion_id
        AND acompanhantes.auth_user_id = auth.uid()
      )
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
      OR EXISTS (
        SELECT 1 FROM acompanhantes
        WHERE acompanhantes.id = conversations.companion_id
        AND acompanhantes.auth_user_id = auth.uid()
      )
    )
  )
);

-- ============================================
-- PASSO 6: VERIFICAR POLICIES
-- ============================================

-- Ver todas as policies das tabelas
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- ============================================
-- PASSO 7: VERIFICAR ACOMPANHANTES SEM auth_user_id
-- ============================================

-- Mostrar acompanhantes que ainda não têm auth_user_id vinculado
SELECT
  id,
  nome,
  nome_profissional,
  email,
  auth_user_id,
  CASE
    WHEN auth_user_id IS NULL THEN '⚠️ SEM AUTH'
    ELSE '✅ COM AUTH'
  END as status
FROM acompanhantes
ORDER BY auth_user_id NULLS FIRST
LIMIT 10;

-- ============================================
-- FIM DO SCRIPT DE CORREÇÃO
-- ============================================
