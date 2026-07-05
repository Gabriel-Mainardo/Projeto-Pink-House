-- =========================================
-- SETUP COMPLETO DO BACKEND - FAIXA ROSA
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- Tempo estimado: 2-3 minutos
--
-- ATENÇÃO: Este script cria toda a estrutura do banco de dados.
-- Certifique-se de estar no projeto correto antes de executar!
--
-- Autor: Claude
-- Data: 2025-01-04
-- =========================================

BEGIN;

-- =========================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para geolocalização

-- =========================================
-- 2. TIPOS ENUM
-- =========================================
CREATE TYPE user_type AS ENUM ('client', 'companion');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'blocked');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'location');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE transaction_type AS ENUM ('subscription', 'boost', 'story', 'credits', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_provider AS ENUM ('stripe', 'mercadopago', 'pix', 'boleto');
CREATE TYPE story_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE report_type AS ENUM ('fake_profile', 'inappropriate_content', 'scam', 'harassment', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
CREATE TYPE notification_type AS ENUM ('message', 'like', 'review', 'subscription', 'boost', 'story', 'system', 'payment');

-- =========================================
-- 3. TABELA DE PERFIS DE USUÁRIOS
-- =========================================
-- Estende a tabela auth.users do Supabase
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type user_type NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMP,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_user_profiles_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = true;

-- =========================================
-- 4. TABELA DE CLIENTES
-- =========================================
CREATE TABLE clients (
  id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  cpf TEXT UNIQUE,
  birth_date DATE,
  preferences JSONB DEFAULT '{}',
  blocked_companions UUID[] DEFAULT '{}',
  favorite_companions UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_clients_favorites ON clients USING GIN(favorite_companions);

-- =========================================
-- 5. ATUALIZAR TABELA DE ACOMPANHANTES
-- =========================================
-- Adicionar campos necessários que faltam na tabela atual
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0;
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS whatsapp_clicks_count INTEGER DEFAULT 0;
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS video_thumbnails TEXT[];
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE acompanhantes ADD COLUMN IF NOT EXISTS verification_documents TEXT[];

CREATE INDEX idx_acompanhantes_user_id ON acompanhantes(user_id);
CREATE INDEX idx_acompanhantes_location ON acompanhantes(latitude, longitude);
CREATE INDEX idx_acompanhantes_premium ON acompanhantes(is_premium) WHERE is_premium = true;
CREATE INDEX idx_acompanhantes_featured ON acompanhantes(is_featured) WHERE is_featured = true;

-- =========================================
-- 6. CONVERSAS
-- =========================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID REFERENCES acompanhantes(id) ON DELETE CASCADE NOT NULL,
  status conversation_status DEFAULT 'active',
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(client_id, companion_id)
);

CREATE INDEX idx_conversations_client ON conversations(client_id);
CREATE INDEX idx_conversations_companion ON conversations(companion_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- =========================================
-- 7. MENSAGENS
-- =========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  message_type message_type DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  media_thumbnail TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(is_read) WHERE is_read = false;

-- =========================================
-- 8. CONTADOR DE MENSAGENS NÃO LIDAS
-- =========================================
CREATE TABLE unread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, conversation_id)
);

CREATE INDEX idx_unread_messages_user ON unread_messages(user_id);

-- =========================================
-- 9. PLANOS DE ASSINATURA
-- =========================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  max_photos INTEGER DEFAULT 10,
  max_videos INTEGER DEFAULT 3,
  can_post_stories BOOLEAN DEFAULT true,
  highlight_in_search BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, display_order);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, slug, description, price, duration_days, features, max_photos, max_videos, highlight_in_search, priority_support, display_order) VALUES
