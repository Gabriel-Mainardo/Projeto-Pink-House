-- Script para atualizar registros existentes na tabela cadastros_pendentes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar registros que têm video_url mas não têm videos
SELECT id, name, video_url, videos
FROM cadastros_pendentes 
WHERE video_url IS NOT NULL 
AND video_url != ''
AND (videos IS NULL OR videos = '{}' OR array_length(videos, 1) IS NULL);

-- 2. Atualizar registros existentes que tenham video_url mas não videos
UPDATE cadastros_pendentes 
SET videos = ARRAY[video_url]
WHERE video_url IS NOT NULL 
AND video_url != '' 
AND (videos IS NULL OR videos = '{}' OR array_length(videos, 1) IS NULL);

-- 3. Verificar todos os registros com vídeos após atualização
SELECT id, name, video_url, videos, array_length(videos, 1) as total_videos
FROM cadastros_pendentes 
WHERE video_url IS NOT NULL OR (videos IS NOT NULL AND array_length(videos, 1) > 0)
ORDER BY id DESC;

-- 4. Verificar se há registros pendentes de aprovação
SELECT COUNT(*) as total_pendentes
FROM cadastros_pendentes;

-- 5. Mostrar últimos 5 cadastros para debug
SELECT id, name, email, video_url, videos, submitted_at
FROM cadastros_pendentes 
ORDER BY submitted_at DESC 
LIMIT 5; 