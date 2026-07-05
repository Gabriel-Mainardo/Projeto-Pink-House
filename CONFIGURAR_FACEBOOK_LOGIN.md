# 🔵 Configurar Login com Facebook

## 📋 Passo a Passo Completo

### PASSO 1: Criar App no Facebook Developer

1. Acesse: https://developers.facebook.com/apps/
2. Clique em **"Create App"** / **"Criar App"**
3. Escolha tipo: **"Consumer"** (para login de usuários)
4. Clique **Next**
5. Preencha:
   ```
   App name: Faixa Rosa Brasil
   App contact email: seu@email.com
   ```
6. Clique **"Create App"**

### PASSO 2: Adicionar Facebook Login

1. No dashboard do app, procure **"Facebook Login"**
2. Clique em **"Set Up"** / **"Configurar"**
3. Escolha **"Web"** (WWW)
4. Em **Site URL**, coloque temporariamente:
   ```
   http://localhost:5173
   ```
5. Clique **Save** e **Continue**

### PASSO 3: Configurar OAuth Redirect URIs

1. No menu lateral, vá em: **Facebook Login** → **Settings**
2. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   https://lavzkjjnrgooajzganrh.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```
3. Clique **Save Changes**

### PASSO 4: Copiar Credenciais

1. No menu lateral, vá em: **Settings** → **Basic**
2. Você vai ver:
   ```
   App ID: [número do seu app]
   App Secret: [clique em "Show" para ver]
   ```
3. **Copie ambos** (você vai usar no Supabase)

### PASSO 5: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/lavzkjjnrgooajzganrh/auth/providers
2. Encontre **Facebook**
3. Ative o toggle (ON)
4. Cole:
   ```
   Facebook Client ID: [Cole o App ID do Facebook]
   Facebook Client Secret: [Cole o App Secret do Facebook]
   ```
5. Clique **Save**
6. Aguarde 30 segundos

### PASSO 6: Testar

1. Acesse: `http://localhost:5173/auth-register`
2. Clique **"Continuar com Facebook"**
3. Faça login com sua conta Facebook
4. Deve funcionar! ✨

## 🎯 MODO DE DESENVOLVIMENTO vs PRODUÇÃO

### Modo de Desenvolvimento (padrão):
- Apenas você (admin do app) pode fazer login
- Para adicionar test users:
  1. Facebook App → **Roles** → **Test Users**
  2. Clique **"Add Test Users"**
  3. Crie usuários de teste

### Modo Live (Produção):
- Qualquer pessoa pode fazer login
- Precisa passar por **"App Review"** do Facebook
- Para mudar:
  1. Facebook App → **App Review**
  2. Toggle: **"Make [App Name] public?"** → **ON**
  3. Facebook vai revisar (geralmente aprova rápido para login básico)

## ⚙️ Configurações Adicionais (Opcional)

### Adicionar ícone e informações do app:

1. **Settings** → **Basic**
2. **Display Name**: Faixa Rosa Brasil
3. **App Domains**: `seusite.com` (quando fizer deploy)
4. **Privacy Policy URL**: link da sua política
5. **Terms of Service URL**: link dos termos
6. **App Icon**: upload de 1024x1024px
7. **Category**: Social Networking ou Dating

### Configurar permissões:

Por padrão, o Facebook dá:
- ✅ `email` (email do usuário)
- ✅ `public_profile` (nome, foto)

Para pedir mais permissões, precisa passar pelo App Review.

## 🐛 Troubleshooting

### Erro: "App not setup"
- Verifique se adicionou o OAuth Redirect URI corretamente
- Deve ter: `https://lavzkjjnrgooajzganrh.supabase.co/auth/v1/callback`

### Erro: "URL Blocked"
- Vá em Settings → Basic → App Domains
- Adicione seu domínio

### Erro: "Invalid OAuth Redirect URI"
- Confira se a URI está EXATAMENTE como no passo 3
- Sem espaços, sem barras extras

### Só você consegue logar:
- Normal! App está em modo Development
- Adicione test users OU publique o app (Passo "Modo Live")

## ✅ Checklist Final

- [ ] App criado no Facebook Developers
- [ ] Facebook Login configurado
- [ ] OAuth Redirect URIs adicionadas
- [ ] App ID e Secret copiados
- [ ] Credenciais coladas no Supabase
- [ ] Testado e funcionando

## 🚀 Próximos Passos

### Para Produção:
1. Adicione domínio de produção nas OAuth Redirect URIs
2. Preencha informações do app (Privacy Policy, etc.)
3. Publique o app (App Review)

### Para Desenvolvimento:
- Está pronto! Continue desenvolvendo!
- Adicione test users se precisar testar com outras contas

---

**Dúvidas?** Me chama que eu te ajudo! 🎯
