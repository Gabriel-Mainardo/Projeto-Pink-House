-- Script para criar a tabela created_stories completa
-- Execute este script no Supabase SQL Editor

-- 1. Criar a tabela created_stories se ela não existir
CREATE TABLE IF NOT EXISTS created_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    companion_id TEXT NOT NULL,
    requester_name TEXT,
    requester_whatsapp TEXT,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'text')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    duration INTEGER, -- duração em segundos para vídeo/áudio
    file_size INTEGER, -- tamanho do arquivo em bytes
    mime_type TEXT, -- tipo MIME do arquivo
    plan_type TEXT CHECK (plan_type IN ('basic', 'destaque', 'premium')),
    plan_name TEXT,
    plan_price DECIMAL(10,2),
    story_link_url TEXT, -- URL do link que aparece no story
    story_link_text TEXT, -- Texto do botão do link
    link_type TEXT CHECK (link_type IN ('whatsapp', 'custom')), -- Tipo de link
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_companion_id ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_created_at ON created_stories(created_at DESC);

-- 3. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_created_stories_updated_at 
    BEFORE UPDATE ON created_stories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Comentários para documentação
COMMENT ON TABLE created_stories IS 'Tabela para armazenar stories criados pelos usuários';
COMMENT ON COLUMN created_stories.companion_id IS 'ID da acompanhante (pode ser um guest ID)';
COMMENT ON COLUMN created_stories.requester_name IS 'Nome da pessoa que está criando o story';
COMMENT ON COLUMN created_stories.requester_whatsapp IS 'WhatsApp da pessoa que está criando o story';
COMMENT ON COLUMN created_stories.type IS 'Tipo do story: photo, video, audio, text';
COMMENT ON COLUMN created_stories.url IS 'URL do arquivo/imagem do story';
COMMENT ON COLUMN created_stories.thumbnail IS 'URL da thumbnail (para vídeos)';
COMMENT ON COLUMN created_stories.duration IS 'Duração em segundos (para vídeo/áudio)';
COMMENT ON COLUMN created_stories.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN created_stories.mime_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN created_stories.plan_type IS 'Tipo do plano escolhido';
COMMENT ON COLUMN created_stories.plan_name IS 'Nome do plano';
COMMENT ON COLUMN created_stories.plan_price IS 'Preço do plano';
COMMENT ON COLUMN created_stories.story_link_url IS 'URL do link que aparece no story';
COMMENT ON COLUMN created_stories.story_link_text IS 'Texto do botão do link';
COMMENT ON COLUMN created_stories.link_type IS 'Tipo de link: whatsapp ou custom';
COMMENT ON COLUMN created_stories.status IS 'Status do story: pending, approved, rejected';
COMMENT ON COLUMN created_stories.rejection_reason IS 'Motivo da rejeição (se aplicável)';

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas básicas de RLS
-- Política para permitir inserção (qualquer um pode criar stories)
CREATE POLICY "Allow insert for anyone" ON created_stories
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura (qualquer um pode ver stories aprovados)
CREATE POLICY "Allow select for approved stories" ON created_stories
    FOR SELECT USING (status = 'approved');

-- Política para admins verem todos os stories (você pode ajustar conforme necessário)
CREATE POLICY "Allow admin to see all stories" ON created_stories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@example.com' -- Substitua pelo email do admin
        )
    );

-- 7. Verificar se a tabela foi criada
SELECT 
    'Tabela created_stories criada com sucesso!' as resultado,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'created_stories';

-- 8. Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories'
ORDER BY ordinal_position; 