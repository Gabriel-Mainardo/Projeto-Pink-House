-- Criar tabela de especialidades no Supabase
CREATE TABLE IF NOT EXISTS especialidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por nome
CREATE INDEX IF NOT EXISTS idx_especialidades_name ON especialidades(name);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_especialidades_updated_at 
    BEFORE UPDATE ON especialidades 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas especialidades padrão
INSERT INTO especialidades (name) VALUES 
    ('Massagem Relaxante'),
    ('Acompanhante Social'),
    ('Jantar Romântico'),
    ('Viagem de Negócios'),
    ('Eventos Sociais'),
    ('Terapia Alternativa'),
    ('Companhia para Cinema'),
    ('Passeios Culturais'),
    ('Acompanhante de Luxo'),
    ('Consultoria Pessoal')
ON CONFLICT (name) DO NOTHING; 