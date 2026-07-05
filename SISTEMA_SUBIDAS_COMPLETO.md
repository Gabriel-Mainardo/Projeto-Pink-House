# 🚀 Sistema de Subidas (Boost) - Documentação Completa

## ✅ O que foi implementado

Sistema completo de **Subidas** para acompanhantes colocarem seus cards no topo da listagem e ganharem mais visualizações.

---

## 📋 Estrutura do Banco de Dados

### 1. Tabela `boost_plans` - Planos de Subida
Armazena os planos disponíveis para compra:

```sql
- id (UUID)
- name (VARCHAR) - Nome do plano
- description (TEXT) - Descrição
- duration_hours (INTEGER) - Duração em horas
- price (DECIMAL) - Preço em reais
- highlight_color (VARCHAR) - Cor do badge (#FF007F)
- badge_text (VARCHAR) - Texto do badge ("EM DESTAQUE")
- position_priority (INTEGER) - Prioridade (quanto maior, mais no topo)
- is_active (BOOLEAN)
```

**Planos criados por padrão:**
- ⚡ **Turbo 1h** - R$ 4,90 - 1 hora no topo
- 📍 **Subida 24h** - R$ 19,90 - 24 horas no topo
- 💎 **Subida 3 Dias** - R$ 49,90 - 72 horas (MAIS VENDIDO)
- 👑 **Subida 7 Dias** - R$ 89,90 - 168 horas (VIP)

### 2. Tabela `active_boosts` - Subidas Ativas
Registra todas as subidas compradas:

```sql
- id (UUID)
- companion_id (UUID FK) - ID da acompanhante
- plan_id (UUID FK) - ID do plano
- payment_id (VARCHAR) - ID do pagamento (Mercado Pago)
- payment_status (VARCHAR) - pending, approved, rejected
- payment_method (VARCHAR) - pix, credit_card, rositas
- amount_paid (DECIMAL) - Valor pago
- started_at (TIMESTAMPTZ) - Início da subida
- expires_at (TIMESTAMPTZ) - Fim da subida
- is_active (BOOLEAN) - Se está ativa
```

**Regra importante:** Uma acompanhante só pode ter **UMA subida ativa por vez**.

### 3. Tabela `boost_history` - Histórico
Armazena histórico de todas as subidas (para relatórios):

```sql
- id (UUID)
- companion_id (UUID FK)
- plan_id (UUID FK)
- boost_id (UUID FK)
- payment_id (VARCHAR)
- amount_paid (DECIMAL)
- started_at (TIMESTAMPTZ)
- ended_at (TIMESTAMPTZ)
- views_during_boost (INTEGER)
- clicks_during_boost (INTEGER)
```

---

## 🔧 Functions SQL Criadas

### 1. `create_boost()` - Criar Nova Subida
Cria uma nova subida após pagamento aprovado.

```sql
SELECT create_boost(
  p_companion_id := '123e4567-e89b-12d3-a456-426614174000',
  p_plan_id := '123e4567-e89b-12d3-a456-426614174001',
  p_payment_id := 'MP_123456',
  p_payment_status := 'approved',
  p_payment_method := 'pix'
);
```

**O que faz:**
- Desativa qualquer subida anterior da acompanhante
- Cria nova subida com data de expiração calculada
- Retorna ID da subida criada

### 2. `deactivate_expired_boosts()` - Desativar Expiradas
Desativa automaticamente subidas que expiraram.

```sql
SELECT deactivate_expired_boosts();
```

**Execute periodicamente** (ex: a cada hora via cron job).

### 3. `get_companions_with_boosts()` - Buscar com Ordenação
Retorna todas as acompanhantes **ordenadas por boost**.

```sql
SELECT * FROM get_companions_with_boosts();
```

**Ordenação:**
1. ✅ Primeiro: Acompanhantes COM boost ativo
2. 🏆 Segundo: Ordenadas por prioridade do plano (VIP > Premium > Básico)
3. 📅 Terceiro: Mais recentes

---

## 📱 Páginas e Componentes

### 1. `/subidas` - Página de Compra de Subidas
**Arquivo:** `src/pages/Subidas.tsx`

**O que faz:**
- ✅ Busca planos do banco de dados
- ✅ Verifica se acompanhante já tem boost ativo
- ✅ Mostra aviso se já tiver boost ativo
- ✅ Permite comprar novo plano (se não tiver ativo)
- ✅ Valida saldo de Rositas
- ✅ Cria registro no banco após "pagamento"
- ⏳ **Preparado para integração com Mercado Pago**

**Navegação:**
- Dashboard → "Comprar Subida" → `/subidas`
- Dashboard → "Minhas Subidas" → `/subidas`

