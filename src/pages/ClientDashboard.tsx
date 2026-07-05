import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import * as messagesService from '../services/messagesService';
import { supabase, type Client } from '../lib/supabase';
import { Heart, User, MessageSquare, MessagesSquare, Search, Lock, ShieldCheck, MapPin, ChevronRight, Compass, Edit3, Phone, Mail } from 'lucide-react';
import ClientProfileModal from '../components/ClientProfileModal';

interface RecentConversation {
  id: string;
  name: string;
  message: string;
  time: string;
  online: boolean;
  avatar: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocationContext();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('inicio');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [clientAvatar, setClientAvatar] = useState('');

  // Função para formatar tempo relativo
  const formatRelativeTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'agora';
    } else if (minutes < 60) {
      return `há ${minutes} min`;
    } else if (hours < 24) {
      return `há ${hours}h`;
    } else if (days === 1) {
      return 'ontem';
    } else if (days < 7) {
      return `há ${days} dias`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setCurrentUserId(session.user.id);
        setClientAvatar(session.user.user_metadata?.avatar_url || '');
      }

      const userDataString = localStorage.getItem('user');

      if (!userDataString) {
        navigate('/client-login');
        return;
      }

      try {
        const userData = JSON.parse(userDataString);

        if (userData.type !== 'client') {
          navigate('/');
          return;
        }

        setUserName(userData.name || 'Usuário');

        if (!session?.user) {
          setCurrentUserId(userData.id || userData.user_id);
        }

        const clientId = session?.user?.id || userData.id || userData.user_id;
        if (clientId) {
          const { data: clientData, error: clientError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', clientId)
            .single();

          if (!clientError && clientData) {
            setClientProfile(clientData as Client);
            setUserName(clientData.name || userData.name || 'Usuário');
            setClientAvatar((clientData as Client).avatar_url || session?.user?.user_metadata?.avatar_url || '');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        navigate('/client-login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadRecentConversations = async () => {
      setLoadingConversations(true);
      try {
        const conversations = await messagesService.getUserConversations(currentUserId);

        const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
        setUnreadMessages(totalUnread);

        const recent: RecentConversation[] = conversations.slice(0, 3).map(conv => ({
          id: conv.id,
          name: conv.companion?.display_name || conv.companion?.name || 'Acompanhante',
          message: conv.last_message_text || 'Nenhuma mensagem ainda',
          time: conv.last_message_at ? formatRelativeTime(conv.last_message_at) : '',
          online: false,
          avatar: conv.companion?.image || 'https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png'
        }));

        setRecentConversations(recent);
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      } finally {
        setLoadingConversations(false);
      }
    };

    loadRecentConversations();
  }, [currentUserId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  const handleClientSaved = (updatedClient: Client) => {
    setClientProfile(updatedClient);
    setUserName(updatedClient.name || 'Usuário');
    setClientAvatar(updatedClient.avatar_url || '');

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          name: updatedClient.name || parsedUser.name,
          email: updatedClient.email || parsedUser.email,
          phone: updatedClient.phone || parsedUser.phone,
          avatar_url: updatedClient.avatar_url || parsedUser.avatar_url,
        }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Erro ao sincronizar localStorage do cliente:', error);
    }
  };

  const [allConversations, setAllConversations] = useState<RecentConversation[]>([]);
  const [loadingAllConversations, setLoadingAllConversations] = useState(false);
  const [messageFilter, setMessageFilter] = useState<'todos' | 'nao_lidas' | 'online'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const [favOnlineFilter, setFavOnlineFilter] = useState(false);

  const handleSidebarClick = (id: string) => {
    setActiveTab(id);
    // Mensagens agora renderiza inline no desktop
  };

  // Carregar todas as conversas quando aba mensagens for selecionada
  useEffect(() => {
    if (activeTab !== 'mensagens' || !currentUserId) return;

    const loadAllConversations = async () => {
      setLoadingAllConversations(true);
      try {
        const conversations = await messagesService.getUserConversations(currentUserId);

        const all: RecentConversation[] = conversations.map(conv => ({
          id: conv.id,
          name: conv.companion?.display_name || conv.companion?.name || 'Acompanhante',
          message: conv.last_message_text || 'Nenhuma mensagem ainda',
          time: conv.last_message_at ? formatRelativeTime(conv.last_message_at) : '',
          online: false,
          avatar: conv.companion?.image || 'https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png'
        }));

        setAllConversations(all);
      } catch (error) {
        console.error('Erro ao carregar todas as conversas:', error);
      } finally {
        setLoadingAllConversations(false);
      }
    };

    loadAllConversations();
  }, [activeTab, currentUserId]);

  // ============================================================
  // MOBILE LAYOUT
  // ============================================================
  const renderMobile = () => (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] text-white antialiased md:hidden">
      {/* Mobile Header - sticky com backdrop blur */}
      <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg leading-tight" style={{ fontWeight: 600 }}>
            Bem-vindo de volta, {userName}
          </h1>
          <div className="flex items-center gap-1 text-[#94a3b8] text-xs mt-0.5">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>{selectedCity?.name || 'Recife'} – {selectedCity?.state || 'PE'}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {clientAvatar ? (
            <img
              src={clientAvatar}
              alt="Foto do cliente"
              className="w-10 h-10 rounded-full border-2 border-[#d91d83]/30 object-cover mb-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-[#d91d83]/30 bg-gradient-to-r from-[#d91d83] to-purple-500 flex items-center justify-center mb-1">
              <User className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
          )}
          <span className="text-[9px] text-[#d91d83] uppercase tracking-wider" style={{ fontWeight: 700 }}>
            Premium
          </span>
        </div>
      </header>

      {/* Mobile Main Content */}
      <main className="flex-1 px-5 py-6 space-y-6 overflow-x-hidden">
        {/* Ver minhas conversas - card grande */}
        <div
          className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 flex items-center justify-between active:scale-[0.98] transition-transform"
          onClick={() => navigate('/mensagens')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#d91d83]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#d91d83]">chat</span>
            </div>
            <div>
              <h2 className="text-base" style={{ fontWeight: 700 }}>Ver minhas conversas</h2>
              {unreadMessages > 0 && (
                <div className="mt-1">
                  <span className="px-2 py-0.5 bg-[#d91d83] text-[9px] tracking-tight rounded-full uppercase" style={{ fontWeight: 700 }}>
                    {unreadMessages} {unreadMessages === 1 ? 'nova mensagem' : 'novas mensagens'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <span className="material-symbols-outlined text-white/20">chevron_right</span>
        </div>

        {/* Grid 2 colunas - Explorar + Favoritos */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#d91d83]">
              <Compass className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm" style={{ fontWeight: 700 }}>Explorar {selectedCity?.name || 'Recife'}</h3>
          </div>

          <div
            className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#d91d83]">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm" style={{ fontWeight: 700 }}>Meus Favoritos</h3>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#94a3b8]" style={{ fontWeight: 700 }}>
                Minha conta
              </p>
              <h3 className="mt-2 text-base text-white" style={{ fontWeight: 700 }}>
                {clientProfile?.name || userName}
              </h3>
              <div className="mt-3 space-y-2 text-xs text-[#94a3b8]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#d91d83]" />
                  <span>{clientProfile?.email || 'Email não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#d91d83]" />
                  <span>{clientProfile?.phone || 'Telefone não informado'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEditProfile(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#d91d83] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#bf166f]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
        </div>

        {/* Conversas Recentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#d91d83]" strokeWidth={1.5} />
              <h3 className="text-sm text-white uppercase tracking-wide" style={{ fontWeight: 600 }}>Conversas Recentes</h3>
            </div>
            <button
              onClick={() => navigate('/mensagens')}
              className="text-[#d91d83] text-sm hover:underline"
              style={{ fontWeight: 500 }}
            >
              Ver todo o histórico
            </button>
          </div>

          <div className="space-y-2">
            {loadingConversations ? (
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-xs text-[#94a3b8] mt-2" style={{ fontWeight: 400 }}>Carregando conversas...</p>
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[#94a3b8]">chat</span>
                </div>
                <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Nenhuma conversa ainda</p>
                <p className="text-xs text-[#94a3b8]" style={{ fontWeight: 400 }}>Explore o catálogo e inicie uma conversa!</p>
              </div>
            ) : (
              recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
                  onClick={() => navigate('/mensagens')}
                >
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1A1A1A] rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white" style={{ fontWeight: 500 }}>{conv.name}</p>
                    <p className="text-xs text-[#94a3b8] truncate" style={{ fontWeight: 400 }}>{conv.message}</p>
                  </div>
                  <span className="text-xs text-[#94a3b8] flex-shrink-0" style={{ fontWeight: 500 }}>{conv.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Primeiros Passos no Hub */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xs text-[#94a3b8] uppercase tracking-widest" style={{ fontWeight: 600 }}>Primeiros Passos no Hub</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[#94a3b8]" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm text-white mb-2" style={{ fontWeight: 600 }}>Explore o catálogo</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed" style={{ fontWeight: 400 }}>
                Encontre o perfil perfeito usando filtros avançados por localização e categoria.
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#94a3b8]" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm text-white mb-2" style={{ fontWeight: 600 }}>Inicie um chat seguro</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed" style={{ fontWeight: 400 }}>
                Nossa plataforma garante privacidade total. Suas mensagens são criptografadas.
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-[#94a3b8]" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm text-white mb-2" style={{ fontWeight: 600 }}>Mantenha o respeito</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed" style={{ fontWeight: 400 }}>
                Siga as diretrizes da comunidade para garantir uma experiência premium a todos.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Button - mobile */}
      <div className="px-5 pb-6">
        <button
          onClick={handleLogout}
          className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl py-4 text-red-400 hover:bg-red-400/5 transition text-sm flex items-center justify-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sair da conta
        </button>
      </div>
    </div>
  );

  // ============================================================
  // DESKTOP LAYOUT (mantido como estava)
  // ============================================================
  const renderDesktop = () => (
    <div className="hidden md:flex min-h-screen bg-[#0d0d0f] text-white antialiased">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0d0d0f] border-r border-white/5 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="px-8 py-6 mb-2">
          <div className="flex items-center">
            <span className="text-white text-lg font-bold">Pink</span>
            <span className="text-[#d91d83] text-lg font-bold">House</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {[
            { id: 'inicio', icon: 'home', label: 'Início' },
            { id: 'mensagens', icon: 'chat', label: 'Mensagens', badge: unreadMessages },
            { id: 'favoritos', icon: 'favorite', label: 'Favoritos' },
            { id: 'conta', icon: 'person', label: 'Conta' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`flex items-center gap-4 px-8 py-4 cursor-pointer transition-all duration-200 relative ${
                activeTab === item.id
                  ? 'text-[#d91d83] bg-[#d91d83]/5 border-r-2 border-[#d91d83]'
                  : 'text-[#6b7280] hover:text-white hover:bg-white/5 border-r-2 border-transparent'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}
              >{item.icon}</span>
              <span className="text-sm" style={{ fontWeight: activeTab === item.id ? 600 : 500 }}>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto w-5 h-5 bg-[#d91d83] text-[10px] text-white flex items-center justify-center rounded-full" style={{ fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-8 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 py-3 text-[#6b7280] hover:text-red-400 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span style={{ fontWeight: 500 }}>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0f]">
        {activeTab === 'mensagens' ? (
          /* ============================================ */
          /* MENSAGENS TAB - Minhas Conversas             */
          /* ============================================ */
          <>
            {/* Header - Minhas Conversas */}
            <header className="h-32 px-10 flex items-center justify-between border-b border-white/5 bg-[#0d0d0f]/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h1 className="text-3xl text-white" style={{ fontWeight: 700 }}>
                  Minhas Conversas
                </h1>
                <p className="text-sm text-[#6b7280] mt-1" style={{ fontWeight: 400 }}>
                  {allConversations.length} {allConversations.length === 1 ? 'conversa' : 'conversas'} • {unreadMessages} não {unreadMessages === 1 ? 'lida' : 'lidas'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm text-white" style={{ fontWeight: 500 }}>{userName}</span>
                  <span className="text-xs text-[#d91d83]" style={{ fontWeight: 500 }}>Plano Premium</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d91d83] to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </header>

            {/* Search & Filters */}
            <div className="px-10 py-6 border-b border-white/5">
              {/* Search Bar */}
              <div className="relative mb-5">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#6b7280]">search</span>
                <input
                  type="text"
                  placeholder="Buscar conversa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/5 rounded-full py-3 pl-12 pr-5 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#d91d83]/30 transition-all"
                  style={{ fontWeight: 400 }}
                />
              </div>

              {/* Filter Chips */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMessageFilter('todos')}
                  className={`px-5 py-2 rounded-full text-xs transition-all ${
                    messageFilter === 'todos'
                      ? 'bg-[#d91d83] text-white'
                      : 'bg-[#18181b] text-[#6b7280] border border-white/5 hover:text-white'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  Todos
                </button>
                <button
                  onClick={() => setMessageFilter('nao_lidas')}
                  className={`px-5 py-2 rounded-full text-xs transition-all ${
                    messageFilter === 'nao_lidas'
                      ? 'bg-[#d91d83] text-white'
                      : 'bg-[#18181b] text-[#6b7280] border border-white/5 hover:text-white'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  Não lidas
                </button>
                <button
                  onClick={() => setMessageFilter('online')}
                  className={`px-5 py-2 rounded-full text-xs transition-all flex items-center gap-2 ${
                    messageFilter === 'online'
                      ? 'bg-[#d91d83] text-white'
                      : 'bg-[#18181b] text-[#6b7280] border border-white/5 hover:text-white'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online agora
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <section className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-3">
              {loadingAllConversations ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-sm text-[#6b7280]" style={{ fontWeight: 400 }}>Carregando conversas...</p>
                </div>
              ) : allConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-[#6b7280]">chat</span>
                  </div>
                  <p className="text-lg text-white mb-2" style={{ fontWeight: 600 }}>Nenhuma conversa ainda</p>
                  <p className="text-sm text-[#6b7280]" style={{ fontWeight: 400 }}>Explore o catálogo e inicie uma conversa!</p>
                </div>
              ) : (
                allConversations
                  .filter(conv => {
                    if (searchQuery) {
                      return conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             conv.message.toLowerCase().includes(searchQuery.toLowerCase());
                    }
                    if (messageFilter === 'online') return conv.online;
                    return true;
                  })
                  .map((conv) => (
                    <div
                      key={conv.id}
                      className="bg-[#18181b] border border-white/5 rounded-2xl p-5 hover:bg-[#1f1f23] hover:border-[#d91d83]/10 transition-all cursor-pointer flex items-center gap-4"
                      onClick={() => navigate('/mensagens')}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#18181b] rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-white" style={{ fontWeight: 600 }}>{conv.name}</p>
                          <span className="text-xs text-[#6b7280] flex-shrink-0 ml-4" style={{ fontWeight: 500 }}>{conv.time}</span>
                        </div>
                        <p className="text-xs text-[#6b7280] truncate" style={{ fontWeight: 400 }}>{conv.message}</p>
                      </div>
                      <span className="material-symbols-outlined text-[20px] text-white/10 ml-2">chevron_right</span>
                    </div>
                  ))
              )}
            </section>

            {/* Footer - Encryption Info */}
            <footer className="px-10 py-4 border-t border-white/5 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-[#6b7280]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span className="text-xs" style={{ fontWeight: 400 }}>Chat Criptografado</span>
              </div>
              <div className="flex items-center gap-2 text-[#6b7280]">
                <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                <span className="text-xs" style={{ fontWeight: 400 }}>Modo Discreto Ativo</span>
              </div>
            </footer>
          </>
        ) : activeTab === 'favoritos' ? (
          /* ============================================ */
          /* FAVORITOS TAB - Meus Favoritos               */
          /* ============================================ */
          <>
            {/* Header - Meus Favoritos */}
            <header className="h-24 px-12 flex items-center justify-between border-b border-white/5">
              <div>
                <h1 className="text-2xl text-white" style={{ fontWeight: 700 }}>
                  Meus Favoritos
                </h1>
                <p className="text-sm text-[#94a3b8] mt-1" style={{ fontWeight: 400 }}>
                  Acompanhantes que você salvou para acesso rápido
                </p>
              </div>

              <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#94a3b8]">search</span>
                  <input
                    type="text"
                    placeholder="Pesquisar favoritos..."
                    value={favSearchQuery}
                    onChange={(e) => setFavSearchQuery(e.target.value)}
                    className="bg-[#16161a] border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm w-64 text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#d91d83] transition-colors"
                    style={{ fontWeight: 400 }}
                  />
                </div>

                {/* Online filter */}
                <button
                  onClick={() => setFavOnlineFilter(!favOnlineFilter)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm transition-colors ${
                    favOnlineFilter
                      ? 'bg-[#d91d83] border-[#d91d83] text-white'
                      : 'bg-[#16161a] border-white/5 text-white hover:bg-[#1e1e24]'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online agora
                </button>

                <div className="h-10 w-[1px] bg-white/5"></div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d91d83] to-purple-500 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </header>

            {/* Grid de Favoritos */}
            <div className="p-12 overflow-y-auto flex-1 custom-scrollbar">
              {/* Empty state - nenhum favorito salvo */}
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-[#16161a] rounded-full flex items-center justify-center mb-6">
                  <span
                    className="material-symbols-outlined text-[40px] text-[#94a3b8]"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >favorite</span>
                </div>
                <h2 className="text-xl text-white mb-2" style={{ fontWeight: 600 }}>
                  Nenhum favorito ainda
                </h2>
                <p className="text-sm text-[#94a3b8] mb-6 text-center max-w-md" style={{ fontWeight: 400 }}>
                  Explore o catálogo e salve suas acompanhantes preferidas para acessá-las rapidamente.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#d91d83] text-white rounded-full text-sm hover:bg-[#d91d83]/90 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                  Explorar catálogo
                </button>
              </div>
            </div>
          </>
        ) : activeTab === 'conta' ? (
          /* ============================================ */
          /* CONTA TAB - Account Settings                 */
          /* ============================================ */
          <>
            <header className="h-24 px-12 flex items-center justify-between border-b border-white/5">
              <div>
                <h1 className="text-2xl text-white" style={{ fontWeight: 700 }}>Minha Conta</h1>
                <p className="text-sm text-[#6b7280] mt-1" style={{ fontWeight: 400 }}>Gerencie suas informações pessoais</p>
              </div>
            </header>
            <section className="p-12 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              {/* Profile Card */}
              <div className="bg-[#18181b] border border-white/5 rounded-2xl p-8 flex items-center gap-6">
                {clientAvatar ? (
                  <img
                    src={clientAvatar}
                    alt="Foto do cliente"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#d91d83] to-purple-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl text-white" style={{ fontWeight: 700 }}>{userName}</h2>
                  <p className="text-sm text-[#6b7280]" style={{ fontWeight: 400 }}>{clientProfile?.email || 'Email não informado'}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-[#d91d83]/10 text-[#d91d83] text-xs rounded-full" style={{ fontWeight: 600 }}>Cliente</span>
                </div>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#d91d83]/30 px-4 py-2 text-sm font-semibold text-[#d91d83] transition hover:bg-[#d91d83]/10"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar dados
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]" style={{ fontWeight: 700 }}>Email</p>
                  <div className="mt-3 flex items-center gap-3 text-white">
                    <Mail className="w-4 h-4 text-[#d91d83]" />
                    <span className="text-sm" style={{ fontWeight: 500 }}>{clientProfile?.email || 'Não informado'}</span>
                  </div>
                </div>
                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]" style={{ fontWeight: 700 }}>Telefone</p>
                  <div className="mt-3 flex items-center gap-3 text-white">
                    <Phone className="w-4 h-4 text-[#d91d83]" />
                    <span className="text-sm" style={{ fontWeight: 500 }}>{clientProfile?.phone || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="bg-[#18181b] border border-white/5 rounded-2xl p-6 hover:bg-[#1f1f23] transition cursor-pointer"
                  onClick={() => handleSidebarClick('mensagens')}
                >
                  <MessageSquare className="w-6 h-6 text-[#d91d83] mb-3" strokeWidth={1.5} />
                  <h3 className="text-sm text-white mb-1" style={{ fontWeight: 600 }}>Minhas Mensagens</h3>
                  <p className="text-xs text-[#6b7280]" style={{ fontWeight: 400 }}>
                    {unreadMessages > 0 ? `${unreadMessages} mensagens não lidas` : 'Sem mensagens novas'}
                  </p>
                </div>
                <div
                  className="bg-[#18181b] border border-white/5 rounded-2xl p-6 hover:bg-[#1f1f23] transition cursor-pointer"
                  onClick={() => handleSidebarClick('favoritos')}
                >
                  <Heart className="w-6 h-6 text-[#d91d83] mb-3" strokeWidth={1.5} />
                  <h3 className="text-sm text-white mb-1" style={{ fontWeight: 600 }}>Meus Favoritos</h3>
                  <p className="text-xs text-[#6b7280]" style={{ fontWeight: 400 }}>Acesse perfis salvos</p>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#d91d83]" strokeWidth={1.5} />
                  <h3 className="text-sm text-white" style={{ fontWeight: 600 }}>Privacidade e Segurança</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#6b7280]" style={{ fontWeight: 400 }}>Chat criptografado</span>
                    <span className="text-xs text-green-400" style={{ fontWeight: 600 }}>Ativo</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#6b7280]" style={{ fontWeight: 400 }}>Modo discreto</span>
                    <span className="text-xs text-green-400" style={{ fontWeight: 600 }}>Ativo</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#6b7280]" style={{ fontWeight: 400 }}>Histórico protegido</span>
                    <span className="text-xs text-green-400" style={{ fontWeight: 600 }}>Ativo</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-[#18181b] border border-white/5 rounded-2xl py-4 text-red-400 hover:bg-red-400/5 transition text-sm flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Sair da conta
              </button>
            </section>
          </>
        ) : (
          /* ============================================ */
          /* INÍCIO TAB - Dashboard Home                  */
          /* ============================================ */
          <>
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-white/5">
              <div>
                <h1 className="text-2xl text-white" style={{ fontWeight: 700 }}>
                  Bem-vindo de volta, {userName}
                </h1>
                <div className="flex items-center gap-1 text-[#6b7280] text-sm mt-1">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  <span style={{ fontWeight: 400 }}>{selectedCity?.name || 'Recife'} – {selectedCity?.state || 'PE'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm text-white" style={{ fontWeight: 500 }}>{userName}</span>
                  <span className="text-xs text-[#d91d83]" style={{ fontWeight: 500 }}>Plano Premium</span>
                </div>

                {clientAvatar ? (
                  <img
                    src={clientAvatar}
                    alt="Foto do cliente"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d91d83] to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </header>

            {/* Content Section */}
            <section className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Ver minhas conversas */}
                <div
                  className="lg:col-span-2 bg-[#18181b] rounded-2xl p-6 hover:bg-[#1f1f23] transition cursor-pointer flex items-center justify-between"
                  onClick={() => handleSidebarClick('mensagens')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center">
                      <MessagesSquare className="w-6 h-6 text-[#d91d83]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-lg text-white" style={{ fontWeight: 700 }}>Ver minhas conversas</h2>
                      <p className="text-[#6b7280] text-sm" style={{ fontWeight: 400 }}>
                        Continue conversas abertas ou inicie uma nova agora mesmo.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadMessages > 0 && (
                      <div className="bg-[#d91d83] text-white text-xs px-3 py-1.5 rounded-full" style={{ fontWeight: 700 }}>
                        {unreadMessages} {unreadMessages === 1 ? 'NOVA MENSAGEM' : 'NOVAS MENSAGENS'}
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-[#6b7280]" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Quick Cards */}
                <div className="space-y-4">
                  <div
                    className="bg-[#18181b] rounded-2xl p-4 hover:bg-[#1f1f23] transition cursor-pointer flex items-center gap-3"
                    onClick={() => navigate('/')}
                  >
                    <div className="w-10 h-10 bg-[#d91d83]/10 rounded-full flex items-center justify-center">
                      <Search className="w-5 h-5 text-[#d91d83]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>Explorar {selectedCity?.name || 'Recife'}</p>
                      <p className="text-xs text-[#6b7280]" style={{ fontWeight: 400 }}>142 novas acompanhantes</p>
                    </div>
                  </div>

                  <div
                    className="bg-[#18181b] rounded-2xl p-4 hover:bg-[#1f1f23] transition cursor-pointer flex items-center gap-3"
                    onClick={() => handleSidebarClick('favoritos')}
                  >
                    <div className="w-10 h-10 bg-[#d91d83]/10 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#d91d83]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>Meus Favoritos</p>
                      <p className="text-xs text-[#6b7280]" style={{ fontWeight: 400 }}>12 perfis salvos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversas Recentes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#d91d83]" strokeWidth={1.5} />
                    <h3 className="text-sm text-white uppercase tracking-wide" style={{ fontWeight: 600 }}>Conversas Recentes</h3>
                  </div>
                  <button
                    onClick={() => handleSidebarClick('mensagens')}
                    className="text-[#d91d83] text-sm hover:underline"
                    style={{ fontWeight: 500 }}
                  >
                    Ver todo o histórico
                  </button>
                </div>

                <div className="space-y-2">
                  {loadingConversations ? (
                    <div className="bg-[#18181b] rounded-2xl p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#d91d83] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-2" style={{ fontWeight: 400 }}>Carregando conversas...</p>
                    </div>
                  ) : recentConversations.length === 0 ? (
                    <div className="bg-[#18181b] rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessagesSquare className="w-6 h-6 text-[#6b7280]" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Nenhuma conversa ainda</p>
                      <p className="text-xs text-[#6b7280]" style={{ fontWeight: 400 }}>Explore o catálogo e inicie uma conversa!</p>
                    </div>
                  ) : (
                    recentConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="bg-[#18181b] rounded-2xl p-4 hover:bg-[#1f1f23] transition cursor-pointer flex items-center gap-4"
                        onClick={() => handleSidebarClick('mensagens')}
                      >
                        <div className="relative">
                          <img
                            src={conv.avatar}
                            alt={conv.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#18181b] rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white" style={{ fontWeight: 500 }}>{conv.name}</p>
                          <p className="text-xs text-[#6b7280] truncate" style={{ fontWeight: 400 }}>{conv.message}</p>
                        </div>
                        <span className="text-xs text-[#6b7280] flex-shrink-0" style={{ fontWeight: 500 }}>{conv.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Primeiros Passos no Hub */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xs text-[#6b7280] uppercase tracking-widest" style={{ fontWeight: 600 }}>Primeiros Passos no Hub</h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#18181b] rounded-2xl p-6 text-center hover:bg-[#1f1f23] transition">
                    <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-[#6b7280]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-sm text-white mb-2" style={{ fontWeight: 600 }}>Explore o catálogo</h4>
                    <p className="text-xs text-[#6b7280] leading-relaxed" style={{ fontWeight: 400 }}>
                      Encontre o perfil perfeito usando filtros avançados por localização e categoria.
                    </p>
                  </div>

                  <div className="bg-[#18181b] rounded-2xl p-6 text-center hover:bg-[#1f1f23] transition">
                    <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-6 h-6 text-[#6b7280]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-sm text-white mb-2" style={{ fontWeight: 600 }}>Inicie um chat seguro</h4>
                    <p className="text-xs text-[#6b7280] leading-relaxed" style={{ fontWeight: 400 }}>
                      Nossa plataforma garante privacidade total. Suas mensagens são criptografadas.
                    </p>
                  </div>

                  <div className="bg-[#18181b] rounded-2xl p-6 text-center hover:bg-[#1f1f23] transition">
                    <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-6 h-6 text-[#6b7280]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-sm text-white mb-2" style={{ fontWeight: 600 }}>Mantenha o respeito</h4>
                    <p className="text-xs text-[#6b7280] leading-relaxed" style={{ fontWeight: 400 }}>
                      Siga as diretrizes da comunidade para garantir uma experiência premium a todos.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );

  return (
    <>
      {renderMobile()}
      {renderDesktop()}

      {clientProfile && (
        <ClientProfileModal
          client={clientProfile}
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onSaved={handleClientSaved}
        />
      )}

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        * {
          font-family: 'Poppins', sans-serif !important;
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined' !important;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </>
  );
};

export default ClientDashboard;