('Básico', 'basico', 'Plano ideal para começar', 99.00, 30, '["Perfil ativo", "Até 10 fotos", "Até 3 vídeos", "Stories ilimitados"]', 10, 3, false, false, 1),
('Premium', 'premium', 'Mais recursos e destaque', 199.00, 30, '["Tudo do Básico", "Até 30 fotos", "Até 10 vídeos", "Destaque na busca", "Badge Premium"]', 30, 10, true, false, 2),
('VIP', 'vip', 'Máxima visibilidade', 299.00, 30, '["Tudo do Premium", "Fotos ilimitadas", "Vídeos ilimitados", "Prioridade máxima", "Suporte prioritário"]', 999, 999, true, true, 3);

-- =========================================
-- 10. ASSINATURAS
-- =========================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES acompanhantes(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status subscription_status DEFAULT 'active',
  started_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_subscriptions_companion ON subscriptions(companion_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);

-- =========================================
-- 11. TRANSAÇÕES
-- =========================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_provider payment_provider,
  payment_id TEXT,
  status transaction_status DEFAULT 'pending',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);

-- =========================================
-- 12. CARTEIRAS
-- =========================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- =========================================
-- 13. TIPOS DE BOOST
-- =========================================
CREATE TABLE boost_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  position_weight INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Inserir tipos de boost padrão
INSERT INTO boost_types (name, description, duration_hours, price, position_weight, display_order) VALUES
('1 Hora', 'Destaque rápido', 1, 19.90, 1, 1),
('3 Horas', 'Destaque prolongado', 3, 49.90, 2, 2),
('6 Horas', 'Meio dia em destaque', 6, 89.90, 3, 3),
('12 Horas', 'Destaque o dia todo', 12, 149.90, 4, 4),
('24 Horas', 'Máxima exposição', 24, 249.90, 5, 5);

-- =========================================
-- 14. BOOSTS ATIVOS
-- =========================================
CREATE TABLE active_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES acompanhantes(id) ON DELETE CASCADE NOT NULL,
  boost_type_id UUID REFERENCES boost_types(id) NOT NULL,
  started_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_active_boosts_companion ON active_boosts(companion_id);
CREATE INDEX idx_active_boosts_expires ON active_boosts(expires_at);
CREATE INDEX idx_active_boosts_active ON active_boosts(is_active) WHERE is_active = true;

-- =========================================
-- 15. ATUALIZAR TABELA DE STORIES
-- =========================================
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP DEFAULT (now() + interval '24 hours');
ALTER TABLE created_stories ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT false;

CREATE INDEX idx_stories_companion ON created_stories(companion_id);
CREATE INDEX idx_stories_status ON created_stories(status);
CREATE INDEX idx_stories_expires ON created_stories(expires_at);
CREATE INDEX idx_stories_active ON created_stories(status, is_expired) WHERE status = 'approved' AND is_expired = false;

-- =========================================
-- 16. VISUALIZAÇÕES DE STORIES
-- =========================================
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES created_stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_story_views_viewer ON story_views(viewer_id);

-- =========================================
-- 17. CURTIDAS EM STORIES
-- =========================================
CREATE TABLE story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES created_stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(story_id, user_id)
);

CREATE INDEX idx_story_likes_story ON story_likes(story_id);
CREATE INDEX idx_story_likes_user ON story_likes(user_id);

