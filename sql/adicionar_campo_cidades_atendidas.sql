-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'acompanhantes'
        AND column_name = 'cities_served'
    ) THEN
        -- Adicionar a coluna cities_served como um array de strings
        ALTER TABLE acompanhantes
        ADD COLUMN cities_served TEXT[] DEFAULT '{}';

        -- Comentário explicativo na coluna
        COMMENT ON COLUMN acompanhantes.cities_served IS 'Lista de cidades onde a acompanhante atende além da cidade principal';
    END IF;
END $$;

-- Atualizar registros existentes para usar a cidade principal como primeira cidade atendida
UPDATE acompanhantes
SET cities_served = ARRAY[location]
WHERE cities_served IS NULL OR cities_served = '{}';

-- Criar ou atualizar a política de segurança para a coluna cities_served
DROP POLICY IF EXISTS "Permitir leitura pública de cities_served" ON acompanhantes;
CREATE POLICY "Permitir leitura pública de cities_served"
ON acompanhantes
FOR SELECT
TO public
USING (true);

-- Permitir atualização apenas pelo próprio usuário
DROP POLICY IF EXISTS "Permitir atualização de cities_served pelo próprio usuário" ON acompanhantes;
CREATE POLICY "Permitir atualização de cities_served pelo próprio usuário"
ON acompanhantes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verificar se as políticas foram criadas corretamente
SELECT *
FROM pg_policies
WHERE tablename = 'acompanhantes'
AND (policyname LIKE '%cities_served%' OR policyname LIKE '%cidade%');

-- Exemplo de consulta para testar
SELECT id, name, location, cities_served
FROM acompanhantes
LIMIT 5; 