### 2. CompanionCard - Badge Visual
**Arquivo:** `src/components/CompanionCard.tsx`

**Novas props adicionadas:**
```typescript
hasBoost?: boolean        // Se tem boost ativo
boostBadge?: string       // Texto do badge ("EM DESTAQUE", "VIP", etc)
boostColor?: string       // Cor do badge ("#FF007F")
```

**Badge visual:**
- 🎨 Badge colorido com ícone de raio
- ✨ Animação pulse para chamar atenção
- 📍 Posicionado no topo esquerdo do card
- 🎯 Se for ambassador, badge aparece abaixo da coroa

### 3. ProfileDashboard - Botão Comprar Subida
**Arquivo:** `src/components/ProfileDashboard.tsx`

**Botão adicionado:**
- ⚡ "Comprar Subida"
- Ícone: Zap (raio amarelo)
- Navega para `/subidas`

---

## 🔄 Fluxo Completo

### Comprar uma Subida

1. **Acompanhante** clica em "Comprar Subida" no dashboard
2. **Sistema** redireciona para `/subidas`
3. **Página** carrega planos do banco (`boost_plans`)
4. **Página** verifica se já tem boost ativo
5. **Se já tiver boost ativo:**
   - Mostra aviso com tempo restante
   - Não permite comprar outro
6. **Se NÃO tiver boost ativo:**
   - Mostra planos disponíveis
   - Permite selecionar um plano
7. **Acompanhante** clica em "Subir"
8. **Sistema** valida saldo de Rositas
9. **Sistema** executa `create_boost()` no banco
10. **Sistema** mostra tela de sucesso
11. **Acompanhante** volta ao dashboard

### Exibição dos Cards Ordenados

1. **Cliente** acessa página principal
2. **Sistema** chama `acompanhantesService.getAll()`
3. **Service** executa `get_companions_with_boosts()`
4. **Banco** retorna acompanhantes ordenadas:
   - Primeiro: Todas com boost ativo (por prioridade)
   - Depois: Sem boost (por data)
5. **Cards** são renderizados:
   - Cards com boost mostram badge colorido
   - Cards sem boost aparecem normais
6. **Cliente** vê as com boost no topo primeiro

### Expiração Automática

1. **Cron job** executa `deactivate_expired_boosts()` a cada hora
2. **Function** desativa boosts expirados
3. **Function** move para histórico (`boost_history`)
4. **Na próxima busca**, cards voltam para posição normal

---

## 💰 Integração com Mercado Pago (Próximo Passo)

### Onde integrar:
**Arquivo:** `src/pages/Subidas.tsx`
**Função:** `handleSubir()`
**Linha:** 135-141

### Código atual (simulado):
```typescript
// POR ENQUANTO: Criar boost direto (simulando pagamento aprovado)
const { data, error } = await supabase.rpc('create_boost', {
  p_companion_id: companionId,
  p_plan_id: plano.dbData.id,
  p_payment_id: `SIMULADO_${Date.now()}`,
  p_payment_status: 'approved',
  p_payment_method: 'rositas'
});
```

### Como integrar:

#### 1. Backend (criar endpoint):
```javascript
// POST /api/create-payment-preference
app.post('/api/create-payment-preference', async (req, res) => {
  const { title, description, price, companion_id, plan_id } = req.body;

  const preference = {
    items: [{
      title,
      description,
      quantity: 1,
      unit_price: price
    }],
    back_urls: {
      success: 'https://seusite.com/payment/success',
      failure: 'https://seusite.com/payment/failure',
      pending: 'https://seusite.com/payment/pending'
    },
    metadata: {
      companion_id,
      plan_id
    }
  };

  const response = await mercadopago.preferences.create(preference);
  res.json({ preference_id: response.body.id });
});
```

