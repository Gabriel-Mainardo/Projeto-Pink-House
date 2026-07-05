-- Adiciona coluna para armazenar o valor do serviço no pagamento seguro
ALTER TABLE conversation_security_steps
ADD COLUMN IF NOT EXISTS service_value NUMERIC(10,2) DEFAULT 0;
