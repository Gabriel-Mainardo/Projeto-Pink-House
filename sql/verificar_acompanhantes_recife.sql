-- Verificar todas as acompanhantes e suas localizações
SELECT
  id,
  name,
  location,
  cities_served,
  gender,
  approved
FROM acompanhantes
ORDER BY id DESC
LIMIT 20;

-- Contar total de acompanhantes
SELECT COUNT(*) as total_acompanhantes FROM acompanhantes;

-- Contar acompanhantes aprovadas
SELECT COUNT(*) as total_aprovadas FROM acompanhantes WHERE approved = true;

-- Verificar localizações únicas
SELECT DISTINCT location FROM acompanhantes WHERE location IS NOT NULL;

-- Verificar cidades atendidas
SELECT DISTINCT unnest(cities_served) as cidade FROM acompanhantes WHERE cities_served IS NOT NULL;
