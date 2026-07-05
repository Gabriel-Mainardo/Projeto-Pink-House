-- Tabela para persistir as etapas de seguranca ativadas por conversa
CREATE TABLE IF NOT EXISTS conversation_security_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  activated_by UUID NOT NULL REFERENCES auth.users(id),
  steps TEXT[] NOT NULL DEFAULT '{}',
  video_call_completed BOOLEAN NOT NULL DEFAULT false,
  video_call_completed_at TIMESTAMPTZ,
  face_verified BOOLEAN NOT NULL DEFAULT false,
  face_verified_at TIMESTAMPTZ,
  face_photo_url TEXT,
  payment_activated BOOLEAN NOT NULL DEFAULT false,
  payment_activated_at TIMESTAMPTZ,
  payment_status TEXT NOT NULL DEFAULT 'not_requested'
    CHECK (payment_status IN ('not_requested', 'awaiting_payment', 'paid', 'released', 'failed')),
  payment_requested_at TIMESTAMPTZ,
  payment_paid_at TIMESTAMPTZ,
  payment_released_at TIMESTAMPTZ,
  payment_transaction_id UUID,
  service_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  checkin_location TEXT,
  checkin_duration TEXT,
  checkin_activated BOOLEAN NOT NULL DEFAULT false,
  checkin_activated_at TIMESTAMPTZ,
  checkin_confirmed BOOLEAN NOT NULL DEFAULT false,
  checkin_confirmed_at TIMESTAMPTZ,
  checkin_latitude DOUBLE PRECISION,
  checkin_longitude DOUBLE PRECISION,
  checkin_note TEXT,
  monitoring_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (monitoring_status IN ('idle', 'configured', 'active', 'overdue', 'completed')),
  monitoring_started_at TIMESTAMPTZ,
  monitoring_expires_at TIMESTAMPTZ,
  monitoring_finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id)
);

ALTER TABLE conversation_security_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_security_steps REPLICA IDENTITY FULL;

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

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversation_security_steps;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
