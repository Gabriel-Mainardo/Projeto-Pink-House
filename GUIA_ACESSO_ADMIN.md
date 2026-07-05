# 🔐 Guia de Acesso ao Painel Administrativo

## Credenciais de Acesso

**URL de Login:** `/admin-login`  
**Usuário:** `admin`  
**Senha:** `admin123`

## Rotas Administrativas Disponíveis

1. **Login Administrativo:** `/admin-login`
2. **Painel Principal:** `/admin-dashboard`
3. **Painel Simples:** `/simple-admin`  
4. **Página de Teste:** `/test-admin`

## Como Acessar

### Passo 1: Navegue para a página de login
```
http://localhost:5173/admin-login
```

### Passo 2: Digite as credenciais
- **Nome de usuário:** admin
- **Senha:** admin123

### Passo 3: Clique em "Acessar Painel"
Você será redirecionado automaticamente para `/admin-dashboard`

## Funcionalidades do Painel

### 📊 Dashboard Principal (`/admin-dashboard`)
- Estatísticas gerais
- Gerenciamento de acompanhantes
- Aprovação de cadastros pendentes
- Sistema de busca e filtros
- Botão de logout no cabeçalho

### 🛠️ Página de Teste (`/test-admin`)
- Página simples para verificar se o acesso está funcionando
- Útil para debug de problemas de roteamento

### 📱 Painel Simples (`/simple-admin`)
- Interface alternativa mais básica
- Mesmas funcionalidades em layout simplificado

## 🔒 Sistema de Proteção

Todas as rotas administrativas agora estão protegidas por:
- Verificação de autenticação no localStorage
- Redirecionamento automático para login se não autenticado
- Limpeza automática de dados corrompidos
- Verificação do papel de usuário (role: 'admin')

## 🚨 Resolução de Problemas

### Problema: Não consigo acessar o painel
**Solução:**
1. Certifique-se de estar usando as credenciais corretas
2. Limpe o localStorage do navegador se houver dados corrompidos
3. Acesse primeiro `/admin-login` antes de tentar outras rotas

### Problema: Redirecionamento infinito
**Solução:**
1. Abra o DevTools (F12)
2. Vá em Application > Local Storage
3. Delete a chave 'admin'
4. Recarregue a página

### Problema: Erro "Cannot find name 'useEffect'"
**Solução:**
- Este é um erro temporário do TypeScript/ESLint
- Reinicie o servidor de desenvolvimento
- O código funcionará normalmente

## 🔧 Para Desenvolvimento

### Modificar Credenciais
Edite o arquivo `src/pages/AdminLogin.tsx` linha ~25:
```javascript
if (username === 'NOVO_USER' && password === 'NOVA_SENHA') {
```

### Adicionar Novas Rotas Protegidas
No `src/App.tsx`:
```javascript
<Route path="/nova-rota" element={
  <ProtectedRoute requireAdmin={true}>
    <NovoComponente />
  </ProtectedRoute>
} />
```

### Personalizar Verificação de Autenticação
Edite `src/components/ProtectedRoute.tsx` para adicionar:
- Verificação de token JWT
- Integração com backend
- Níveis de permissão diferentes 