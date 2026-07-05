-- ================================================
-- EVITAR EMAIL DUPLICADO ENTRE CLIENTES E ACOMPANHANTES
-- ================================================

-- Criar função que verifica se email já existe em outra tabela
CREATE OR REPLACE FUNCTION check_email_unique_across_tables()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está inserindo/atualizando em CLIENTES
  IF TG_TABLE_NAME = 'clientes' THEN
    -- Verificar se email já existe em ACOMPANHANTES
    IF EXISTS (
      SELECT 1 FROM acompanhantes
      WHERE email = NEW.email
    ) THEN
      RAISE EXCEPTION 'Este email já está cadastrado como acompanhante. Use outro email.';
    END IF;
  END IF;

  -- Se está inserindo/atualizando em ACOMPANHANTES
  IF TG_TABLE_NAME = 'acompanhantes' THEN
    -- Verificar se email já existe em CLIENTES
    IF EXISTS (
      SELECT 1 FROM clientes
      WHERE email = NEW.email
    ) THEN
      RAISE EXCEPTION 'Este email já está cadastrado como cliente. Use outro email.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para CLIENTES
DROP TRIGGER IF EXISTS check_email_unique_clientes ON clientes;
CREATE TRIGGER check_email_unique_clientes
  BEFORE INSERT OR UPDATE OF email ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique_across_tables();

-- Criar trigger para ACOMPANHANTES
DROP TRIGGER IF EXISTS check_email_unique_acompanhantes ON acompanhantes;
CREATE TRIGGER check_email_unique_acompanhantes
  BEFORE INSERT OR UPDATE OF email ON acompanhantes
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique_across_tables();

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Testar inserindo um cliente
INSERT INTO clientes (email, name, user_id)
VALUES ('teste@email.com', 'Cliente Teste', gen_random_uuid());

-- Tentar inserir acompanhante com mesmo email (deve FALHAR)
INSERT INTO acompanhantes (email, name, auth_user_id)
VALUES ('teste@email.com', 'Acompanhante Teste', gen_random_uuid());

-- Limpar teste
DELETE FROM clientes WHERE email = 'teste@email.com';

SELECT '✅ Triggers criados com sucesso!' as resultado;
