-- Script para verificar e criar a tabela created_stories se não existir

-- Verificar se a tabela existe
DO $$
BEGIN
    -- Verificar se a tabela created_stories existe
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'created_stories'
    ) THEN
        -- Criar a tabela se não existir
        CREATE TABLE public.created_stories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            companion_id UUID,
            content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('photo', 'video', 'audio', 'text')),
            content_url TEXT,
            text_content TEXT,
            plan_id VARCHAR(50) NOT NULL,
            plan_name VARCHAR(100) NOT NULL,
            plan_price DECIMAL(10,2) NOT NULL,
            plan_duration_hours INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP WITH TIME ZONE,
            requester_name VARCHAR(255),
            requester_whatsapp VARCHAR(20)
        );

        -- Criar índices para melhor performance
        CREATE INDEX idx_created_stories_companion_id ON public.created_stories(companion_id);
        CREATE INDEX idx_created_stories_status ON public.created_stories(status);
        CREATE INDEX idx_created_stories_created_at ON public.created_stories(created_at);
        
        -- Configurar RLS (Row Level Security)
        ALTER TABLE public.created_stories ENABLE ROW LEVEL SECURITY;
        
        -- Política para permitir SELECT, INSERT, UPDATE para usuários autenticados
        CREATE POLICY "Permitir operações para usuários autenticados" ON public.created_stories
            FOR ALL USING (true);
        
        RAISE NOTICE 'Tabela created_stories criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela created_stories já existe.';
        
        -- Verificar se as colunas requester_name e requester_whatsapp existem
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'created_stories' 
            AND column_name = 'requester_name'
        ) THEN
            ALTER TABLE public.created_stories 
            ADD COLUMN requester_name VARCHAR(255);
            RAISE NOTICE 'Coluna requester_name adicionada.';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'created_stories' 
            AND column_name = 'requester_whatsapp'
        ) THEN
            ALTER TABLE public.created_stories 
            ADD COLUMN requester_whatsapp VARCHAR(20);
            RAISE NOTICE 'Coluna requester_whatsapp adicionada.';
        END IF;
    END IF;
END
$$;

-- Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'created_stories' 
ORDER BY ordinal_position;

-- Contar registros existentes
SELECT COUNT(*) as total_stories FROM public.created_stories;

-- Mostrar alguns registros de exemplo (se houver)
SELECT 
    id,
    content_type,
    plan_name,
    plan_price,
    status,
    requester_name,
    requester_whatsapp,
    created_at
FROM public.created_stories 
ORDER BY created_at DESC 
LIMIT 5; 