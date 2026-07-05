import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Gift, Image, Lock, Mic, MoreVertical, Phone, Plus, Search, Send, Shield } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SecurityStepsModal from '../components/SecurityStepsModal';
import SecurityStepsActiveModal from '../components/SecurityStepsActiveModal';
import { useToast } from '../hooks/use-toast';
import * as messagesService from '../services/messagesService';
import { supabase } from '../lib/supabase';
import { securityStepsService } from '../services/securityStepsService';
import { SECURITY_STEP_LABELS } from '../constants/securitySteps';
import type { SecurityStepId } from '../lib/security-steps';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  companionName: string;
  companionAvatar: string;
  contactPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

const ChatVip: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [securityStepsActive, setSecurityStepsActive] = useState<{ [key: string]: boolean }>({});
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showSecurityActiveModal, setShowSecurityActiveModal] = useState(false);
  const [isCompanionInConv, setIsCompanionInConv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const companionIdFromUrl = searchParams.get('to') || searchParams.get('companion_id');

  const [realConversations, setRealConversations] = useState<messagesService.Conversation[]>([]);
  const [realMessages, setRealMessages] = useState<messagesService.Message[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingInConversations, setTypingInConversations] = useState<{ [conversationId: string]: boolean }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutsRef = useRef<{ [conversationId: string]: NodeJS.Timeout }>({});
  const lastTypingSentRef = useRef<number>(0);
  const [, setTimeUpdate] = useState(0);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    if (hours < 48) return 'Ontem';
    return `${Math.floor(hours / 24)} dias`;
  };

  const conversations: Conversation[] = realConversations.map((conv) => {
    const isCompanion = currentUserId === conv.companion?.auth_user_id;
    const otherPersonName = isCompanion
      ? (conv.client?.name || 'Cliente')
      : (conv.companion?.display_name || conv.companion?.name || 'Sem nome');
    const otherPersonAvatar = isCompanion
      ? 'https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png'
      : (conv.companion?.image || 'https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png');
    const otherPersonPhone = isCompanion
      ? (conv.client?.phone || '')
      : (conv.companion?.phone || '');

    return {
      id: conv.id,
      companionName: otherPersonName,
      companionAvatar: otherPersonAvatar,
      contactPhone: otherPersonPhone,
      lastMessage: conv.last_message_text || '',
      lastMessageTime: conv.last_message_at ? formatTime(conv.last_message_at) : '',
      unreadCount: conv.unread_count || 0,
      online: false,
      messages: []
    };
  });

  const messages: Message[] = realMessages.map((msg) => ({
    id: msg.id,
    text: msg.text,
    senderId: msg.sender_id,
    timestamp: new Date(msg.created_at),
    read: msg.read
  }));

  const refreshConversations = async () => {
    if (!currentUserId) return;
    const convs = await messagesService.getUserConversationsFast(currentUserId);
    setRealConversations(convs);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Checking Supabase session:', session);

      if (session?.user) {
        setCurrentUserId(session.user.id);
        setLoading(false);
        return;
      }

      setCurrentUserId(null);
      setLoading(false);
      toast({
        title: 'Login necessario',
        description: 'Faca login para enviar mensagens',
        variant: 'destructive'
      });
      setTimeout(() => navigate('/login'), 2000);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        setCurrentUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const loadConversations = async () => {
      setLoading(true);
      await refreshConversations();
      setLoading(false);

      if (companionIdFromUrl) {
        try {
          const conversationId = await messagesService.getOrCreateConversation(currentUserId, companionIdFromUrl);
          if (conversationId) {
            setSelectedConversation(conversationId);
          }
        } catch (error: any) {
          console.error('Erro ao criar conversa:', error);
          toast({
            title: 'Erro ao iniciar conversa',
            description: error.message || 'Voce precisa ser um cliente para iniciar conversas',
            variant: 'destructive'
          });
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    };

    loadConversations();
  }, [currentUserId, companionIdFromUrl, navigate, toast]);

  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;

    const loadMessages = async () => {
      const msgs = await messagesService.getConversationMessages(selectedConversation);
      setRealMessages(msgs);

      if (currentUserId) {
        await messagesService.markMessagesAsRead(selectedConversation, currentUserId);
        setRealConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      }

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    loadMessages();
  }, [selectedConversation, currentUserId]);

  // Carrega etapas de segurança persistidas ao trocar de conversa + inicia listener Realtime
  useEffect(() => {
    if (!selectedConversation) return;

    // Determina se o usuário atual é a acompanhante nesta conversa
    const conv = realConversations.find((c) => c.id === selectedConversation);
    if (conv && currentUserId) {
      setIsCompanionInConv(currentUserId === conv.companion?.auth_user_id);
    }

    const loadSecuritySteps = async () => {
      const record = await securityStepsService.getByConversation(selectedConversation);
      setSecurityStepsActive((prev) => ({
        ...prev,
        [selectedConversation]: Boolean(record?.steps?.length)
      }));
    };

    loadSecuritySteps();

    // Listener Realtime: atualiza o botão quando o outro participante ativa as etapas
    const unsubscribe = securityStepsService.subscribeToChanges(
      selectedConversation,
      (record) => {
        setSecurityStepsActive((prev) => ({
          ...prev,
          [selectedConversation]: Boolean(record.steps?.length)
        }));
      }
    );

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, currentUserId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = messagesService.subscribeToMessages(selectedConversation, (newMessage) => {
      setRealMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    return unsubscribe;
  }, [selectedConversation]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = messagesService.subscribeToConversations(currentUserId, async () => {
      await refreshConversations();
    });

    return unsubscribe;
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;

    setIsOtherTyping(false);

    const unsubscribe = messagesService.subscribeToTypingStatus(
      selectedConversation,
      currentUserId,
      (isTyping: boolean) => {
        setIsOtherTyping(isTyping);

        if (isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, 3000);
        }
      }
    );

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation, currentUserId]);

  useEffect(() => {
    if (!currentUserId || realConversations.length === 0) return;

    const unsubscribeFns: (() => void)[] = [];

    realConversations.forEach((conv) => {
      const unsubscribe = messagesService.subscribeToTypingStatus(
        conv.id,
        currentUserId,
        (isTyping: boolean) => {
          setTypingInConversations((prev) => ({
            ...prev,
            [conv.id]: isTyping
          }));

          if (isTyping) {
            if (typingTimeoutsRef.current[conv.id]) {
              clearTimeout(typingTimeoutsRef.current[conv.id]);
            }
            typingTimeoutsRef.current[conv.id] = setTimeout(() => {
              setTypingInConversations((prev) => ({
                ...prev,
                [conv.id]: false
              }));
            }, 3000);
          }
        }
      );
      unsubscribeFns.push(unsubscribe);
    });

    return () => {
      unsubscribeFns.forEach((unsubscribe) => unsubscribe());
      Object.values(typingTimeoutsRef.current).forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current = {};
    };
  }, [currentUserId, realConversations]);

  const handleTyping = () => {
    if (!selectedConversation || !currentUserId) return;

    const now = Date.now();
    if (now - lastTypingSentRef.current > 1000) {
      lastTypingSentRef.current = now;
      messagesService.sendTypingStatus(selectedConversation, currentUserId, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        messagesService.sendTypingStatus(selectedConversation, currentUserId, false);
      }, 2000);
    }
  };

  const selectedConv = conversations.find((conversation) => conversation.id === selectedConversation);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const shouldLockScroll = Boolean(selectedConversation && window.innerWidth < 768);
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;

    const handleResize = () => {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }

    return undefined;
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !currentUserId) {
      return;
    }

    const newMessage = await messagesService.sendMessage(selectedConversation, currentUserId, messageText);

    if (newMessage) {
      setMessageText('');
      setRealConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
                ...conv,
                last_message_text: newMessage.text,
                last_message_at: newMessage.created_at,
                updated_at: newMessage.created_at,
              }
            : conv
        )
      );
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.companionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSecurityStepsConfirm = async (selectedSteps: SecurityStepId[]) => {
    if (!selectedConversation || !currentUserId) return;

    const persisted = await securityStepsService.activate(
      selectedConversation,
      currentUserId,
      selectedSteps
    );

    if (!persisted) {
      toast({
        title: 'Erro ao salvar etapas',
        description: 'Nao foi possivel ativar as etapas de seguranca agora.',
        variant: 'destructive'
      });
      return;
    }

    setSecurityStepsActive((prev) => ({
      ...prev,
      [selectedConversation]: persisted.steps.length > 0
    }));

    const stepNames = selectedSteps.map((id) => SECURITY_STEP_LABELS[id] || id);

    const safeSystemText = `[Seguranca] Etapas ativadas: ${stepNames.join(', ')}`;
    await messagesService.sendMessage(selectedConversation, currentUserId, safeSystemText);

    toast({
      title: 'Etapas de seguranca ativadas',
      description: `${stepNames.length} etapa${stepNames.length > 1 ? 's' : ''}: ${stepNames.join(', ')}`,
    });
    return;
    /*

      const systemText = `🔒 Etapas de Segurança Ativadas: ${stepNames.join(', ')}`;
      await messagesService.sendMessage(selectedConversation, currentUserId, safeSystemText);

    toast({
      title: 'Etapas de Segurança Ativadas',
      description: `${stepNames.length} etapa${stepNames.length > 1 ? 's' : ''}: ${stepNames.join(', ')}`,
    });
    */
  };

  const handleCallContact = () => {
    const phone = selectedConv?.contactPhone?.trim();
    if (!phone) {
      toast({
        title: 'Telefone indisponivel',
        description: 'Este contato ainda nao possui telefone cadastrado.',
        variant: 'destructive'
      });
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <style>{`
        #chat-vip-page,
        #chat-vip-page * {
          font-family: 'Poppins', sans-serif !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f3f4f6;
          border-radius: 20px;
        }
      `}</style>
      <div
        id="chat-vip-page"
        className={`${
          selectedConversation
            ? 'h-[calc(100dvh-4rem-64px)] md:h-[calc(100vh-4rem-70px)]'
            : 'h-[calc(100dvh-4rem-64px)] md:h-[calc(100vh-4rem-70px)]'
        } bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden`}
      >
        <div className="flex-1 flex overflow-hidden min-h-0">
          <aside className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 md:max-w-sm bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-col pt-0`}>
            <div className="h-20 px-5 border-b border-gray-100 dark:border-gray-700 flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-sm text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando conversas...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] p-8 text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Nenhuma conversa encontrada
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {searchTerm ? 'Tente buscar por outro nome' : 'Suas conversas aparecerao aqui'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex gap-3 hover:bg-pink-50 dark:hover:bg-gray-700 cursor-pointer border-l-4 transition-colors ${
                      selectedConversation === conv.id
                        ? 'border-pink-500 bg-pink-50/40 dark:bg-gray-700/50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.companionAvatar}
                        alt={conv.companionName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conv.companionName}
                        </h3>
                        <span className={`text-xs flex-shrink-0 ml-2 ${conv.unreadCount > 0 ? 'text-pink-500 font-medium' : 'text-gray-400'}`}>
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        {typingInConversations[conv.id] ? (
                          <p className="text-sm text-pink-500 font-medium animate-pulse">
                            digitando...
                          </p>
                        ) : (
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            {conv.lastMessage}
                          </p>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm flex-shrink-0 ml-2">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          {selectedConversation ? (
            <section className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-h-0 pt-0 fixed inset-x-0 bottom-[64px] top-[61px] md:static md:inset-auto">
              <div className="h-16 md:h-20 px-4 md:px-8 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <button className="p-2 md:hidden" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedConv?.companionAvatar}
                      alt="Avatar"
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {selectedConv?.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                      {selectedConv?.companionName}
                    </h2>
                    {isOtherTyping ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-pink-500 font-medium animate-pulse">digitando...</span>
                      </div>
                    ) : selectedConv?.online ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-pink-500 font-medium">Online agora</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium"
                    title="Voltar para mensagens"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Mensagens
                  </button>
                  <button
                    onClick={handleCallContact}
                    className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                    title="Ligar para o contato"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 transition-colors" title="Mais Opcoes">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar"
                style={{
                  backgroundColor: '#0b141a',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }}
              >
                <div className="flex justify-center w-full mb-8">
                  {securityStepsActive[selectedConversation || ''] ? (
                    <button
                      onClick={() => setShowSecurityActiveModal(true)}
                      className="flex items-center gap-3 px-8 py-3.5 rounded-2xl border-2 border-green-600/50 text-green-400 font-semibold bg-green-900/30 hover:bg-green-900/50 transition-all shadow-sm hover:shadow-md w-full max-w-md justify-center group"
                    >
                      <Shield className="h-5 w-5" />
                      Etapas de seguranca ativas - Ver detalhes
                      {/*
                      ✓ Etapas de Segurança Ativas — Ver detalhes
                      */}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSecurityModal(true)}
                      className="flex items-center gap-3 px-8 py-3.5 rounded-2xl border-2 border-pink-700/50 text-pink-400 font-semibold bg-pink-900/30 hover:bg-pink-900/50 transition-all shadow-sm hover:shadow-lg w-full max-w-md justify-center group"
                    >
                      <div className="relative">
                        <Shield className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <Lock className="h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      Ativar etapas de seguranca
                      {/*
                      Ativar Etapas de Segurança
                      */}
                    </button>
                  )}
                </div>

                <div className="flex justify-center pb-2">
                  <span className="text-xs font-medium text-gray-300 bg-[#182229] px-4 py-1.5 rounded-full shadow-sm">
                    Hoje
                  </span>
                </div>

                {messages.map((message) => {
                  const isUser = message.senderId === currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-4 items-end ${isUser ? 'justify-end' : ''}`}
                    >
                      {!isUser && (
                        <img
                          src={selectedConv?.companionAvatar}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full mb-1 object-cover"
                        />
                      )}
                      <div className={`flex flex-col gap-1 max-w-[65%] ${isUser ? 'items-end' : ''}`}>
                        <div
                          className={`px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed ${
                            isUser
                              ? 'bg-[#005c4b] rounded-tr-none shadow-sm text-white'
                              : 'bg-[#202c33] text-gray-100 rounded-tl-none shadow-md'
                          }`}
                        >
                          <p>{message.text}</p>
                        </div>
                        <span className={`text-[11px] text-gray-400/70 ${isUser ? 'mr-1' : 'ml-1'} flex items-center gap-1`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {isUser && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-pink-500">
                              <path d="M1 12L8 19L23 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isOtherTyping && (
                  <div className="flex gap-4 items-end">
                    <img
                      src={selectedConv?.companionAvatar}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full mb-1 object-cover"
                    />
                    <div className="px-5 py-3.5 rounded-3xl rounded-tl-none bg-[#202c33]">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="pb-4 md:pb-6 pt-2 px-3 md:px-6 bg-white dark:bg-gray-800 flex-shrink-0 border-t border-gray-100 dark:border-gray-700" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <p className="hidden md:block text-center text-xs text-gray-400 italic mb-3 font-medium tracking-wide">
                  Envie audios, fotos e videos com seguranca
                </p>
                <div className="flex items-center gap-2 md:gap-3 max-w-5xl mx-auto">
                  <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-pink-500 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all duration-200 shadow-sm hover:shadow-md" title="Enviar foto ou vídeo">
                    <Camera className="h-5 w-5" />
                  </button>
                  <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-pink-500 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all duration-200 shadow-sm hover:shadow-md" title="Enviar presente">
                    <Gift className="h-5 w-5" />
                  </button>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 md:px-6 py-2.5 md:py-3 border border-transparent focus-within:border-pink-500/30 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all shadow-inner">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      onFocus={(e) => {
                        e.target.scrollIntoView = () => {};
                        setTimeout(() => {
                          scrollToBottom();
                        }, 300);
                      }}
                      className="bg-transparent border-none outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm md:text-base"
                    />
                  </div>
                  {messageText.trim() ? (
                    <button
                      onClick={handleSendMessage}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Enviar mensagem"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  ) : (
                    <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-pink-500 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all duration-200 shadow-sm hover:shadow-md" title="Gravar áudio">
                      <Mic className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-16 h-16 text-pink-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Suas Mensagens
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Selecione uma conversa para comecar a conversar
                </p>
              </div>
            </div>
          )}
        </div>

        <SecurityStepsModal
          open={showSecurityModal}
          onOpenChange={setShowSecurityModal}
          onConfirm={handleSecurityStepsConfirm}
          conversationId={selectedConversation ?? undefined}
          activatedBy={currentUserId ?? undefined}
          currentUserId={currentUserId ?? undefined}
          isCompanion={isCompanionInConv}
          peerName={selectedConv?.companionName}
        />

        {selectedConversation && currentUserId && (
          <SecurityStepsActiveModal
            isOpen={showSecurityActiveModal}
            onClose={() => setShowSecurityActiveModal(false)}
            conversationId={selectedConversation}
            currentUserId={currentUserId}
            isCompanion={isCompanionInConv}
            peerName={selectedConv?.companionName}
            onManageSteps={() => {
              setShowSecurityActiveModal(false);
              setShowSecurityModal(true);
            }}
          />
        )}
      </div>
    </>
  );
};

export default ChatVip;
