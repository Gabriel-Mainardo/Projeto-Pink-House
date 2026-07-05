-- =========================================
-- SISTEMA DE DISPONIBILIDADE COMPLETO
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- para configurar o sistema de disponibilidade

-- =========================================
-- 1. ADICIONAR COLUNA is_available SE NÃO EXISTIR
-- =========================================

-- Verificar se a coluna já existe e adicionar se necessário
DO $$
BEGIN
    -- Adicionar coluna na tabela acompanhantes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'acompanhantes'
        AND column_name = 'is_available'
    ) THEN
        ALTER TABLE acompanhantes
        ADD COLUMN is_available BOOLEAN DEFAULT true;

        RAISE NOTICE 'Coluna is_available adicionada à tabela acompanhantes';
    ELSE
        RAISE NOTICE 'Coluna is_available já existe na tabela acompanhantes';
    END IF;

    -- Adicionar coluna na tabela cadastros_pendentes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cadastros_pendentes'
        AND column_name = 'is_available'
    ) THEN
        ALTER TABLE cadastros_pendentes
        ADD COLUMN is_available BOOLEAN DEFAULT true;

        RAISE NOTICE 'Coluna is_available adicionada à tabela cadastros_pendentes';
    ELSE
        RAISE NOTICE 'Coluna is_available já existe na tabela cadastros_pendentes';
    END IF;
END $$;

-- =========================================
-- 2. ATUALIZAR TODAS AS ACOMPANHANTES EXISTENTES
-- =========================================

-- Definir todas as acompanhantes existentes como disponíveis por padrão
UPDATE acompanhantes
SET is_available = true
WHERE is_available IS NULL;

-- =========================================
-- 3. CRIAR/ATUALIZAR FUNÇÃO DE BUSCA (SEM FILTRO DE DISPONIBILIDADE)
-- =========================================

-- Dropar função antiga se existir
DROP FUNCTION IF EXISTS get_companions_with_boosts();

