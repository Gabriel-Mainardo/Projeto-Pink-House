-- Adicionar campos para informações do solicitante na tabela created_stories
-- Execute este script no painel SQL do Supabase

-- Adicionar coluna para nome do solicitante
ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS requester_name VARCHAR(255);

-- Adicionar coluna para WhatsApp do solicitante
ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS requester_whatsapp VARCHAR(50);

-- Adicionar comentários nas colunas
COMMENT ON COLUMN created_stories.requester_name IS 'Nome da pessoa que está criando o story';
COMMENT ON COLUMN created_stories.requester_whatsapp IS 'WhatsApp da pessoa que está criando o story para contato do admin';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
ORDER BY ordinal_position; 