# 🚀 PRÓXIMOS PASSOS APÓS EXECUTAR O SQL

Depois de executar o `SETUP_BACKEND_COMPLETO.sql` no Supabase, você precisa fazer mais algumas coisas:

---

## 1️⃣ CONFIGURAR STORAGE (Buckets)

No Supabase Dashboard > Storage, criar os buckets:

```
✅ avatars          (fotos de perfil)
✅ gallery          (galeria das acompanhantes)
✅ videos           (vídeos de apresentação)
✅ stories          (stories temporários)
✅ messages         (mídia enviada em mensagens)
✅ documents        (documentos de verificação)
```

**Políticas de cada bucket:**

```sql
-- Bucket: avatars (PUBLIC READ)
CREATE POLICY "Todos podem ver avatares"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket: gallery (PUBLIC READ)
CREATE POLICY "Todos podem ver galeria"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Acompanhantes podem fazer upload na galeria"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND auth.uid() IN (SELECT user_id FROM acompanhantes));

-- Bucket: stories (PUBLIC READ com expiração)
CREATE POLICY "Todos podem ver stories"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

-- Bucket: messages (PRIVATE - só participantes)
CREATE POLICY "Só participantes veem mídia de mensagens"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'messages' AND
  auth.uid() IN (
    SELECT sender_id FROM messages WHERE media_url LIKE '%' || name
    UNION
    SELECT c.client_id FROM conversations c
    JOIN messages m ON m.conversation_id = c.id
    WHERE m.media_url LIKE '%' || name
  )
);
```

---

## 2️⃣ EDGE FUNCTIONS (Supabase)

Criar Edge Functions para automações. No terminal:

```bash
supabase functions new send-email
supabase functions new send-sms
supabase functions new process-payment-webhook
supabase functions new expire-stories
supabase functions new expire-boosts
supabase functions new calculate-distance
supabase functions new moderate-content
```

### Exemplo: `send-email.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!

serve(async (req) => {
  const { to, subject, html } = await req.json()

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@faixarosa.com' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  })

  return new Response(JSON.stringify({ success: res.ok }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Exemplo: `expire-stories.ts` (CRON a cada hora)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Marcar stories expirados
  const { data, error } = await supabase
    .from('created_stories')
    .update({ is_expired: true })
    .lt('expires_at', new Date().toISOString())
    .eq('is_expired', false)

  // Deletar arquivos de stories expirados há mais de 48h
  const { data: expiredStories } = await supabase
    .from('created_stories')
    .select('url')
    .lt('expires_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .eq('is_expired', true)

  // Deletar do storage
  for (const story of expiredStories || []) {
    const fileName = story.url.split('/').pop()
    await supabase.storage.from('stories').remove([fileName])
  }

  return new Response(JSON.stringify({ expired: data?.length || 0 }))
})
```

### Configurar CRON Jobs

No `supabase/functions/expire-stories/index.ts`, adicionar:

```typescript
Deno.cron("Expirar stories", "0 * * * *", async () => {
  // Código acima
})
```

---

## 3️⃣ INTEGRAÇÕES EXTERNAS

### A) Stripe (Pagamentos)

```typescript
// supabase/functions/process-payment-webhook/index.ts
import Stripe from 'https://esm.sh/stripe@13.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Atualizar transação no banco
    await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('payment_id', session.id)

    // Ativar assinatura
    // Enviar email de confirmação
  }

  return new Response(JSON.stringify({ received: true }))
})
```

### B) Twilio (SMS)

```typescript
// supabase/functions/send-sms/index.ts
serve(async (req) => {
  const { phone, message } = await req.json()

  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: Deno.env.get('TWILIO_PHONE_NUMBER')!,
        Body: message,
      }),
    }
  )

  return new Response(JSON.stringify({ sent: response.ok }))
})
```

### C) Firebase Cloud Messaging (Push Notifications)

```typescript
// supabase/functions/send-push-notification/index.ts
serve(async (req) => {
  const { userId, title, body, data } = await req.json()

  // Buscar tokens do usuário
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true)

  // Enviar para Firebase
  for (const { token } of tokens || []) {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body },
        data,
      }),
    })
  }

  return new Response(JSON.stringify({ sent: tokens?.length || 0 }))
})
```

---

## 4️⃣ AUTENTICAÇÃO (Supabase Dashboard)

### Authentication > Providers

Ativar:
- ✅ Email (já vem ativado)
- ✅ Google OAuth
- ✅ Facebook OAuth

### Authentication > Email Templates

Customizar templates de:
- Confirmação de email
- Recuperação de senha
- Convite
- Magic Link

### Authentication > URL Configuration

Configurar:
- Site URL: `https://seusite.com`
- Redirect URLs: `https://seusite.com/auth/callback`

---

## 5️⃣ REALTIME (Chat ao vivo)

No frontend, configurar Realtime para mensagens:

```typescript
// src/services/realtimeService.ts
import { supabase } from './supabase'

export function subscribeToMessages(conversationId: string, callback: (message: any) => void) {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

export function subscribeToTyping(conversationId: string, callback: (data: any) => void) {
  return supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, callback)
    .subscribe()
}

export function broadcastTyping(conversationId: string, isTyping: boolean) {
  supabase
    .channel(`typing:${conversationId}`)
    .send({
      type: 'broadcast',
      event: 'typing',
      payload: { isTyping },
    })
}
```

---

## 6️⃣ VARIÁVEIS DE AMBIENTE

Criar arquivo `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+55...

# SendGrid
SENDGRID_API_KEY=SG....

# Firebase
FCM_SERVER_KEY=AAAA...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

---

## 7️⃣ TESTES

Testar cada funcionalidade:

```bash
# Testar autenticação
curl -X POST https://seu-projeto.supabase.co/auth/v1/signup \
  -H "apikey: SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123"}'

# Testar Edge Function
curl -X POST https://seu-projeto.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"teste@email.com","subject":"Teste","html":"<h1>Olá</h1>"}'
```

---

## 8️⃣ MONITORAMENTO

Configurar logs e alertas:

1. **Supabase Dashboard > Logs**
   - Monitorar erros
   - Ver queries lentas
   - Analisar uso de Edge Functions

2. **Sentry** (opcional)
   - Tracking de erros no frontend
   - Alertas de exceptions

3. **Google Analytics** (opcional)
   - Tracking de conversões
   - Análise de comportamento

---

## ⚠️ CHECKLIST FINAL

Antes de colocar em produção:

- [ ] Todas as tabelas criadas
- [ ] RLS configurado e testado
- [ ] Buckets de storage criados
- [ ] Políticas de storage configuradas
- [ ] Edge Functions deployadas
- [ ] CRON jobs configurados
- [ ] Webhooks de pagamento testados
- [ ] Emails transacionais funcionando
- [ ] SMS funcionando
- [ ] Push notifications funcionando
- [ ] Chat em tempo real testado
- [ ] Upload de arquivos funcionando
- [ ] Geolocalização funcionando
- [ ] Sistema de busca otimizado
- [ ] Backup automatizado configurado
- [ ] SSL/HTTPS configurado
- [ ] Domínio customizado
- [ ] Políticas de privacidade (LGPD)
- [ ] Termos de uso

---

## 📚 DOCUMENTAÇÃO ÚTIL

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Twilio API](https://www.twilio.com/docs/usage/api)

---

Qualquer dúvida me chama! 🚀
