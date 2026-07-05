-- Criar tabela de anúncios para o gerenciador do admin
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Saiba Mais',
    cta_url TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_order ON advertisements(display_order);
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at ON advertisements(created_at);

-- Inserir alguns anúncios de exemplo
INSERT INTO advertisements (title, description, cta_text, cta_url, image_url, is_active, display_order) VALUES
('Clube Premium VIP', 'Acesso exclusivo a eventos privados e encontros especiais. Conecte-se com pessoas selecionadas em um ambiente sofisticado.', 'Conhecer Club', '#', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', true, 1),
('Produtos de Bem-Estar', 'Linha premium de produtos para cuidados pessoais e bem-estar. Qualidade e discrição garantidas.', 'Ver Produtos', '#', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=400&q=80', true, 2),
('Serviços Exclusivos', 'Consultoria personalizada e serviços premium. Atendimento diferenciado para clientes especiais.', 'Contratar', '#', 'https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=400&q=80', true, 3);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE advertisements 
    SET view_count = view_count + 1 
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar cliques
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE advertisements 
    SET click_count = click_count + 1 
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS (Row Level Security)
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (anúncios ativos)
CREATE POLICY "Anúncios ativos são visíveis publicamente" ON advertisements
    FOR SELECT USING (is_active = true);

-- Política para admins poderem fazer tudo
CREATE POLICY "Admins podem gerenciar anúncios" ON advertisements
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM admin_users WHERE is_active = true
        )
    );

-- Comentários na tabela
COMMENT ON TABLE advertisements IS 'Tabela de anúncios gerenciados pelo admin';
COMMENT ON COLUMN advertisements.title IS 'Título do anúncio';
COMMENT ON COLUMN advertisements.description IS 'Descrição detalhada do anúncio';
COMMENT ON COLUMN advertisements.cta_text IS 'Texto do botão de call-to-action';
COMMENT ON COLUMN advertisements.cta_url IS 'URL de destino do anúncio';
COMMENT ON COLUMN advertisements.image_url IS 'URL da imagem do anúncio';
COMMENT ON COLUMN advertisements.is_active IS 'Se o anúncio está ativo e visível';
COMMENT ON COLUMN advertisements.display_order IS 'Ordem de exibição (menor número = maior prioridade)';
COMMENT ON COLUMN advertisements.click_count IS 'Contador de cliques no anúncio';
COMMENT ON COLUMN advertisements.view_count IS 'Contador de visualizações do anúncio';