-- ================================================
-- EVITAR EMAIL DUPLICADO ENTRE CLIENTES E ACOMPANHANTES
-- Versão SIMPLES para Supabase SQL Editor
-- ================================================

-- EXECUTE ESTE SQL EM PARTES, UMA SEÇÃO POR VEZ

-- ================================================
-- PARTE 1: Criar a função
-- ================================================
CREATE OR REPLACE FUNCTION check_email_unique_across_tables()
RETURNS TRIGGER AS '
BEGIN
  IF TG_TABLE_NAME = ''clientes'' THEN
    IF EXISTS (SELECT 1 FROM acompanhantes WHERE email = NEW.email) THEN
      RAISE EXCEPTION ''Este email já está cadastrado como acompanhante. Use outro email.'';
    END IF;
  END IF;

  IF TG_TABLE_NAME = ''acompanhantes'' THEN
    IF EXISTS (SELECT 1 FROM clientes WHERE email = NEW.email) THEN
      RAISE EXCEPTION ''Este email já está cadastrado como cliente. Use outro email.'';
    END IF;
  END IF;

  RETURN NEW;
END;
' LANGUAGE plpgsql;

-- ================================================
-- PARTE 2: Criar triggers
-- ================================================

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS check_email_unique_clientes ON clientes;
DROP TRIGGER IF EXISTS check_email_unique_acompanhantes ON acompanhantes;

-- Criar trigger para CLIENTES
CREATE TRIGGER check_email_unique_clientes
  BEFORE INSERT OR UPDATE OF email ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique_across_tables();

-- Criar trigger para ACOMPANHANTES
CREATE TRIGGER check_email_unique_acompanhantes
  BEFORE INSERT OR UPDATE OF email ON acompanhantes
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique_across_tables();

-- ================================================
-- PARTE 3: Verificar se funcionou
-- ================================================

SELECT 'Triggers criados com sucesso!' as status;

SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE 'check_email_unique%';
