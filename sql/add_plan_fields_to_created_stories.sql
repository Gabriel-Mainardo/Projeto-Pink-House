-- Adicionar campos para informações do plano na tabela created_stories
-- Execute este script no painel SQL do Supabase

-- Primeiro, remover a constraint CHECK existente se ela existir
DO $$ 
BEGIN
    -- Tenta remover a constraint se ela existir
    ALTER TABLE created_stories 
    DROP CONSTRAINT IF EXISTS created_stories_plan_type_check;
EXCEPTION
    WHEN undefined_object THEN
        -- Ignora se a constraint não existir
        NULL;
END $$;

-- Adicionar todas as colunas de plano em uma única operação
ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS plan_name character varying,
ADD COLUMN IF NOT EXISTS plan_price numeric,
ADD COLUMN IF NOT EXISTS plan_type character varying DEFAULT 'destaque'::character varying;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN created_stories.plan_name IS 'Nome do plano escolhido';
COMMENT ON COLUMN created_stories.plan_price IS 'Preço do plano escolhido';
COMMENT ON COLUMN created_stories.plan_type IS 'Tipo do plano escolhido (padrão: destaque)';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name IN ('plan_name', 'plan_price', 'plan_type')
ORDER BY column_name; 