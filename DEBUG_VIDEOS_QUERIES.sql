-- =========================================
-- QUERIES PARA DEBUG DOS VÍDEOS
-- =========================================
-- Execute estas queries no SQL Editor do Supabase para verificar os dados

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 'Verificando estrutura da tabela acompanhantes...' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'acompanhantes' 
ORDER BY ordinal_position;

SELECT 'Verificando estrutura da tabela cadastros_pendentes...' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'cadastros_pendentes' 
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS DA ACOMPANHANTE ESPECÍFICA
SELECT 'Verificando dados da acompanhante Matheus Mainardo...' as status;
SELECT 
    id,
    name,
    email,
    image,
    gallery,
    video_url,
    videos,
    audio_url,
    is_verified,
    is_available,
    created_at
FROM acompanhantes 
WHERE email = 'matheusmainardo123@gmail.com' 
   OR name ILIKE '%matheus%mainardo%';

-- 3. VERIFICAR TODOS OS VÍDEOS NO BANCO
SELECT 'Verificando todos os registros com vídeos...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    LENGTH(video_url) as video_url_length,
    array_length(videos, 1) as videos_array_length
FROM acompanhantes 
WHERE video_url IS NOT NULL 
   OR videos IS NOT NULL 
   OR array_length(videos, 1) > 0;

-- 4. VERIFICAR CADASTROS PENDENTES COM VÍDEOS
SELECT 'Verificando cadastros pendentes com vídeos...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    LENGTH(video_url) as video_url_length,
    submitted_at
FROM cadastros_pendentes 
WHERE video_url IS NOT NULL;

-- 5. VERIFICAR URLs DE VÍDEO ESPECÍFICAS
SELECT 'Analisando URLs de vídeo...' as status;
SELECT 
    name,
    email,
    video_url,
    videos,
    CASE 
        WHEN video_url LIKE '%/images/%' THEN 'URL no bucket IMAGES (ERRO)'
        WHEN video_url LIKE '%/videos/%' THEN 'URL no bucket VIDEOS (CORRETO)'
        WHEN video_url IS NULL THEN 'SEM VÍDEO'
        ELSE 'URL DESCONHECIDA'
    END as bucket_status,
    CASE 
        WHEN video_url LIKE '%.mp4%' THEN 'MP4'
        WHEN video_url LIKE '%.webm%' THEN 'WEBM'
        WHEN video_url LIKE '%.mov%' THEN 'MOV'
        WHEN video_url IS NULL THEN 'SEM VÍDEO'
        ELSE 'FORMATO DESCONHECIDO'
    END as video_format
FROM acompanhantes 
WHERE video_url IS NOT NULL;

-- 6. CONTAR REGISTROS POR TIPO
SELECT 'Contagem de registros...' as status;
SELECT 
    COUNT(*) as total_acompanhantes,
    COUNT(video_url) as com_video_url,
    COUNT(CASE WHEN array_length(videos, 1) > 0 THEN 1 END) as com_videos_array,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verificadas,
    COUNT(CASE WHEN is_available = true THEN 1 END) as disponíveis
FROM acompanhantes;

-- 7. VERIFICAR SE EXISTE COLUNA 'videos' NA TABELA
SELECT 'Verificando se coluna videos existe...' as status;
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'acompanhantes' 
    AND column_name = 'videos'
) as coluna_videos_existe;

-- 8. QUERY PARA CORRIGIR URLs DE VÍDEO (SE NECESSÁRIO)
SELECT 'Query para corrigir URLs de vídeo...' as status;
SELECT 
    id,
    name,
    video_url as url_atual,
    REPLACE(video_url, '/storage/v1/object/public/images/', '/storage/v1/object/public/videos/') as url_corrigida,
    CASE 
        WHEN video_url LIKE '%/images/%' THEN 'PRECISA CORREÇÃO'
        ELSE 'OK'
    END as status_correcao
FROM acompanhantes 
WHERE video_url IS NOT NULL;

-- 9. VERIFICAR ÚLTIMOS CADASTROS APROVADOS
SELECT 'Verificando últimos cadastros aprovados...' as status;
SELECT 
    id,
    name,
    email,
    video_url,
    videos,
    created_at,
    updated_at
FROM acompanhantes 
ORDER BY created_at DESC 
LIMIT 5;

-- 10. VERIFICAR BUCKETS DO SUPABASE STORAGE
SELECT 'Verificando buckets de storage...' as status;
SELECT 
    name as bucket_name,
    created_at,
    updated_at,
    public
FROM storage.buckets 
ORDER BY name; 