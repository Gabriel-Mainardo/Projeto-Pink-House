-- SQL para configurar aprovação de stories criados
-- Execute este código no painel SQL do Supabase

-- 1. Criar tabela de stories criados
CREATE TABLE IF NOT EXISTS created_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    companion_id VARCHAR NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'text')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Referência à tabela de acompanhantes (se existir)
    CONSTRAINT fk_companion FOREIGN KEY (companion_id) REFERENCES acompanhantes(id) ON DELETE CASCADE
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_created_stories_companion_id ON created_stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_created_stories_status ON created_stories(status);
CREATE INDEX IF NOT EXISTS idx_created_stories_created_at ON created_stories(created_at DESC);

-- 3. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_created_stories_updated_at
    BEFORE UPDATE ON created_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security (RLS)
ALTER TABLE created_stories ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança

-- Permitir inserção para usuários anônimos (acompanhantes criando stories)
CREATE POLICY "Allow anonymous insert stories" ON created_stories
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Permitir que usuários autenticados vejam todos os stories (admin)
CREATE POLICY "Allow authenticated users to view all stories" ON created_stories
    FOR SELECT
    TO authenticated
    USING (true);

-- Permitir que usuários autenticados atualizem stories (admin)
CREATE POLICY "Allow authenticated users to update stories" ON created_stories
    FOR UPDATE
    TO authenticated
    USING (true);

-- Permitir que usuários autenticados deletem stories (admin)
CREATE POLICY "Allow authenticated users to delete stories" ON created_stories
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. Comentários para documentação
COMMENT ON TABLE created_stories IS 'Tabela para armazenar stories criados pelas acompanhantes que precisam de aprovação';
COMMENT ON COLUMN created_stories.companion_id IS 'ID da acompanhante que criou o story';
COMMENT ON COLUMN created_stories.type IS 'Tipo do story: photo, video, audio ou text';
COMMENT ON COLUMN created_stories.url IS 'URL do arquivo do story no Supabase Storage';
COMMENT ON COLUMN created_stories.thumbnail IS 'URL da thumbnail para vídeos (opcional)';
COMMENT ON COLUMN created_stories.status IS 'Status do story: pending (padrão), approved ou rejected';
COMMENT ON COLUMN created_stories.rejection_reason IS 'Motivo da rejeição se o story foi rejeitado';

-- 7. Inserir alguns dados de exemplo (opcional para teste)
-- Descomente as linhas abaixo se quiser dados de exemplo

/*
INSERT INTO created_stories (companion_id, type, url, status) VALUES
('comp-1', 'photo', 'https://example.com/story1.jpg', 'pending'),
('comp-2', 'video', 'https://example.com/story2.mp4', 'pending'),
('comp-3', 'audio', 'https://example.com/story3.mp3', 'approved'),
('comp-1', 'text', 'https://example.com/story4.png', 'rejected');
*/

-- 8. Verificar se tudo foi criado corretamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
ORDER BY ordinal_position; 