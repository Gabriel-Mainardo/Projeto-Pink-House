-- Script para verificar e criar colunas de link se necessário
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela created_stories existe
DO $$
BEGIN
    -- Verificar e criar coluna story_link_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'created_stories' AND column_name = 'story_link_url'
    ) THEN
        ALTER TABLE created_stories ADD COLUMN story_link_url TEXT;
        RAISE NOTICE 'Coluna story_link_url criada';
    ELSE
        RAISE NOTICE 'Coluna story_link_url já existe';
    END IF;

    -- Verificar e criar coluna story_link_text
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'created_stories' AND column_name = 'story_link_text'
    ) THEN
        ALTER TABLE created_stories ADD COLUMN story_link_text TEXT;
        RAISE NOTICE 'Coluna story_link_text criada';
    ELSE
        RAISE NOTICE 'Coluna story_link_text já existe';
    END IF;

    -- Verificar e criar coluna link_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'created_stories' AND column_name = 'link_type'
    ) THEN
        ALTER TABLE created_stories ADD COLUMN link_type TEXT CHECK (link_type IN ('whatsapp', 'custom'));
        RAISE NOTICE 'Coluna link_type criada';
    ELSE
        RAISE NOTICE 'Coluna link_type já existe';
    END IF;

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao verificar/criar colunas: %', SQLERRM;
END $$;

-- Verificar o resultado
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name IN ('story_link_url', 'story_link_text', 'link_type')
ORDER BY column_name;

-- Verificar se a tabela existe e mostrar sua estrutura
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'created_stories'
) as table_exists; 