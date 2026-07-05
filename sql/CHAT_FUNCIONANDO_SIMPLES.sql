-- ============================================
-- CHAT FUNCIONANDO - POLICIES SIMPLIFICADAS
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Cliente autenticado cria conversa" ON conversations;
DROP POLICY IF EXISTS "Usuário vê suas conversas" ON conversations;
DROP POLICY IF EXISTS "Participantes atualizam conversa" ON conversations;
DROP POLICY IF EXISTS "Participante autenticado envia mensagem" ON messages;
DROP POLICY IF EXISTS "Usuário lê mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Usuário marca mensagens como lidas" ON messages;

-- ============================================
-- POLICIES SIMPLIFICADAS - CONVERSATIONS
-- ============================================

-- Qualquer usuário autenticado pode criar conversa
CREATE POLICY "Autenticado cria conversa"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Qualquer usuário autenticado pode ver conversas
CREATE POLICY "Autenticado vê conversas"
ON conversations
FOR SELECT
TO authenticated
USING (true);

-- Qualquer usuário autenticado pode atualizar conversa
CREATE POLICY "Autenticado atualiza conversa"
ON conversations
FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- POLICIES SIMPLIFICADAS - MESSAGES
-- ============================================

-- Qualquer usuário autenticado pode enviar mensagem
CREATE POLICY "Autenticado envia mensagem"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Qualquer usuário autenticado pode ver mensagens
CREATE POLICY "Autenticado vê mensagens"
ON messages
FOR SELECT
TO authenticated
USING (true);

-- Qualquer usuário autenticado pode atualizar mensagens
CREATE POLICY "Autenticado atualiza mensagens"
ON messages
FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- VERIFICAR
-- ============================================

SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;
