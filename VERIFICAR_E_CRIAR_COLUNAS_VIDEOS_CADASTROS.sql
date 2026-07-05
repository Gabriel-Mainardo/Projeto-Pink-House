-- Script para verificar e criar coluna videos na tabela cadastros_pendentes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna videos existe na tabela cadastros_pendentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cadastros_pendentes' 
AND column_name = 'videos';

-- 2. Se a coluna não existir, criá-la
DO $$
BEGIN
    -- Verificar se a coluna videos existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cadastros_pendentes' 
        AND column_name = 'videos'
    ) THEN
        -- Adicionar coluna videos como array de texto
        ALTER TABLE cadastros_pendentes 
        ADD COLUMN videos text[] DEFAULT '{}';
        
        RAISE NOTICE 'Coluna videos adicionada à tabela cadastros_pendentes';
    ELSE
        RAISE NOTICE 'Coluna videos já existe na tabela cadastros_pendentes';
    END IF;
END $$;

-- 3. Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cadastros_pendentes' 
ORDER BY ordinal_position;

-- 4. Atualizar registros existentes que tenham video_url mas não videos
UPDATE cadastros_pendentes 
SET videos = ARRAY[video_url]
WHERE video_url IS NOT NULL 
AND video_url != '' 
AND (videos IS NULL OR videos = '{}');

-- 5. Verificar dados atualizados
SELECT id, name, video_url, videos
FROM cadastros_pendentes 
WHERE video_url IS NOT NULL OR videos IS NOT NULL; 