-- =========================================
-- ADICIONAR COLUNA VIEWS AOS STORIES
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- para adicionar contador de visualizações

-- Verificar se a coluna já existe
SELECT 'Verificando se coluna views existe...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'created_stories' AND column_name = 'views';

-- Adicionar coluna views se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'created_stories' 
        AND column_name = 'views'
    ) THEN 
        ALTER TABLE created_stories ADD COLUMN views INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna views adicionada com sucesso!';
    ELSE 
        RAISE NOTICE 'Coluna views já existe!';
    END IF; 
END $$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_created_stories_views ON created_stories(views DESC);

-- Atualizar stories existentes para ter 0 views (se necessário)
UPDATE created_stories SET views = 0 WHERE views IS NULL;

-- Verificar resultado
SELECT 'Verificação final:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' AND column_name = 'views';

SELECT 'Contagem de stories:' as status;
SELECT COUNT(*) as total_stories, 
       COUNT(CASE WHEN views IS NOT NULL THEN 1 END) as stories_com_views,
       SUM(COALESCE(views, 0)) as total_views
FROM created_stories;

SELECT '✅ COLUNA VIEWS CONFIGURADA COM SUCESSO! ✅' as resultado;