-- Criar função que retorna TODAS as acompanhantes (disponíveis e indisponíveis)
-- O badge de disponibilidade será mostrado no card
CREATE OR REPLACE FUNCTION get_companions_with_boosts()
RETURNS TABLE (
    id UUID,
    name TEXT,
    real_name TEXT,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    age INTEGER,
    location TEXT,
    height TEXT,
    image TEXT,
    gallery TEXT[],
    videos TEXT[],
    videothumbnails TEXT[],
    audiourl TEXT,
    rating DECIMAL,
    tags TEXT[],
    is_featured BOOLEAN,
    measurements TEXT,
    description TEXT,
    priceperhour TEXT,
    hasownlocation BOOLEAN,
    acceptsclientlocation BOOLEAN,
    acceptsmotel BOOLEAN,
    cities_served TEXT[],
    is_verified BOOLEAN,
    is_available BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    -- Campos de boost
    has_boost BOOLEAN,
    boost_priority INTEGER,
    boost_badge TEXT,
    boost_color TEXT,
    boost_expires_at TIMESTAMP,
    hours_remaining NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.real_name,
        a.display_name,
        a.email,
        a.phone,
        a.age,
        a.location,
        a.height,
        a.image,
        a.gallery,
        a.videos,
        a.videothumbnails,
        a.audiourl,
        a.rating,
        a.tags,
        a.is_featured,
        a.measurements,
        a.description,
        a.priceperhour,
        a.hasownlocation,
        a.acceptsclientlocation,
        a.acceptsmotel,
        a.cities_served,
        a.is_verified,
        COALESCE(a.is_available, true) as is_available, -- ✅ Retorna o status para mostrar no card
        COALESCE(a.is_active, true) as is_active,
        a.created_at,
        -- Campos de boost calculados
        CASE
            WHEN s.expires_at > NOW() THEN true
            ELSE false
        END as has_boost,
        CASE
            WHEN s.expires_at > NOW() THEN s.priority
            ELSE 0
        END as boost_priority,
        s.badge as boost_badge,
        s.color as boost_color,
        s.expires_at as boost_expires_at,
        CASE
            WHEN s.expires_at > NOW() THEN
                EXTRACT(EPOCH FROM (s.expires_at - NOW())) / 3600
            ELSE 0
        END as hours_remaining
    FROM acompanhantes a
    LEFT JOIN subidas s ON a.id = s.companion_id AND s.expires_at > NOW()
    WHERE
        COALESCE(a.is_active, true) = true
        -- ✅ SEM FILTRO DE DISPONIBILIDADE - Todos os cards aparecem!
        -- O badge "Disponível/Indisponível" será mostrado no card
    ORDER BY
        -- Primeiro: Subidas ativas (ordenadas por prioridade decrescente)
        CASE WHEN s.expires_at > NOW() THEN s.priority ELSE 0 END DESC,
        -- Segundo: Data de criação mais recente
        a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 4. CRIAR FUNÇÃO PARA ATUALIZAR DISPONIBILIDADE
-- =========================================

-- Função para atualizar o status de disponibilidade de uma acompanhante
CREATE OR REPLACE FUNCTION update_availability(
    p_companion_id UUID,
    p_is_available BOOLEAN
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Atualizar o status de disponibilidade
    UPDATE acompanhantes
    SET
        is_available = p_is_available,
        updated_at = NOW()
    WHERE id = p_companion_id;

    -- Verificar se a atualização foi bem-sucedida
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Acompanhante não encontrada: %', p_companion_id;
    END IF;

    -- Retornar confirmação
    SELECT json_build_object(
        'success', true,
        'companion_id', p_companion_id,
        'is_available', p_is_available,
        'updated_at', NOW()
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- =========================================

-- Permitir que acompanhantes atualizem sua própria disponibilidade

-- Habilitar RLS na tabela se ainda não estiver habilitado
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam TODAS as acompanhantes (disponíveis ou não)
DROP POLICY IF EXISTS "Todos podem ver todas as acompanhantes" ON acompanhantes;
CREATE POLICY "Todos podem ver todas as acompanhantes"
ON acompanhantes
FOR SELECT
USING (true); -- ✅ Todos podem ver todas

-- Política para permitir que acompanhantes atualizem seu próprio perfil
DROP POLICY IF EXISTS "Acompanhantes podem atualizar próprio perfil" ON acompanhantes;
CREATE POLICY "Acompanhantes podem atualizar próprio perfil"
ON acompanhantes
FOR UPDATE
USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

-- =========================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =========================================

-- Criar índice na coluna is_available para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_acompanhantes_is_available
ON acompanhantes(is_available);

-- Índice composto para queries que filtram por ativo
CREATE INDEX IF NOT EXISTS idx_acompanhantes_active_available
ON acompanhantes(is_active, is_available)
WHERE is_active = true;

-- =========================================
-- 7. VERIFICAÇÃO FINAL
-- =========================================

-- Verificar a estrutura da tabela
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'acompanhantes'
AND column_name IN ('is_available', 'is_active')
ORDER BY ordinal_position;

-- Contar quantas acompanhantes estão disponíveis
SELECT
    COUNT(*) FILTER (WHERE is_available = true) as disponiveis,
    COUNT(*) FILTER (WHERE is_available = false) as indisponiveis,
    COUNT(*) as total
FROM acompanhantes;

-- Testar a função de busca - Deve retornar TODAS as acompanhantes
SELECT
    name,
    location,
    is_available,
    has_boost,
    boost_priority
FROM get_companions_with_boosts()
LIMIT 10;

-- =========================================
-- CONCLUÍDO!
-- =========================================
SELECT '✅ Sistema de disponibilidade configurado com sucesso!' as status;
SELECT '✅ Todos os cards aparecem com badge Verde (Disponível) ou Vermelho (Indisponível)' as observacao;
