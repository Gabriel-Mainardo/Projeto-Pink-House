-- =============================================
-- SISTEMA DE PAGAMENTOS - INTEGRACAO ASAAS
-- Faixa Rosa - Velvet Shadow Gallery
-- =============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asaas_payment_id TEXT NOT NULL UNIQUE,
  asaas_customer_id TEXT,
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('rositas', 'boost', 'story', 'secure_payment')),
  reference_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  billing_type TEXT NOT NULL
    CHECK (billing_type IN ('PIX', 'CREDIT_CARD', 'BOLETO')),
  status TEXT NOT NULL DEFAULT 'PENDING',
  external_reference TEXT UNIQUE,
  description TEXT,
  webhook_data JSONB,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_asaas_payment_id ON payment_transactions(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_reference ON payment_transactions(external_reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference_id ON payment_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(transaction_type);

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  rositas_balance INTEGER DEFAULT 0,
  pink_points_balance INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

CREATE TABLE IF NOT EXISTS rositas_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  pink_points INTEGER DEFAULT 0,
  balance_after INTEGER NOT NULL,
  description TEXT,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rositas_transactions_user_id ON rositas_transactions(user_id);

CREATE TABLE IF NOT EXISTS story_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_type TEXT NOT NULL,
  payment_id UUID REFERENCES payment_transactions(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_purchases_user_id ON story_purchases(user_id);

CREATE OR REPLACE FUNCTION credit_rositas(
  p_user_id UUID,
  p_rositas INTEGER,
  p_pink_points INTEGER DEFAULT 0,
  p_description TEXT DEFAULT 'Compra de Rositas',
  p_payment_transaction_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO user_wallets (user_id, rositas_balance, pink_points_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE user_wallets
  SET
    rositas_balance = rositas_balance + p_rositas,
    pink_points_balance = pink_points_balance + p_pink_points,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING rositas_balance INTO v_new_balance;

  INSERT INTO rositas_transactions (
    user_id, amount, pink_points, balance_after, description, payment_transaction_id
  ) VALUES (
    p_user_id, p_rositas, p_pink_points, v_new_balance, p_description, p_payment_transaction_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'credited', p_rositas
  );
END;
$$;

CREATE OR REPLACE FUNCTION debit_rositas(
  p_user_id UUID,
  p_rositas INTEGER,
  p_description TEXT DEFAULT 'Uso de Rositas'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT rositas_balance INTO v_current_balance
  FROM user_wallets
  WHERE user_id = p_user_id;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Carteira nao encontrada');
  END IF;

  IF v_current_balance < p_rositas THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente', 'balance', v_current_balance);
  END IF;

  UPDATE user_wallets
  SET
    rositas_balance = rositas_balance - p_rositas,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING rositas_balance INTO v_new_balance;

  INSERT INTO rositas_transactions (
    user_id, amount, balance_after, description
  ) VALUES (
    p_user_id, -p_rositas, v_new_balance, p_description
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'debited', p_rositas
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet user_wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_wallet
  FROM user_wallets
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_wallets (user_id, rositas_balance, pink_points_balance)
    VALUES (p_user_id, 0, 0)
    RETURNING * INTO v_wallet;
  END IF;

  RETURN jsonb_build_object(
    'rositas', v_wallet.rositas_balance,
    'pinkPoints', v_wallet.pink_points_balance,
    'totalSpent', v_wallet.total_spent
  );
END;
$$;

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rositas_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment_transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment_transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own wallet" ON user_wallets;
CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own rositas_transactions" ON rositas_transactions;
CREATE POLICY "Users can view own rositas_transactions"
  ON rositas_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own story_purchases" ON story_purchases;
CREATE POLICY "Users can view own story_purchases"
  ON story_purchases FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access payment_transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Service role full access user_wallets" ON user_wallets;
DROP POLICY IF EXISTS "Service role full access rositas_transactions" ON rositas_transactions;
DROP POLICY IF EXISTS "Service role full access story_purchases" ON story_purchases;

CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER trigger_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS trigger_user_wallets_updated_at ON user_wallets;
CREATE TRIGGER trigger_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at();
