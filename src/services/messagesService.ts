import { supabase } from '../lib/supabase';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  companion_id: string;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;

  // Dados da acompanhante (join)
  companion?: {
    id: string;
    name: string;
    display_name: string | null;
    image: string;
    phone?: string | null;
    auth_user_id: string | null;
  };

  // Dados do cliente (join)
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };

  // Contador de não lidas
  unread_count?: number;
}

interface MessagingParticipant {
  type: 'companion' | 'client';
  authUserId: string;
  companionId?: string;
}

async function resolveMessagingParticipant(userId: string): Promise<MessagingParticipant> {
  const { data: companionData } = await supabase
    .from('acompanhantes')
    .select('id, auth_user_id')
    .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
    .limit(1)
    .maybeSingle();

  if (companionData) {
    return {
      type: 'companion',
      authUserId: companionData.auth_user_id || userId,
      companionId: companionData.id,
    };
  }

  return {
    type: 'client',
    authUserId: userId,
  };
}

// ============================================
// FUNÇÕES DO SERVIÇO
// ============================================

/**
 * Buscar todas as conversas do usuário logado
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    // Primeiro verificar se o usuário é uma acompanhante
    const { data: companionData } = await supabase
      .from('acompanhantes')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    let query = supabase
      .from('conversations')
      .select(`
        *,
        companion:acompanhantes!companion_id (
          id,
          name,
          display_name,
          image,
          phone,
          auth_user_id
        )
      `);

    // Se for acompanhante, buscar por companion_id = id da acompanhante
    // Se não, buscar por client_id = userId (que é o auth user id do cliente)
    if (companionData) {
      console.log('👤 Usuário é ACOMPANHANTE, buscando conversas por companion_id:', companionData.id);
      query = query.eq('companion_id', companionData.id);
    } else {
      console.log('👤 Usuário é CLIENTE, buscando conversas por client_id:', userId);
      query = query.eq('client_id', userId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar conversas:', error);
      throw error;
    }

    // Para cada conversa, buscar contagem de mensagens não lidas E dados do cliente
    const conversationsWithUnread = await Promise.all(
      (data || []).map(async (conv) => {
        // Buscar contagem de não lidas
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', userId);

        // Buscar dados do cliente (id = auth.users.id)
        const { data: clientData } = await supabase
          .from('clientes')
          .select('id, name, email, phone')
          .eq('id', conv.client_id)
          .single();

        return {
          ...conv,
          client: clientData || undefined,
          unread_count: count || 0
        };
      })
    );

    console.log('✅ Conversas carregadas:', conversationsWithUnread.length);
    return conversationsWithUnread;

  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error);
    return [];
  }
};

export const getUserConversationsFast = async (userId: string): Promise<Conversation[]> => {
  try {
    const participant = await resolveMessagingParticipant(userId);

    let query = supabase
      .from('conversations')
      .select(`
        *,
        companion:acompanhantes!companion_id (
          id,
          name,
          display_name,
          image,
          phone,
          auth_user_id
        )
      `);

    if (participant.type === 'companion' && participant.companionId) {
      query = query.eq('companion_id', participant.companionId);
    } else {
      query = query.eq('client_id', participant.authUserId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar conversas (fast):', error);
      throw error;
    }

    const conversations = data || [];
    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map((conv) => conv.id);
    const clientIds = Array.from(
      new Set(
        conversations
          .map((conv) => conv.client_id)
          .filter((value): value is string => Boolean(value))
      )
    );

    const [clientsResult, unreadMessagesResult] = await Promise.all([
      clientIds.length > 0
        ? supabase
            .from('clientes')
            .select('id, name, email, phone')
            .in('id', clientIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .eq('read', false)
        .neq('sender_id', participant.authUserId),
    ]);

    if (clientsResult.error) {
      console.error('❌ Erro ao buscar clientes das conversas (fast):', clientsResult.error);
      throw clientsResult.error;
    }

    if (unreadMessagesResult.error) {
      console.error('❌ Erro ao buscar não lidas das conversas (fast):', unreadMessagesResult.error);
      throw unreadMessagesResult.error;
    }

    const clientsById = new Map((clientsResult.data || []).map((client) => [client.id, client]));
    const unreadCountByConversation = (unreadMessagesResult.data || []).reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.conversation_id] = (acc[item.conversation_id] || 0) + 1;
        return acc;
      },
      {}
    );

    return conversations.map((conv) => ({
      ...conv,
      client: clientsById.get(conv.client_id) || undefined,
      unread_count: unreadCountByConversation[conv.id] || 0,
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar conversas (fast):', error);
    return [];
  }
};

/**
 * Contar total de mensagens não lidas do usuário logado
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    // Verificar se é acompanhante
    const { data: companionData } = await supabase
      .from('acompanhantes')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    // Buscar IDs das conversas do usuário
    let convQuery = supabase.from('conversations').select('id');
    if (companionData) {
      convQuery = convQuery.eq('companion_id', companionData.id);
    } else {
      convQuery = convQuery.eq('client_id', userId);
    }

    const { data: convs } = await convQuery;
    if (!convs || convs.length === 0) return 0;

    const convIds = convs.map((c) => c.id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('read', false)
      .neq('sender_id', userId);

    return count || 0;
  } catch {
    return 0;
  }
};

/**
 * Buscar mensagens de uma conversa específica
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      throw error;
    }

    console.log(`✅ Mensagens carregadas: ${data?.length || 0}`);
    return data || [];

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    return [];
  }
};

/**
 * Obter ou criar conversa entre cliente e acompanhante
 * REGRA: Somente o CLIENTE pode criar a conversa
 */