#### 2. Frontend (modificar handleSubir):
```typescript
const handleSubir = async (plano: any) => {
  // ... validações ...

  try {
    // 1. Criar preferência de pagamento
    const response = await fetch('/api/create-payment-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: plano.titulo,
        description: plano.resumo,
        price: plano.dbData.price,
        companion_id: companionId,
        plan_id: plano.dbData.id
      })
    });

    const { preference_id } = await response.json();

    // 2. Redirecionar para checkout do Mercado Pago
    window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preference_id}`;

  } catch (error) {
    toast.error("Erro ao processar pagamento");
  }
};
```

#### 3. Webhook (receber notificação de pagamento):
```javascript
// POST /api/webhook/mercadopago
app.post('/api/webhook/mercadopago', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;

    // Buscar detalhes do pagamento
    const payment = await mercadopago.payment.get(paymentId);

    if (payment.body.status === 'approved') {
      const { companion_id, plan_id } = payment.body.metadata;

      // Criar boost no banco
      await supabase.rpc('create_boost', {
        p_companion_id: companion_id,
        p_plan_id: plan_id,
        p_payment_id: paymentId,
        p_payment_status: 'approved',
        p_payment_method: payment.body.payment_method_id
      });
    }
  }

  res.sendStatus(200);
});
```

---

## 🎯 Casos de Uso

### ✅ Múltiplas acompanhantes com boost
- ✅ Várias podem ter boost ao mesmo tempo
- ✅ Todas aparecem no topo
- ✅ Ordenadas por prioridade do plano

### ✅ Uma acompanhante compra boost
- ✅ Card sobe para o topo imediatamente
- ✅ Badge colorido aparece no card
- ✅ Fica no topo até expirar

### ✅ Boost expira
- ✅ Cron job desativa automaticamente
- ✅ Card volta para posição normal
- ✅ Badge desaparece
- ✅ Histórico é salvo

### ✅ Tentar comprar com boost ativo
- ✅ Sistema bloqueia
- ✅ Mostra aviso com tempo restante
- ✅ Não permite duplicar boost

---

## 📂 Arquivos Criados/Modificados

### SQL
- ✅ `sql/SISTEMA_SUBIDAS_COMPLETO.sql` - Estrutura completa do banco
- ✅ `sql/FUNCTION_GET_COMPANIONS_WITH_BOOSTS.sql` - Function de ordenação

### TypeScript/React
- ✅ `src/pages/Subidas.tsx` - Integrado com banco de dados
- ✅ `src/components/CompanionCard.tsx` - Badge visual adicionado
- ✅ `src/components/ProfileDashboard.tsx` - Botão conectado
- ✅ `src/services/acompanhantesService.ts` - Busca com boosts

### Rotas
- ✅ `/subidas` - Comprar subida (já existia, integrado)
- ✅ Dashboard → "Comprar Subida" → `/subidas`

---

## 🚀 Como Testar

### 1. Executar SQL no Supabase
```sql
-- No SQL Editor do Supabase:
-- 1. Executar SISTEMA_SUBIDAS_COMPLETO.sql
-- 2. Executar FUNCTION_GET_COMPANIONS_WITH_BOOSTS.sql
-- 3. Verificar planos: SELECT * FROM boost_plans;
```

### 2. Testar no Frontend
```bash
npm run dev
```

1. **Login como acompanhante**
2. **Dashboard** → Clicar em "Comprar Subida"
3. **Selecionar um plano**
4. **Clicar em "Subir"**
5. **Verificar boost criado** no banco:
   ```sql
   SELECT * FROM active_boosts WHERE companion_id = 'SEU_ID';
   ```
6. **Voltar para página principal** → Seu card deve estar no topo com badge

### 3. Testar Expiração
```sql
-- Forçar expiração para testar
UPDATE active_boosts
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE companion_id = 'SEU_ID';

-- Executar function de desativação
SELECT deactivate_expired_boosts();

-- Verificar se desativou
SELECT * FROM active_boosts WHERE companion_id = 'SEU_ID';
```

---

## ⚙️ Configuração de Cron Job (Produção)

### Opção 1: Supabase Edge Functions
```typescript
// supabase/functions/deactivate-boosts/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabase.rpc('deactivate_expired_boosts')

  return new Response(
    JSON.stringify({ expired_count: data }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### Opção 2: Vercel Cron
```typescript
// api/cron/deactivate-boosts.ts
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase.rpc('deactivate_expired_boosts')

  res.status(200).json({ expired_count: data })
}
```

**Configurar em `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/cron/deactivate-boosts",
    "schedule": "0 * * * *"
  }]
}
```

---

## 📊 Melhorias Futuras

- [ ] Dashboard com gráfico de visualizações durante boost
- [ ] Notificação quando boost está prestes a expirar
- [ ] Desconto para compra de boost em pacote
- [ ] Boost automático em horários de pico
- [ ] Boost com segmentação (aparecer só para cidades específicas)

---

## ✅ Resumo Final

O sistema está **100% funcional** e pronto para uso, **faltando apenas**:

1. ⏳ **Integração com Mercado Pago** (comentários no código indicam onde)
2. ⏰ **Cron job para expiração** (código pronto, só configurar)

**Tudo o mais funciona:**
- ✅ Banco de dados completo
- ✅ Ordenação correta dos cards
- ✅ Badge visual nos cards
- ✅ Página de compra integrada
- ✅ Validação de boost único por acompanhante
- ✅ Sistema de expiração automática (só falta agendar)

---

**🎉 Sistema pronto para produção após integrar Mercado Pago!**
