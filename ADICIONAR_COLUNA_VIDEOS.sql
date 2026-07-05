-- =========================================
-- CORREÇÃO URGENTE: ADICIONAR COLUNA VIDEOS
-- =========================================

-- 1. ADICIONAR COLUNA 'videos' NA TABELA acompanhantes
ALTER TABLE acompanhantes ADD COLUMN videos TEXT[] DEFAULT '{}';

-- 2. POPULAR A COLUNA 'videos' COM BASE NO 'video_url' EXISTENTE
UPDATE acompanhantes 
SET videos = CASE 
    WHEN video_url IS NOT NULL AND video_url != '' THEN ARRAY[video_url]
    ELSE '{}'
END;

-- 3. CORRIGIR URLs QUE ESTÃO NO BUCKET ERRADO (images -> videos)
UPDATE acompanhantes 
SET 
    video_url = REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/'),
    videos = ARRAY[REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/')]
WHERE video_url LIKE '%/storage/v1/object/public/images/%' 
  AND (video_url LIKE '%.mp4%' OR video_url LIKE '%.webm%' OR video_url LIKE '%.mov%');

-- 4. VERIFICAR RESULTADOS
SELECT 'Verificando dados após correção...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    array_length(videos, 1) as videos_count
FROM acompanhantes 
WHERE video_url IS NOT NULL OR array_length(videos, 1) > 0
ORDER BY created_at DESC
LIMIT 10; 