-- =========================================
-- 18. AVALIAÇÕES
-- =========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES acompanhantes(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_reviews_companion ON reviews(companion_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =========================================
-- 19. DENÚNCIAS
-- =========================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  report_type report_type NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);

-- =========================================
-- 20. NOTIFICAÇÕES
-- =========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- =========================================
-- 21. CONFIGURAÇÕES DE NOTIFICAÇÃO
-- =========================================
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  message_notifications BOOLEAN DEFAULT true,
  review_notifications BOOLEAN DEFAULT true,
  subscription_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- 22. VISUALIZAÇÕES DE PERFIL
-- =========================================
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES acompanhantes(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  source TEXT, -- 'search', 'direct', 'story', 'boost'
  viewed_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_profile_views_companion ON profile_views(companion_id, viewed_at DESC);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_date ON profile_views(viewed_at DESC);

-- =========================================
-- 23. CLIQUES NO WHATSAPP
-- =========================================
CREATE TABLE whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES acompanhantes(id) ON DELETE CASCADE NOT NULL,
  clicker_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  source TEXT,
  clicked_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_whatsapp_clicks_companion ON whatsapp_clicks(companion_id);

-- =========================================
-- 24. TOKENS DE PUSH NOTIFICATION
-- =========================================
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT, -- 'ios', 'android', 'web'
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  last_used_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;

-- =========================================
-- 25. LOGS DE ATIVIDADE (AUDITORIA)
-- =========================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =========================================
-- 26. FUNÇÕES AUXILIARES
-- =========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em todas as tabelas relevantes
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar contador de visualizações
CREATE OR REPLACE FUNCTION increment_profile_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE acompanhantes
    SET profile_views_count = profile_views_count + 1
    WHERE id = NEW.companion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_profile_views
AFTER INSERT ON profile_views
FOR EACH ROW EXECUTE FUNCTION increment_profile_views();

-- Função para incrementar contador de cliques no WhatsApp
CREATE OR REPLACE FUNCTION increment_whatsapp_clicks()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE acompanhantes
    SET whatsapp_clicks_count = whatsapp_clicks_count + 1
    WHERE id = NEW.companion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_whatsapp_clicks
AFTER INSERT ON whatsapp_clicks
FOR EACH ROW EXECUTE FUNCTION increment_whatsapp_clicks();

-- Função para atualizar contador de visualizações de story
CREATE OR REPLACE FUNCTION update_story_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE created_stories
    SET views_count = (SELECT COUNT(*) FROM story_views WHERE story_id = NEW.story_id)
    WHERE id = NEW.story_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_story_views_count
AFTER INSERT ON story_views
FOR EACH ROW EXECUTE FUNCTION update_story_views_count();

-- Função para atualizar contador de curtidas de story
CREATE OR REPLACE FUNCTION update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE created_stories
    SET likes_count = (SELECT COUNT(*) FROM story_likes WHERE story_id = NEW.story_id)
    WHERE id = NEW.story_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_story_likes_count
AFTER INSERT OR DELETE ON story_likes
FOR EACH ROW EXECUTE FUNCTION update_story_likes_count();

-- Função para atualizar rating médio da acompanhante
CREATE OR REPLACE FUNCTION update_companion_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE acompanhantes
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE companion_id = NEW.companion_id
        AND is_approved = true
    )
    WHERE id = NEW.companion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_companion_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_companion_rating();

-- Função para atualizar última mensagem na conversa
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        last_message = NEW.content,
        last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Função para criar carteira automaticamente quando criar usuário
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
AFTER INSERT ON user_profiles
FOR EACH ROW EXECUTE FUNCTION create_wallet_for_user();

-- Função para criar configurações de notificação automaticamente
CREATE OR REPLACE FUNCTION create_notification_settings_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_settings (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_notification_settings
AFTER INSERT ON user_profiles
FOR EACH ROW EXECUTE FUNCTION create_notification_settings_for_user();

-- =========================================
-- 27. ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE unread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Todos podem ver perfis ativos" ON user_profiles FOR SELECT USING (is_active = true);

-- Políticas para clients
CREATE POLICY "Clientes podem ver seus próprios dados" ON clients FOR ALL USING (auth.uid() = id);

-- Políticas para conversations
CREATE POLICY "Usuários veem suas conversas" ON conversations FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM user_profiles WHERE id = client_id OR id IN (SELECT user_id FROM acompanhantes WHERE id = companion_id)
    )
);
CREATE POLICY "Clientes podem criar conversas" ON conversations FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM clients WHERE id = client_id)
);

