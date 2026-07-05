-- =========================================
-- CORREÇÃO URLS DE VÍDEOS PROBLEMÁTICAS
-- =========================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR URLs problemáticas
SELECT 'Verificando URLs problemáticas...' as status;

SELECT 
    name,
    email,
    video_url,
    videos,
    CASE 
        WHEN video_url LIKE '%20%' OR video_url LIKE '%28%' OR video_url LIKE '%29%' THEN 'URL problemática'
        WHEN EXISTS (
            SELECT 1 FROM unnest(videos) AS v 
            WHERE v LIKE '%20%' OR v LIKE '%28%' OR v LIKE '%29%'
        ) THEN 'Array videos problemático'
        ELSE 'OK'
    END as status_url
FROM acompanhantes
WHERE video_url IS NOT NULL OR (videos IS NOT NULL AND array_length(videos, 1) > 0)
ORDER BY created_at DESC;

-- 2. CORRIGIR URL do Eduardo especificamente
SELECT 'Corrigindo URL do Eduardo...' as status;

UPDATE acompanhantes 
SET 
    video_url = REPLACE(REPLACE(REPLACE(video_url, '%20', '_'), '%28', ''), '%29', ''),
    videos = ARRAY[REPLACE(REPLACE(REPLACE(videos[1], '%20', '_'), '%28', ''), '%29', '')]
WHERE email = 'matheusmainardo123@gmail.com' 
    AND (video_url LIKE '%20%' OR video_url LIKE '%28%' OR video_url LIKE '%29%');

-- 3. CORRIGIR todas as URLs problemáticas
SELECT 'Corrigindo todas as URLs problemáticas...' as status;

-- Corrigir video_url
UPDATE acompanhantes 
SET video_url = REPLACE(REPLACE(REPLACE(video_url, '%20', '_'), '%28', ''), '%29', '')
WHERE video_url LIKE '%20%' OR video_url LIKE '%28%' OR video_url LIKE '%29%';

-- Corrigir array videos (mais complexo)
DO $$
DECLARE
    rec RECORD;
    cleaned_videos TEXT[];
    video_url_text TEXT;
BEGIN
    FOR rec IN 
        SELECT id, videos 
        FROM acompanhantes 
        WHERE videos IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM unnest(videos) AS v 
            WHERE v LIKE '%20%' OR v LIKE '%28%' OR v LIKE '%29%'
        )
    LOOP
        cleaned_videos := ARRAY[]::TEXT[];
        
        FOR video_url_text IN SELECT unnest(rec.videos)
        LOOP
            -- Limpar a URL
            video_url_text := REPLACE(REPLACE(REPLACE(video_url_text, '%20', '_'), '%28', ''), '%29', '');
            cleaned_videos := array_append(cleaned_videos, video_url_text);
        END LOOP;
        
        -- Atualizar o registro
        UPDATE acompanhantes 
        SET videos = cleaned_videos 
        WHERE id = rec.id;
        
        RAISE NOTICE 'Corrigido videos para acompanhante ID: %', rec.id;
    END LOOP;
END $$;

-- 4. VERIFICAR RESULTADOS
SELECT 'Verificando resultados...' as status;

SELECT 
    name,
    email,
    video_url,
    videos,
    CASE 
        WHEN video_url LIKE '%20%' OR video_url LIKE '%28%' OR video_url LIKE '%29%' THEN '❌ Ainda problemática'
        WHEN EXISTS (
            SELECT 1 FROM unnest(videos) AS v 
            WHERE v LIKE '%20%' OR v LIKE '%28%' OR v LIKE '%29%'
        ) THEN '❌ Array ainda problemático'
        ELSE '✅ Corrigida'
    END as status_url
FROM acompanhantes
WHERE video_url IS NOT NULL OR (videos IS NOT NULL AND array_length(videos, 1) > 0)
ORDER BY created_at DESC;

-- 5. ESTATÍSTICAS FINAIS
SELECT 'Estatísticas finais...' as status;

SELECT 
    COUNT(*) as total_acompanhantes,
    COUNT(video_url) as com_video_url,
    COUNT(CASE WHEN videos IS NOT NULL AND array_length(videos, 1) > 0 THEN 1 END) as com_videos_array,
    COUNT(CASE WHEN video_url LIKE '%20%' OR video_url LIKE '%28%' OR video_url LIKE '%29%' THEN 1 END) as urls_ainda_problematicas
FROM acompanhantes;

SELECT '✅ Correção de URLs concluída!' as status; 