export const getOrCreateConversation = async (
  clientId: string,
  companionId: string
): Promise<string | null> => {
  try {
    console.log('🔍 Buscando conversa existente:', { clientId, companionId });

    // Primeiro tentar encontrar conversa existente
    const { data: existing, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .eq('companion_id', companionId)
      .maybeSingle(); // Use maybeSingle() ao invés de single() para não dar erro se não encontrar

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar conversa:', searchError);
      throw searchError;
    }

    if (existing) {
      console.log('✅ Conversa existente encontrada:', existing.id);
      return existing.id;
    }

    console.log('📝 Criando nova conversa...');

    // Se não encontrou, criar nova conversa
    // IMPORTANTE: A policy garante que apenas o cliente autenticado pode criar
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        companion_id: companionId
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError);

      // Se erro de permissão, significa que não é o cliente
      if (createError.code === '42501' || createError.message?.includes('policy')) {
        console.error('🚫 ERRO DE PERMISSÃO: Somente clientes podem iniciar conversas');
        throw new Error('Somente clientes podem iniciar conversas com acompanhantes');
      }

      throw createError;
    }

    console.log('✅ Nova conversa criada:', newConv.id);
    return newConv.id;

  } catch (error: any) {
    console.error('❌ Erro ao obter/criar conversa:', error);

    // Retornar mensagem amigável
    if (error.message?.includes('Somente clientes')) {
      throw error;
    }

    return null;
  }
};

/**
 * Enviar uma mensagem
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text: text.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }

    console.log('✅ Mensagem enviada:', data.id);

    // Atualizar a conversa com a última mensagem
    await supabase
      .from('conversations')
      .update({
        last_message_text: text.trim(),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    console.log('✅ Conversa atualizada com última mensagem');

    return data;

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return null;
  }
};

/**
 * Marcar mensagens como lidas
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('read', false)
      .neq('sender_id', userId);

    if (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
      throw error;
    }

    console.log('✅ Mensagens marcadas como lidas');
    return true;

  } catch (error) {
    console.error('❌ Erro ao marcar mensagens como lidas:', error);
    return false;
  }
};

/**
 * Buscar dados da acompanhante
 */
