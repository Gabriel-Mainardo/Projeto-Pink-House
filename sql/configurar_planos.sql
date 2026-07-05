-- SQL para configurar os planos no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar se a coluna 'plan' existe na tabela acompanhantes
-- Se não existir, criar a coluna
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'acompanhantes' AND column_name = 'plan'
    ) THEN
        ALTER TABLE acompanhantes
        ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'gold', 'rosa', 'black'));
    END IF;
END $$;

-- 2. Verificar se a coluna 'is_available' existe
-- Se não existir, criar a coluna
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'acompanhantes' AND column_name = 'is_available'
    ) THEN
        ALTER TABLE acompanhantes
        ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Verificar se a coluna 'plan' existe na tabela cadastros_pendentes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cadastros_pendentes' AND column_name = 'plan'
    ) THEN
        ALTER TABLE cadastros_pendentes
        ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'gold', 'rosa', 'black'));
    END IF;
END $$;

-- 4. Verificar se a coluna 'is_available' existe na tabela cadastros_pendentes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cadastros_pendentes' AND column_name = 'is_available'
    ) THEN
        ALTER TABLE cadastros_pendentes
        ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 5. Atualizar todos os cadastros existentes para plano free se estiverem NULL
UPDATE acompanhantes
SET plan = 'free'
WHERE plan IS NULL;

UPDATE acompanhantes
SET is_available = true
WHERE is_available IS NULL;

UPDATE cadastros_pendentes
SET plan = 'free'
WHERE plan IS NULL;

UPDATE cadastros_pendentes
SET is_available = true
WHERE is_available IS NULL;

-- 6. Criar índice para melhor performance nas consultas por plano
CREATE INDEX IF NOT EXISTS idx_acompanhantes_plan ON acompanhantes(plan);
CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_plan ON cadastros_pendentes(plan);

-- 7. Verificar os resultados
SELECT
    'acompanhantes' as tabela,
    plan,
    is_available,
    COUNT(*) as total
FROM acompanhantes
GROUP BY plan, is_available
ORDER BY plan;

SELECT
    'cadastros_pendentes' as tabela,
    plan,
    is_available,
    COUNT(*) as total
FROM cadastros_pendentes
GROUP BY plan, is_available
ORDER BY plan;

-- EXEMPLOS DE COMO ATUALIZAR O PLANO DE UMA ACOMPANHANTE:

-- Atualizar para plano Gold:
-- UPDATE acompanhantes SET plan = 'gold' WHERE id = 'ID_DA_ACOMPANHANTE';

-- Atualizar para plano Rosa Pro:
-- UPDATE acompanhantes SET plan = 'rosa' WHERE id = 'ID_DA_ACOMPANHANTE';

-- Atualizar para plano Black:
-- UPDATE acompanhantes SET plan = 'black' WHERE id = 'ID_DA_ACOMPANHANTE';

-- Atualizar disponibilidade:
-- UPDATE acompanhantes SET is_available = false WHERE id = 'ID_DA_ACOMPANHANTE';
