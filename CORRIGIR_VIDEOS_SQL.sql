-- =========================================
-- SCRIPT PARA CORRIGIR PROBLEMAS DOS VÍDEOS
-- =========================================
-- Execute após identificar os problemas com as queries de debug

-- 1. ADICIONAR COLUNA 'videos' SE NÃO EXISTIR
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'acompanhantes' AND column_name = 'videos'
    ) THEN
        ALTER TABLE acompanhantes ADD COLUMN videos TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna videos adicionada à tabela acompanhantes';
    ELSE
        RAISE NOTICE 'Coluna videos já existe na tabela acompanhantes';
    END IF;
END $$;

-- 2. CORRIGIR URLs DE VÍDEO QUE ESTÃO NO BUCKET ERRADO
UPDATE acompanhantes 
SET video_url = REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/')
WHERE video_url LIKE '%/storage/v1/object/public/images/%' 
  AND (video_url LIKE '%.mp4%' OR video_url LIKE '%.webm%' OR video_url LIKE '%.mov%');

-- 3. POPULAR CAMPO 'videos' COM BASE NO 'video_url'
UPDATE acompanhantes 
SET videos = ARRAY[video_url]
WHERE video_url IS NOT NULL 
  AND (videos IS NULL OR array_length(videos, 1) IS NULL OR array_length(videos, 1) = 0);

-- 4. VERIFICAR E CORRIGIR CADASTRO ESPECÍFICO DO MATHEUS
UPDATE acompanhantes 
SET 
    videos = CASE 
        WHEN video_url IS NOT NULL THEN ARRAY[REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/')]
        ELSE '{}'
    END,
    video_url = CASE 
        WHEN video_url LIKE '%/storage/v1/object/public/images/%' THEN REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/')
        ELSE video_url
    END
WHERE email = 'matheusmainardo123@gmail.com';

-- 5. GARANTIR QUE TODOS OS REGISTROS COM video_url TENHAM videos POPULADO
UPDATE acompanhantes 
SET videos = ARRAY[video_url]
WHERE video_url IS NOT NULL 
  AND (videos IS NULL OR array_length(videos, 1) IS NULL);

-- 6. LIMPAR CAMPOS videos VAZIOS OU NULOS
UPDATE acompanhantes 
SET videos = '{}'
WHERE videos IS NULL;

-- 7. VERIFICAR RESULTADOS APÓS CORREÇÃO
SELECT 'Verificando resultados após correção...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    array_length(videos, 1) as videos_count,
    CASE 
        WHEN video_url LIKE '%/videos/%' THEN '✅ URL CORRETA'
        WHEN video_url LIKE '%/images/%' THEN '❌ URL INCORRETA'
        WHEN video_url IS NULL THEN '⚪ SEM VÍDEO'
        ELSE '⚠️ URL DESCONHECIDA'
    END as status_url
FROM acompanhantes 
WHERE video_url IS NOT NULL OR array_length(videos, 1) > 0
ORDER BY created_at DESC;

-- 8. ESTATÍSTICAS FINAIS
SELECT 'Estatísticas finais...' as status;
SELECT 
    COUNT(*) as total_registros,
    COUNT(video_url) as com_video_url,
    COUNT(CASE WHEN array_length(videos, 1) > 0 THEN 1 END) as com_videos_array,
    COUNT(CASE WHEN video_url LIKE '%/videos/%' THEN 1 END) as urls_corretas,
    COUNT(CASE WHEN video_url LIKE '%/images/%' THEN 1 END) as urls_incorretas
FROM acompanhantes; 