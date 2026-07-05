-- ============================================
-- SISTEMA DE MENSAGENS COMPLETO
-- Execute este script no Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  companion_id UUID NOT NULL REFERENCES acompanhantes(id) ON DELETE CASCADE,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, companion_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT messages_text_not_empty CHECK (LENGTH(TRIM(text)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_companion ON conversations(companion_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read) WHERE read = FALSE;

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    updated_at = NOW(),
    last_message_text = NEW.text,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation ON messages;
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "Permitir criar conversas" ON conversations;
CREATE POLICY "Permitir criar conversas"
  ON conversations
  FOR INSERT
  TO public
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios veem suas conversas" ON conversations;
DROP POLICY IF EXISTS "Usuários veem suas conversas" ON conversations;
CREATE POLICY "Usuarios veem suas conversas"
  ON conversations
  FOR SELECT
  TO public
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM acompanhantes a
      WHERE a.id = conversations.companion_id
        AND a.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Participantes podem atualizar conversa" ON conversations;
CREATE POLICY "Participantes podem atualizar conversa"
  ON conversations
  FOR UPDATE
  TO public
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM acompanhantes a
      WHERE a.id = conversations.companion_id
        AND a.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM acompanhantes a
      WHERE a.id = conversations.companion_id
        AND a.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Permitir enviar mensagens" ON messages;
CREATE POLICY "Permitir enviar mensagens"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      LEFT JOIN acompanhantes a ON a.id = c.companion_id
      WHERE c.id = messages.conversation_id
        AND (
          c.client_id = auth.uid()
          OR a.auth_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Usuarios veem mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Usuários veem mensagens de suas conversas" ON messages;
CREATE POLICY "Usuarios veem mensagens de suas conversas"
  ON messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      LEFT JOIN acompanhantes a ON a.id = c.companion_id
      WHERE c.id = messages.conversation_id
        AND (
          c.client_id = auth.uid()
          OR a.auth_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Marcar mensagens como lidas" ON messages;
CREATE POLICY "Marcar mensagens como lidas"
  ON messages
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      LEFT JOIN acompanhantes a ON a.id = c.companion_id
      WHERE c.id = messages.conversation_id
        AND (
          c.client_id = auth.uid()
          OR a.auth_user_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM conversations c
      LEFT JOIN acompanhantes a ON a.id = c.companion_id
      WHERE c.id = messages.conversation_id
        AND (
          c.client_id = auth.uid()
          OR a.auth_user_id = auth.uid()
        )
    )
  );

CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_client_id UUID,
  p_companion_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE client_id = p_client_id
    AND companion_id = p_companion_id;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (client_id, companion_id)
    VALUES (p_client_id, p_companion_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION count_unread_messages(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read = FALSE;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
