-- Adicionar campo de curtidas na tabela created_stories
ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Atualizar stories existentes para começar com 0 curtidas
UPDATE created_stories 
SET likes = 0 
WHERE likes IS NULL;

-- Criar índice para otimizar consultas por curtidas
CREATE INDEX IF NOT EXISTS idx_created_stories_likes ON created_stories(likes);

-- Função para incrementar curtidas de um story
CREATE OR REPLACE FUNCTION increment_story_likes(story_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_likes_count INTEGER;
BEGIN
    UPDATE created_stories 
    SET likes = likes + 1 
    WHERE id = story_id;
    
    SELECT likes INTO new_likes_count 
    FROM created_stories 
    WHERE id = story_id;
    
    RETURN new_likes_count;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar curtidas de um story
CREATE OR REPLACE FUNCTION decrement_story_likes(story_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_likes_count INTEGER;
BEGIN
    UPDATE created_stories 
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = story_id;
    
    SELECT likes INTO new_likes_count 
    FROM created_stories 
    WHERE id = story_id;
    
    RETURN new_likes_count;
END;
$$ LANGUAGE plpgsql;

-- Verificar se as alterações foram aplicadas
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name IN ('likes');