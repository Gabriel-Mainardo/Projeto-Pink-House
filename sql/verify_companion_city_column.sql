-- Verificar se a coluna companion_city existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name = 'companion_city';

-- Se nao existir, criar a coluna
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS companion_city TEXT;