-- SQL para adicionar colunas de áudio e vídeo na tabela cadastros_pendentes
-- Execute no SQL Editor do Supabase se quiser habilitar essas funcionalidades

-- Adicionar coluna para URL do áudio (10 segundos)
ALTER TABLE cadastros_pendentes 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Adicionar coluna para URLs de vídeos
ALTER TABLE cadastros_pendentes 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Adicionar coluna para URL de vídeo único (compatibilidade)
ALTER TABLE cadastros_pendentes 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Comentário das colunas
COMMENT ON COLUMN cadastros_pendentes.audio_url IS 'URL do áudio de apresentação (máximo 15 segundos)';
COMMENT ON COLUMN cadastros_pendentes.videos IS 'Array de URLs de vídeos da galeria';
COMMENT ON COLUMN cadastros_pendentes.video_url IS 'URL do vídeo principal de apresentação';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cadastros_pendentes' 
  AND column_name IN ('audio_url', 'videos', 'video_url')
ORDER BY column_name; 