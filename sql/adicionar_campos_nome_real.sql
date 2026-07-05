-- Adicionar campos de nome real e nome de exibição nas tabelas

-- Adicionar campos na tabela acompanhantes
ALTER TABLE acompanhantes
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Atualizar registros existentes
UPDATE acompanhantes
SET display_name = name,
    real_name = name
WHERE display_name IS NULL;

-- Adicionar campos na tabela cadastros_pendentes
ALTER TABLE cadastros_pendentes
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Atualizar registros existentes
UPDATE cadastros_pendentes
SET display_name = name,
    real_name = name
WHERE display_name IS NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN acompanhantes.real_name IS 'Nome verdadeiro da acompanhante (uso interno)';
COMMENT ON COLUMN acompanhantes.display_name IS 'Nome que será exibido no site';
COMMENT ON COLUMN cadastros_pendentes.real_name IS 'Nome verdadeiro da acompanhante (uso interno)';
COMMENT ON COLUMN cadastros_pendentes.display_name IS 'Nome que será exibido no site'; 