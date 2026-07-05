# 🚀 GUIA COMPLETO: Implementar Sistema de Mensagens

## ✅ O que já está pronto:

1. ✅ **SQL do banco de dados** (`sql/SISTEMA_MENSAGENS_COMPLETO.sql`)
2. ✅ **Serviço de mensagens** (`src/services/messagesService.ts`)
3. ✅ **Botão "Enviar mensagem"** nos cards das acompanhantes
4. ✅ **Rota /mensagens** criada

## 📋 O que falta fazer:

### PASSO 1: Executar o SQL no Supabase
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `sql/SISTEMA_MENSAGENS_COMPLETO.sql`
4. Execute o script
5. Verifique se as tabelas `conversations` e `messages` foram criadas

### PASSO 2: Modificar ChatVip.tsx para usar dados reais

Substitua os dados mockados por dados reais. Aqui está o código completo:

```typescript
// No início do componente, adicionar:
const [realConversations, setRealConversations] = useState<messagesService.Conversation[]>([]);
const [realMessages, setRealMessages] = useState<messagesService.Message[]>([]);

// Buscar usuário logado
useEffect(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      setCurrentUserId(parsedUser.id || parsedUser.user_id);
    } catch (error) {
      console.error('Erro ao pegar usuário:', error);
    }
  }
}, []);

// Carregar conversas quando tiver userId
useEffect(() => {
  if (!currentUserId) return;

  const loadConversations = async () => {
    setLoading(true);
    const convs = await messagesService.getUserConversations(currentUserId);
    setRealConversations(convs);
    setLoading(false);

    // Se veio de um card (companion_id na URL), criar/abrir conversa
    const companionId = searchParams.get('companion_id');
    if (companionId) {
      const conversationId = await messagesService.getOrCreateConversation(
        currentUserId,
        companionId
      );
      if (conversationId) {
        setSelectedConversation(conversationId);
      }
    } else if (convs.length > 0) {
      // Selecionar primeira conversa
      setSelectedConversation(convs[0].id);
    }
  };

  loadConversations();
}, [currentUserId, searchParams]);

// Carregar mensagens quando selecionar uma conversa
useEffect(() => {
  if (!selectedConversation) return;

  const loadMessages = async () => {
    const msgs = await messagesService.getConversationMessages(selectedConversation);
    setRealMessages(msgs);

    // Marcar mensagens como lidas
    if (currentUserId) {
      await messagesService.markMessagesAsRead(selectedConversation, currentUserId);
    }

    // Scroll para o final
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  loadMessages();
}, [selectedConversation, currentUserId]);

// Implementar envio de mensagem real
const handleSendMessage = async () => {
  if (!messageText.trim() || !selectedConversation || !currentUserId) return;

  const newMessage = await messagesService.sendMessage(
    selectedConversation,
    currentUserId,
    messageText
  );

  if (newMessage) {
    setRealMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // Scroll para o final
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    toast({
      title: "Erro ao enviar mensagem",
      description: "Tente novamente",
      variant: "destructive"
    });
  }
};

// Implementar real-time
useEffect(() => {
  if (!selectedConversation) return;

  const unsubscribe = messagesService.subscribeToMessages(
    selectedConversation,
    (newMessage) => {
      setRealMessages(prev => [...prev, newMessage]);

      // Scroll para o final
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  );

  return unsubscribe;
}, [selectedConversation]);
```

### PASSO 3: Mapear dados reais para o formato do componente

Você precisa converter os dados do Supabase para o formato que o componente está usando:

```typescript
// Converter conversations do Supabase para formato local
const mappedConversations = realConversations.map(conv => ({
  id: conv.id,
  companionName: conv.companion?.nome_profissional || conv.companion?.nome || 'Sem nome',
  companionAvatar: conv.companion?.foto_perfil || 'https://via.placeholder.com/150',
  lastMessage: conv.last_message_text || '',
  lastMessageTime: conv.last_message_at ? formatTime(conv.last_message_at) : '',
  unreadCount: conv.unread_count || 0,
  online: false, // Você pode implementar status online depois
  messages: [] // Mensagens vêm do realMessages
}));

// Converter messages do Supabase para formato local
const mappedMessages = realMessages.map(msg => ({
  id: msg.id,
  text: msg.text,
  senderId: msg.sender_id,
  timestamp: new Date(msg.created_at),
  read: msg.read
}));

// Função auxiliar para formatar tempo
function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    return 'Agora';
  } else if (hours < 24) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (hours < 48) {
    return 'Ontem';
  } else {
    return `${Math.floor(hours / 24)} dias`;
  }
}
```

### PASSO 4: Atualizar a renderização

Substituir:
```typescript
// De:
{filteredConversations.map((conv) => (

// Para:
{mappedConversations.filter(conv =>
  conv.companionName.toLowerCase().includes(searchTerm.toLowerCase())
).map((conv) => (
```

E para as mensagens:
```typescript
// De:
{selectedConv?.messages.map((message) => {

// Para:
{mappedMessages.map((message) => {
```

## 🎯 TESTANDO

1. **Executar o SQL no Supabase** ✅
2. **Fazer login no site** (pegar o user_id do localStorage)
3. **Clicar em "Enviar mensagem"** em um card
4. **Deve abrir o chat** com a conversa criada
5. **Enviar uma mensagem de teste**
6. **Abrir em outra aba** e ver a mensagem chegando em tempo real

## 🐛 TROUBLESHOOTING

### Erro: "relation conversations does not exist"
- Você esqueceu de executar o SQL no Supabase

### Erro: "user_id is undefined"
- O usuário não está logado ou o localStorage não tem o user_id
- Verificar se `localStorage.getItem('user')` retorna algo

### Mensagens não aparecem
- Verificar no console do navegador (F12) se há erros
- Verificar no Supabase se as mensagens estão sendo inseridas

### Real-time não funciona
- Verificar se executou a linha do SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE messages;`
- Recarregar a página

## 📞 PRÓXIMOS PASSOS (OPCIONAL)

1. **Status Online**: Adicionar presença em tempo real
2. **Digitando...**: Mostrar quando o outro usuário está digitando
3. **Enviar imagens**: Permitir upload de fotos nas mensagens
4. **Áudio**: Permitir envio de mensagens de áudio
5. **Notificações**: Notificar quando chegar mensagem nova
6. **Busca**: Buscar mensagens antigas

---

**Qualquer dúvida, me chama!** 🚀