export const getCompanionData = async (companionId: string) => {
  try {
    const { data, error } = await supabase
      .from('acompanhantes')
      .select('id, name, display_name, image')
      .eq('id', companionId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar dados da acompanhante:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('❌ Erro ao buscar dados da acompanhante:', error);
    return null;
  }
};

/**
 * Subscribe para novas mensagens em tempo real
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
) => {
  console.log('🔔 Inscrevendo para mensagens em tempo real:', conversationId);

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('🔔 Nova mensagem recebida:', payload.new);
        callback(payload.new as Message);
      }
    )
    .subscribe();

  // Retornar função para cancelar subscription
  return () => {
    console.log('❌ Cancelando subscription de mensagens');
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe para atualizações de conversas em tempo real
 * Escuta tanto INSERT (novas conversas) quanto UPDATE (mensagens novas em conversas existentes)
 * Também escuta INSERT na tabela messages para detectar novas mensagens
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversation: Conversation) => void
) => {
  console.log('🔔 Inscrevendo para conversas em tempo real, userId:', userId);

  // Primeiro, buscar o companion_id se o usuário for uma acompanhante
  let companionId: string | null = null;
  let userConversationIds: string[] = [];

  const setupSubscription = async () => {
    // Verificar se o usuário é uma acompanhante
    const { data: companionData } = await supabase
      .from('acompanhantes')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (companionData) {
      companionId = companionData.id;
      console.log('👤 Usuário é acompanhante, companion_id:', companionId);
    } else {
      console.log('👤 Usuário é cliente, client_id:', userId);
    }

    // Buscar IDs das conversas do usuário para filtrar mensagens
    const convs = await getUserConversations(userId);
    userConversationIds = convs.map(c => c.id);
    console.log('📋 Conversas do usuário:', userConversationIds.length);
  };

  setupSubscription();

  // Canal para mudanças na tabela conversations (novas conversas, atualizações)
  const conversationsChannel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations'
      },
      async (payload) => {
        const conv = payload.new as Conversation;
        console.log('🔔 Evento de conversa recebido:', payload.eventType, conv?.id);

        // Verificar se o usuário é participante desta conversa
        const isClient = conv.client_id === userId;
        const isCompanion = companionId && conv.companion_id === companionId;

        if (isClient || isCompanion) {
          console.log('🔔 Conversa relevante para o usuário:', conv.id, { isClient, isCompanion });

          // Atualizar lista de conversas do usuário
          if (!userConversationIds.includes(conv.id)) {
            userConversationIds.push(conv.id);
          }

          callback(conv);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Status da subscription de conversas:', status);
    });

  // Canal separado para novas mensagens (mais confiável para detectar novas conversas)
  const messagesChannel = supabase
    .channel(`messages-notify:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      async (payload) => {
        const msg = payload.new as Message;
        console.log('🔔 Nova mensagem detectada:', msg.id, 'na conversa:', msg.conversation_id);

        // Se a mensagem não é do próprio usuário, notificar
        if (msg.sender_id !== userId) {
          // Verificar se essa conversa pertence ao usuário
          // Buscar a conversa para verificar
          const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', msg.conversation_id)
            .single();

          if (conv) {
            const isClient = conv.client_id === userId;
            const isCompanion = companionId && conv.companion_id === companionId;

            if (isClient || isCompanion) {
              console.log('🔔 Nova mensagem em conversa do usuário, atualizando lista');
              callback(conv as Conversation);
            }
          }
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Status da subscription de mensagens (notify):', status);
    });

  // Retornar função para cancelar ambas subscriptions
  return () => {
    console.log('❌ Cancelando subscriptions de conversas e mensagens');
    supabase.removeChannel(conversationsChannel);
    supabase.removeChannel(messagesChannel);
  };
};

// ============================================
// TYPING INDICATOR (Digitando...)
// ============================================

export interface TypingStatus {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/**
 * Enviar status de digitação para uma conversa
 * Usa Supabase Broadcast para enviar eventos em tempo real
 */
export const sendTypingStatus = (
  conversationId: string,
  userId: string,
  isTyping: boolean
) => {
  const channel = supabase.channel(`typing:${conversationId}`);

  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: {
      userId,
      isTyping,
      timestamp: Date.now()
    }
  });
};

/**
 * Subscribe para status de digitação em uma conversa
 * Retorna função para cancelar subscription
 */
export const subscribeToTypingStatus = (
  conversationId: string,
  currentUserId: string,
  callback: (isTyping: boolean, userId: string) => void
) => {
  console.log('⌨️ Inscrevendo para typing status:', conversationId);

  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      const { userId, isTyping } = payload.payload;

      // Ignorar eventos do próprio usuário
      if (userId !== currentUserId) {
        console.log('⌨️ Typing status recebido:', { userId, isTyping });
        callback(isTyping, userId);
      }
    })
    .subscribe((status) => {
      console.log('📡 Status da subscription de typing:', status);
    });

  return () => {
    console.log('❌ Cancelando subscription de typing');
    supabase.removeChannel(channel);
  };
};
