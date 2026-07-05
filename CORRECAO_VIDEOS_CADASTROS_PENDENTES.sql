-- =========================================
-- CORREÇÃO VÍDEOS - CADASTROS PENDENTES
-- =========================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR ESTRUTURA DA TABELA cadastros_pendentes
SELECT 'Verificando estrutura da tabela cadastros_pendentes...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cadastros_pendentes' 
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNA 'videos' SE NÃO EXISTIR
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

-- 3. ATUALIZAR REGISTROS EXISTENTES QUE TENHAM video_url MAS NÃO videos
UPDATE cadastros_pendentes 
SET videos = ARRAY[video_url]
WHERE video_url IS NOT NULL 
AND video_url != '' 
AND (videos IS NULL OR videos = '{}' OR array_length(videos, 1) IS NULL);

-- 4. CORRIGIR URLs DE VÍDEO QUE ESTÃO NO BUCKET ERRADO (images -> videos)
UPDATE cadastros_pendentes 
SET 
    video_url = REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/'),
    videos = ARRAY[REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/')]
WHERE video_url LIKE '%/storage/v1/object/public/images/%' 
  AND (video_url LIKE '%.mp4%' OR video_url LIKE '%.webm%' OR video_url LIKE '%.mov%');

-- 5. VERIFICAR CADASTRO ESPECÍFICO DO MATHEUS
SELECT 'Verificando cadastro do Matheus...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    array_length(videos, 1) as total_videos,
    submitted_at
FROM cadastros_pendentes 
WHERE email = 'matheusmainardo123@gmail.com' 
   OR name ILIKE '%eduardo%cardoso%';

-- 6. VERIFICAR TODOS OS CADASTROS COM VÍDEOS
SELECT 'Verificando todos os cadastros com vídeos...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    array_length(videos, 1) as total_videos,
    CASE 
        WHEN video_url LIKE '%/videos/%' THEN '✅ URL CORRETA'
        WHEN video_url LIKE '%/images/%' THEN '❌ URL INCORRETA'
        WHEN video_url IS NULL THEN '⚪ SEM VÍDEO'
        ELSE '⚠️ URL DESCONHECIDA'
    END as status_url,
    submitted_at
FROM cadastros_pendentes 
WHERE video_url IS NOT NULL OR (videos IS NOT NULL AND array_length(videos, 1) > 0)
ORDER BY submitted_at DESC;

-- 7. CONTAGEM GERAL
SELECT 'Contagem geral de cadastros...' as status;
SELECT 
    COUNT(*) as total_cadastros,
    COUNT(video_url) as com_video_url,
    COUNT(CASE WHEN array_length(videos, 1) > 0 THEN 1 END) as com_videos_array,
    COUNT(CASE WHEN video_url LIKE '%/videos/%' THEN 1 END) as urls_corretas,
    COUNT(CASE WHEN video_url LIKE '%/images/%' THEN 1 END) as urls_incorretas
FROM cadastros_pendentes;

-- 8. ÚLTIMOS 5 CADASTROS PARA DEBUG
SELECT 'Últimos 5 cadastros para debug...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    submitted_at
FROM cadastros_pendentes 
ORDER BY submitted_at DESC 
LIMIT 5; 