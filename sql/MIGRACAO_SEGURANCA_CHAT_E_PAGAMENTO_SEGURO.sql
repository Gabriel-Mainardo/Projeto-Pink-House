-- Execute este script em projetos que ja possuem as tabelas criadas.
-- Ele ajusta as etapas de seguranca, corrige as policies de conversa
-- e habilita o novo fluxo de pagamento seguro.

ALTER TABLE IF EXISTS conversation_security_steps
  ADD COLUMN IF NOT EXISTS video_call_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_call_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_transaction_id UUID,
  ADD COLUMN IF NOT EXISTS service_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checkin_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checkin_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkin_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkin_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkin_note TEXT,
  ADD COLUMN IF NOT EXISTS monitoring_status TEXT NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS monitoring_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS monitoring_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS monitoring_finished_at TIMESTAMPTZ;

UPDATE conversation_security_steps
SET steps = array_replace(steps, 'facial-recognition', 'selfie-verification')
WHERE steps @> ARRAY['facial-recognition'];

ALTER TABLE IF EXISTS conversation_security_steps
  DROP CONSTRAINT IF EXISTS conversation_security_steps_payment_status_check,
  DROP CONSTRAINT IF EXISTS conversation_security_steps_monitoring_status_check;

ALTER TABLE IF EXISTS conversation_security_steps
  ADD CONSTRAINT conversation_security_steps_payment_status_check
    CHECK (payment_status IN ('not_requested', 'awaiting_payment', 'paid', 'released', 'failed')),
  ADD CONSTRAINT conversation_security_steps_monitoring_status_check
    CHECK (monitoring_status IN ('idle', 'configured', 'active', 'overdue', 'completed'));

ALTER TABLE IF EXISTS conversation_security_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_security_steps REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_conv_security_steps_conversation
  ON conversation_security_steps(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conv_security_steps_payment_status
  ON conversation_security_steps(payment_status);

CREATE INDEX IF NOT EXISTS idx_conv_security_steps_monitoring_status
  ON conversation_security_steps(monitoring_status);

CREATE OR REPLACE FUNCTION update_security_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_security_steps_updated_at ON conversation_security_steps;
CREATE TRIGGER trigger_security_steps_updated_at
  BEFORE UPDATE ON conversation_security_steps
  FOR EACH ROW EXECUTE FUNCTION update_security_steps_updated_at();

DROP POLICY IF EXISTS "participants_can_manage_security_steps" ON conversation_security_steps;
CREATE POLICY "participants_can_manage_security_steps"
  ON conversation_security_steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      LEFT JOIN acompanhantes a ON a.id = c.companion_id
      WHERE c.id = conversation_security_steps.conversation_id
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
      WHERE c.id = conversation_security_steps.conversation_id
        AND (
          c.client_id = auth.uid()
          OR a.auth_user_id = auth.uid()
        )
    )
  );

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

ALTER TABLE IF EXISTS payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_transaction_type_check;

ALTER TABLE IF EXISTS payment_transactions
  ADD CONSTRAINT payment_transactions_transaction_type_check
    CHECK (transaction_type IN ('rositas', 'boost', 'story', 'secure_payment'));

DROP POLICY IF EXISTS "Service role full access payment_transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Service role full access user_wallets" ON user_wallets;
DROP POLICY IF EXISTS "Service role full access rositas_transactions" ON rositas_transactions;
DROP POLICY IF EXISTS "Service role full access story_purchases" ON story_purchases;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversation_security_steps;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
