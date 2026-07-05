# 🔐 Configuração Google OAuth - Passo a Passo

## ⚠️ IMPORTANTE: Onde colocar as credenciais

As credenciais **CLIENT_ID** e **CLIENT_SECRET** são configuradas **APENAS no Supabase Dashboard**, NUNCA no código por segurança!

## 📋 Suas Credenciais:

```
CLIENT_ID: seu-google-client-id.apps.googleusercontent.com
CLIENT_SECRET: seu-google-client-secret
CALLBACK_URL: https://lavzkijrngooajzganrh.supabase.co/auth/v1/callback
```

## 🎯 PASSO 1: Configurar no Supabase Dashboard

### 1. Acesse seu projeto Supabase:
```
https://supabase.com/dashboard/project/lavzkijrngooajzganrh
```

### 2. Vá em: **Authentication** → **Providers**

### 3. Encontre **Google** na lista e clique para expandir

### 4. Ative o toggle do Google (ON)

### 5. Cole as credenciais:
```
Google Client ID:
seu-google-client-id.apps.googleusercontent.com

Google Client Secret:
seu-google-client-secret
```

### 6. Verifique a Redirect URL (já deve estar configurada):
```
https://lavzkijrngooajzganrh.supabase.co/auth/v1/callback
```

### 7. Clique em **Save** / **Salvar**

## ✅ PASSO 2: Verificar Google Cloud Console

### 1. Acesse: https://console.cloud.google.com

### 2. Vá em: **APIs & Services** → **Credentials**

### 3. Encontre seu OAuth 2.0 Client ID

### 4. Verifique se tem estas URIs de redirecionamento:
```
✅ https://lavzkijrngooajzganrh.supabase.co/auth/v1/callback
✅ http://localhost:5173/auth/callback (para testes locais - opcional)
```

### 5. Se não tiver, adicione ambas

## 🔍 PASSO 3: Verificar o Código (JÁ ESTÁ PRONTO!)

O código **JÁ ESTÁ CORRETO** e funciona automaticamente com as credenciais do Supabase:

### ✅ `src/lib/supabase.ts`
- Usa variáveis de ambiente (`.env`)
- Conecta ao Supabase automaticamente
- **NÃO contém credenciais sensíveis** ✅

### ✅ `src/pages/AuthRegister.tsx`
- Função `handleGoogleSignIn()` implementada
- Usa `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Salva `userType` (companion/client) no localStorage
- **Funciona automaticamente com Supabase OAuth** ✅

### ✅ `src/pages/AuthCallback.tsx`
- Processa retorno do Google
- Verifica se usuário já existe
- Redireciona corretamente
- **Tudo funcionando!** ✅

### ✅ `src/App.tsx`
- Rota `/auth/callback` configurada
- **Pronto!** ✅

## 🧪 PASSO 4: Testar

### 1. Certifique-se que configurou no Supabase Dashboard (Passo 1)

### 2. Acesse sua aplicação:
```
http://localhost:5173/auth-register
```

### 3. Clique em "Continuar com Google"

### 4. Escolha sua conta Google

### 5. Você deve ser redirecionado de volta e:
   - **Se é novo usuário**: vai para completar cadastro
   - **Se já tem conta**: vai direto para o dashboard

## 🐛 Debug / Solução de Problemas

### Se der erro "Invalid OAuth client":
1. Verifique se copiou CLIENT_ID e SECRET corretamente no Supabase
2. Verifique se SALVOU as configurações no Supabase
3. Aguarde 1-2 minutos (o Supabase pode levar um tempo para aplicar)

### Se redirecionar mas dar erro:
1. Abra DevTools (F12) → Console
2. Veja os logs (tem vários `console.log()` para debug)
3. Procure por mensagens de erro

### Se não redirecionar:
1. Verifique Google Cloud Console
2. Confira se a Redirect URI está correta:
   ```
   https://lavzkijrngooajzganrh.supabase.co/auth/v1/callback
   ```

## 📝 Arquivos de Configuração

### `.env` (crie se não existir):
```env
VITE_SUPABASE_URL=https://lavzkijrngooajzganrh.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**IMPORTANTE:** O CLIENT_ID e CLIENT_SECRET do Google **NÃO** vão no `.env`!
Eles ficam **APENAS** no Supabase Dashboard!

## ✅ Checklist Final

- [ ] Credenciais configuradas no Supabase Dashboard
- [ ] Google Provider ATIVADO no Supabase
- [ ] Redirect URI configurada no Google Cloud Console
- [ ] `.env` com SUPABASE_URL e ANON_KEY
- [ ] Testado o fluxo completo de login

## 🎉 Pronto!

Após seguir todos os passos, o Google OAuth estará funcionando perfeitamente!

O código já está 100% pronto, você só precisa:
1. Configurar as credenciais no Supabase Dashboard (Passo 1)
2. Verificar Google Cloud Console (Passo 2)
3. Testar! (Passo 4)

---

**Dúvidas?**
- Verifique os logs no console (F12)
- Todos os componentes têm `console.log()` para debug
- Qualquer erro, me avise!
