-- ============================================
-- CRON JOB: Desativar boosts expirados automaticamente
-- ============================================
-- Usa a extensão pg_cron disponível no Supabase
-- 
-- ANTES DE EXECUTAR: Habilite a extensão pg_cron no Supabase:
-- 1. Vá em Database → Extensions
-- 2. Busque por "pg_cron"
-- 3. Clique em "Enable"
-- ============================================

-- Passo 1: Habilitar a extensão (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Passo 2: Dar permissão para o schema
GRANT USAGE ON SCHEMA cron TO postgres;

-- Passo 3: Remover job antigo se existir
SELECT cron.unschedule('deactivate-expired-boosts')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'deactivate-expired-boosts'
);

-- Passo 4: Agendar execução a cada hora (minuto 0 de cada hora)
-- Formato: minuto hora dia mês dia_da_semana
-- '0 * * * *' = a cada hora, no minuto 0
SELECT cron.schedule(
  'deactivate-expired-boosts',    -- Nome do job
  '0 * * * *',                     -- A cada hora
  $$SELECT deactivate_expired_boosts()$$  -- Função a executar
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver todos os jobs agendados
SELECT jobid, jobname, schedule, active
FROM cron.job;

-- Ver histórico de execuções recentes
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
