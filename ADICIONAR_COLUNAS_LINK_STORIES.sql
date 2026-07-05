-- Script para adicionar colunas de link na tabela created_stories
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas para informações do link que aparece no story
ALTER TABLE created_stories 
ADD COLUMN IF NOT EXISTS story_link_url TEXT,
ADD COLUMN IF NOT EXISTS story_link_text TEXT,
ADD COLUMN IF NOT EXISTS link_type TEXT CHECK (link_type IN ('whatsapp', 'custom'));

-- Comentários para documentação
COMMENT ON COLUMN created_stories.story_link_url IS 'URL do link que aparece no story (WhatsApp ou link personalizado)';
COMMENT ON COLUMN created_stories.story_link_text IS 'Texto do botão que aparece no story';
COMMENT ON COLUMN created_stories.link_type IS 'Tipo de link: whatsapp ou custom';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name IN ('story_link_url', 'story_link_text', 'link_type')
ORDER BY column_name; 