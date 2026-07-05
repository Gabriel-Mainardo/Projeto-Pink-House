-- ================================================
-- EVITAR EMAIL DUPLICADO ENTRE CLIENTES E ACOMPANHANTES
-- Versão corrigida para Supabase SQL Editor
-- ================================================

-- Criar função que verifica se email já existe em outra tabela
 OR REPLACE FUNCTION check_email_unique_across_tables()
RETURNS TRIGCREATEGER
LANGUAGE plpgsql
AS $function$
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
$function$;

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
-- VERIFICAÇÃO - Triggers criados
-- ================================================

SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE 'check_email_unique%'
ORDER BY event_object_table;
