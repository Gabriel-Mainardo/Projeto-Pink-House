-- ============================================
-- CHAT PÚBLICO - TEMPORÁRIO (SEM AUTENTICAÇÃO)
-- Para fazer funcionar AGORA, refinamos depois
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Autenticado cria conversa" ON conversations;
DROP POLICY IF EXISTS "Autenticado vê conversas" ON conversations;
DROP POLICY IF EXISTS "Autenticado atualiza conversa" ON conversations;
DROP POLICY IF EXISTS "Autenticado envia mensagem" ON messages;
DROP POLICY IF EXISTS "Autenticado vê mensagens" ON messages;
DROP POLICY IF EXISTS "Autenticado atualiza mensagens" ON messages;

-- ============================================
-- POLICIES PÚBLICAS - CONVERSATIONS
-- ============================================

CREATE POLICY "Público cria conversa"
ON conversations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Público vê conversas"
ON conversations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Público atualiza conversa"
ON conversations
FOR UPDATE
TO public
USING (true);

-- ============================================
-- POLICIES PÚBLICAS - MESSAGES
-- ============================================

CREATE POLICY "Público envia mensagem"
ON messages
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Público vê mensagens"
ON messages
FOR SELECT
TO public
USING (true);

CREATE POLICY "Público atualiza mensagens"
ON messages
FOR UPDATE
TO public
USING (true);

-- ============================================
-- VERIFICAR
-- ============================================

SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;
