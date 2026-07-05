# Correção: Erro ao Criar Conta de Cliente

## Problema

Ao tentar criar uma conta de cliente, ocorre o seguinte erro:

```
insert or update on table "clientes" violates foreign key constraint "clientes_user_id_fkey"
Key (user_id)=(8e23c9bf-bd2f-488d-aacb-7ebf433a51ac) is not present in table "users".
```

## Causa

O erro ocorre porque:

1. O código cria um usuário no **Supabase Auth** (`auth.users`)
2. Logo em seguida, tenta inserir na tabela **`clientes`** com o `user_id`
3. A constraint de foreign key verifica se o `user_id` existe
4. Porém, imediatamente após o `signUp`, o contexto de autenticação ainda está como "anônimo" (`anon`)
5. As políticas RLS (Row Level Security) bloqueiam o INSERT porque só permitem para usuários `authenticated`

## Solução

Execute o seguinte SQL no **Supabase SQL Editor**:

```sql
-- 1. REMOVER políticas de INSERT antigas
DROP POLICY IF EXISTS "Permitir criação de perfil de cliente" ON public.clientes;
DROP POLICY IF EXISTS "Permitir criação de perfil cliente" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem inserir seus próprios dados" ON public.clientes;

-- 2. CRIAR nova política que permite INSERT para anon E authenticated
CREATE POLICY "Permitir criação de perfil cliente"
    ON public.clientes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 3. Garantir permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.clientes TO anon, authenticated;
```

**Ou execute o arquivo SQL pronto:**

```bash
sql/CORRIGIR_CADASTRO_CLIENTES.sql
```

## Passo a Passo

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `sql/CORRIGIR_CADASTRO_CLIENTES.sql`
6. Clique em **Run** ou pressione `Ctrl/Cmd + Enter`
7. Teste criar uma conta de cliente novamente

## Verificação

Após executar o SQL, você pode verificar se está funcionando:

```sql
-- Verificar políticas de INSERT
SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clientes'
    AND cmd = 'INSERT';
```

Você deve ver uma política que permite INSERT para `{anon, authenticated}`.

## Observações

- Esta solução é segura porque apenas permite que usuários recém-criados insiram seus próprios dados
- As outras operações (SELECT, UPDATE, DELETE) continuam protegidas pelas políticas RLS existentes
- Esta é uma prática comum no Supabase para resolver o problema de "usuário anônimo logo após signUp"
