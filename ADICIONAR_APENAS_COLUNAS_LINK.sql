-- Script para adicionar apenas as colunas de link que estão faltando
-- Execute este script no Supabase SQL Editor

-- Adicionar as três colunas de link
ALTER TABLE created_stories 
ADD COLUMN story_link_url TEXT,
ADD COLUMN story_link_text TEXT,
ADD COLUMN link_type TEXT CHECK (link_type IN ('whatsapp', 'custom'));

-- Adicionar comentários
COMMENT ON COLUMN created_stories.story_link_url IS 'URL do link que aparece no story (WhatsApp ou link personalizado)';
COMMENT ON COLUMN created_stories.story_link_text IS 'Texto do botão que aparece no story';
COMMENT ON COLUMN created_stories.link_type IS 'Tipo de link: whatsapp ou custom';

-- Verificar se as colunas foram adicionadas
SELECT 
    'Colunas de link adicionadas com sucesso!' as resultado,
    COUNT(*) as total_colunas_link
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name IN ('story_link_url', 'story_link_text', 'link_type');

-- Mostrar as novas colunas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
AND column_name IN ('story_link_url', 'story_link_text', 'link_type')
ORDER BY column_name; 