-- Verificar se as colunas já existem e adicionar se não existirem
DO $$
BEGIN
    -- Adicionar coluna story_link_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'created_stories' 
                  AND column_name = 'story_link_url') THEN
        ALTER TABLE created_stories ADD COLUMN story_link_url TEXT;
    END IF;

    -- Adicionar coluna story_link_text se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'created_stories' 
                  AND column_name = 'story_link_text') THEN
        ALTER TABLE created_stories ADD COLUMN story_link_text TEXT;
    END IF;

    -- Adicionar coluna link_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'created_stories' 
                  AND column_name = 'link_type') THEN
        ALTER TABLE created_stories ADD COLUMN link_type TEXT;
    END IF;

    -- Log de sucesso
    RAISE NOTICE 'Colunas de link adicionadas ou já existem na tabela created_stories';
END;
$$; 