-- Políticas para messages
CREATE POLICY "Participantes veem mensagens" ON messages FOR SELECT USING (
    conversation_id IN (
        SELECT id FROM conversations WHERE
        client_id = (SELECT id FROM clients WHERE id = auth.uid())
        OR companion_id IN (SELECT id FROM acompanhantes WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Participantes podem enviar mensagens" ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
);

-- Políticas para wallets
CREATE POLICY "Usuários veem sua carteira" ON wallets FOR SELECT USING (user_id = auth.uid());

-- Políticas para notifications
CREATE POLICY "Usuários veem suas notificações" ON notifications FOR ALL USING (user_id = auth.uid());

-- Políticas para notification_settings
CREATE POLICY "Usuários veem suas configurações" ON notification_settings FOR ALL USING (user_id = auth.uid());

-- Políticas para stories (públicos)
CREATE POLICY "Todos podem ver stories aprovados" ON created_stories FOR SELECT USING (status = 'approved' AND is_expired = false);

-- Políticas para reviews aprovados (todos podem ver)
CREATE POLICY "Todos podem ver reviews aprovados" ON reviews FOR SELECT USING (is_approved = true);

-- Políticas para acompanhantes (todos podem ver perfis ativos)
CREATE POLICY "Todos podem ver acompanhantes ativas" ON acompanhantes FOR SELECT USING (is_available = true);

-- =========================================
-- 28. VIEWS ÚTEIS
-- =========================================

-- View de estatísticas de acompanhantes
CREATE OR REPLACE VIEW companion_stats AS
SELECT
    a.id,
    a.name,
    a.profile_views_count,
    a.whatsapp_clicks_count,
    a.rating,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT cs.id) as total_stories,
    COALESCE(SUM(cs.views_count), 0) as total_story_views,
    COALESCE(ab.expires_at, NULL) as boost_expires_at,
    CASE WHEN ab.is_active THEN true ELSE false END as has_active_boost,
    s.expires_at as subscription_expires_at,
    sp.name as plan_name
FROM acompanhantes a
LEFT JOIN reviews r ON r.companion_id = a.id AND r.is_approved = true
LEFT JOIN created_stories cs ON cs.companion_id = a.id::text AND cs.status = 'approved'
LEFT JOIN active_boosts ab ON ab.companion_id = a.id AND ab.is_active = true
LEFT JOIN subscriptions s ON s.companion_id = a.id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
GROUP BY a.id, ab.expires_at, ab.is_active, s.expires_at, sp.name;

-- View de conversas com informações
CREATE OR REPLACE VIEW conversations_detailed AS
SELECT
    c.id,
    c.client_id,
    c.companion_id,
    c.status,
    c.last_message,
    c.last_message_at,
    cl.full_name as client_name,
    a.name as companion_name,
    COALESCE(unread.count, 0) as unread_count
FROM conversations c
LEFT JOIN user_profiles cl ON cl.id = c.client_id
LEFT JOIN acompanhantes a ON a.id = c.companion_id
LEFT JOIN unread_messages unread ON unread.conversation_id = c.id
ORDER BY c.last_message_at DESC NULLS LAST;

COMMIT;

-- =========================================
-- FIM DO SCRIPT
-- =========================================
--
-- PRÓXIMOS PASSOS:
--
-- 1. STORAGE (Supabase Dashboard):
--    - Criar buckets: avatars, gallery, videos, stories, messages, documents
--    - Configurar políticas de acesso
--
-- 2. EDGE FUNCTIONS (criar arquivos separados):
--    - send-email
--    - send-sms
--    - process-payment-webhook
--    - expire-stories (cron)
--    - expire-boosts (cron)
--    - calculate-distance
--    - moderate-content
--
-- 3. INTEGRAÇÕES EXTERNAS:
--    - Stripe/MercadoPago
--    - Twilio (SMS)
--    - SendGrid (Email)
--    - Firebase/OneSignal (Push)
--    - Google Maps API
--
-- 4. AUTENTICAÇÃO (Supabase Dashboard):
--    - Configurar providers (Google, Facebook)
--    - Configurar templates de email
--    - Configurar redirecionamentos
--
-- =========================================
