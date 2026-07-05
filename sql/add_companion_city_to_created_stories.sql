-- Adiciona o campo de cidade informada no momento da criação do story
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS companion_city TEXT;

-- Comentário explicativo
COMMENT ON COLUMN created_stories.companion_city IS 'Cidade informada pela acompanhante ao criar o story. Usada para segmentação local.'; 