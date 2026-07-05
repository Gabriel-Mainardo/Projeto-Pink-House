import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Home, Zap, Mail, Wallet, Lock, Sparkles } from 'lucide-react';
import { RegistrationModal } from './RegistrationModal';
import { useToast } from '../hooks/use-toast';
import { getTotalUnreadCount } from '../services/messagesService';
import { supabase } from '../lib/supabase';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isCompanion, setIsCompanion] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Verificar se está logado e tipo de usuário
  React.useEffect(() => {
    const checkUserStatus = () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setIsLoggedIn(parsedUser.isLoggedIn || false);
          setIsCompanion(parsedUser.type === 'companion');
          setIsClient(parsedUser.type === 'client');
          setProfileImage(parsedUser.image || null);
        } catch {
          setIsLoggedIn(false);
          setIsCompanion(false);
          setIsClient(false);
          setProfileImage(null);
        }
      } else {
        setIsLoggedIn(false);
        setIsCompanion(false);
        setIsClient(false);
        setProfileImage(null);
      }
    };

    checkUserStatus();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === null) {
        checkUserStatus();
      }
    };

    // Listener customizado para mudanças no mesmo tab
    const handleCustomStorageChange = () => {
      checkUserStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogout', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogout', handleCustomStorageChange);
    };
  }, [location.pathname]);

  // Detectar scroll para esconder/mostrar barra
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Verificar se está perto do final da página (100px de margem)
      const isNearBottom = windowHeight + currentScrollY >= documentHeight - 100;

      // Se rolar mais de 10px
      if (currentScrollY > 10) {
        // Se está no final da página, sempre mostrar
        if (isNearBottom) {
          setIsVisible(true);
        }
        // Rolando para baixo - esconder
        else if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        }
        // Rolando para cima - mostrar
        else {
          setIsVisible(true);
        }
      } else {
        // No topo - sempre mostrar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Buscar contagem de mensagens não lidas
  React.useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchUnread = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) { setUnreadCount(0); return; }
      const count = await getTotalUnreadCount(session.user.id);
      setUnreadCount(count);

      // Realtime: escutar novas mensagens
      channel = supabase
        .channel('unread-messages-badge')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
          const cnt = await getTotalUnreadCount(session.user.id);
          setUnreadCount(cnt);
        })
        .subscribe();
    };

    if (isLoggedIn) fetchUnread();
    else setUnreadCount(0);

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isLoggedIn, location.pathname]);

  // Adicionar padding-bottom ao body para evitar sobreposição
  React.useEffect(() => {
    // Ajustar padding baseado no tamanho da tela
    const updatePadding = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint
      document.body.style.paddingBottom = isMobile ? '64px' : '70px';
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);

    return () => {
      document.body.style.paddingBottom = '0';
      window.removeEventListener('resize', updatePadding);
    };
  }, []);

  // Tabs base que aparecem para todos
  const baseTabs = [
    {
      id: 'inicio',
      label: 'Início',
      icon: Home,
      path: '/',
      locked: false
    }
  ];

  // Tab de Subidas - apenas para acompanhantes logadas
  const subidasTab = {
    id: 'subidas',
    label: 'Subidas',
    icon: Zap,
    path: '/subidas',
    locked: false
  };

  // Tab de Mensagens
  const mensagensTab = {
    id: 'mensagens',
    label: 'Mensagens',
    icon: Mail,
    path: '/mensagens',
    locked: false
  };

  // Tab Pink IA
  const pinkTab = {
    id: 'pink',
    label: 'Pink IA',
    icon: Sparkles,
    path: '',
    locked: false
  };

  // Tabs finais
  const endTabs = [
    {
      id: 'carteira',
      label: 'Carteira',
      icon: Wallet,
      path: '/wallet',
      locked: true
    },
    {
      id: 'conta',
      label: isLoggedIn ? 'Conta' : 'Cadastre-se',
      icon: Settings,
      path: isLoggedIn
        ? (isClient ? '/client-dashboard' : '/companion-dashboard')
        : '/register',
      locked: false
    }
  ];

  // Montar tabs dinamicamente
  // Companions: Início, Mensagens, Subidas(float), Pink IA, Conta
  // Outros: Início, Mensagens, Pink IA, Carteira, Conta
  const tabs = isCompanion
    ? [...baseTabs, mensagensTab, subidasTab, pinkTab, endTabs[1]]
    : [...baseTabs, mensagensTab, pinkTab, ...endTabs];

  const getActiveTab = () => {
    const currentPath = location.pathname;

    if (currentPath === '/') {
      return 'inicio';
    }
    if (currentPath.includes('subidas')) {
      return 'subidas';
    }
    if (currentPath.includes('mensagens')) {
      return 'mensagens';
    }
    if (currentPath.includes('wallet') || currentPath.includes('carteira')) {
      return 'carteira';
    }
    if (currentPath.includes('profile') || currentPath.includes('dashboard') || currentPath.includes('client-dashboard')) {
      return 'conta';
    }

    return 'inicio'; // default
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.locked) {
      toast({ title: '🔒 Em desenvolvimento', description: 'Esta funcionalidade estará disponível em breve!' });
      return;
    }
    if (tab.id === 'pink') {
      window.dispatchEvent(new CustomEvent('openPinkChat'));
      return;
    }
    if (tab.id === 'conta' && !isLoggedIn) {
      navigate('/client-login');
    } else {
      navigate(tab.path);
    }
  };

  // Esconder barra de navegação em páginas de autenticação e registro
  const hiddenPaths = [
    '/indique-ganhe',
    '/auth-register',
    '/auth/callback',
    '/basic-info-register',
    '/location-register',
    '/login'
  ];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <>
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb shadow-2xl transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex justify-between items-center h-[64px] sm:h-[70px] px-2 sm:px-6 md:px-20 lg:px-40 xl:px-56 max-w-[1800px] mx-auto relative">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          const isSubidas = tab.id === 'subidas';
          const beforeSubidas = isCompanion && index === 1; // Mensagens (antes de Subidas)
          const afterSubidas = isCompanion && index === 3; // Pink IA (depois de Subidas)

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                flex flex-col items-center justify-center transition-all duration-300 ease-out
                ${isSubidas
                  ? 'absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-pink-500 to-pink-600 shadow-2xl shadow-pink-500/50 !w-[76px] !h-[76px] sm:!w-[90px] sm:!h-[90px] !rounded-full border-4 border-white z-10 gap-0 p-0'
                  : 'gap-0.5 sm:gap-1 px-1.5 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 rounded-xl min-w-[60px] sm:min-w-[70px] md:min-w-[90px] lg:min-w-[100px]'
                }
                ${!isSubidas && beforeSubidas ? 'mr-6 sm:mr-8 md:mr-10' : ''}
                ${!isSubidas && afterSubidas ? 'ml-6 sm:ml-8 md:ml-10' : ''}
                ${!isSubidas && isActive ? 'scale-105' : ''}
                ${!isSubidas && !isActive ? 'hover:bg-pink-50/50' : ''}
              `}
            >
              <div className="relative">
                {/* Foto de perfil no botão "Conta" quando logado */}
                {tab.id === 'conta' && isLoggedIn && profileImage ? (
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-pink-500 scale-110' : 'border-pink-300'}`}>
                    <img
                      src={profileImage}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback para ícone se a imagem falhar
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
                      }}
                    />
                  </div>
                ) : (
                  <IconComponent
                    className={`
                      ${isSubidas
                        ? 'w-[34px] h-[34px] sm:w-[44px] sm:h-[44px] text-white mb-0.5 sm:mb-1'
                        : `w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-300 ${tab.locked ? 'text-gray-300' : 'text-pink-600'} ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`
                      }
                    `}
                    strokeWidth={isSubidas ? 1.2 : undefined}
                    fill="none"
                  />
                )}
                {tab.locked && (
                  <Lock className="w-2.5 h-2.5 text-gray-400 absolute -top-1 -right-2" />
                )}
                {tab.id === 'mensagens' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`
                ${isSubidas
                  ? 'text-[9px] sm:text-[10px] font-bold text-white leading-none tracking-wide'
                  : `text-[9px] sm:text-[10px] transition-all duration-300 ${tab.locked ? 'text-gray-300' : 'text-black'} ${isActive ? 'font-bold' : 'font-semibold'}`
                }
              `} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1px' }}>
                {tab.label}
              </span>

              {/* Indicador ativo - barra superior (não para Subidas) */}
              {isActive && !isSubidas && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Modal de Escolha de Tipo de Cadastro */}
    {showRegisterModal && (
      <RegistrationModal onClose={() => setShowRegisterModal(false)} />
    )}
    </>
  );
};

export default BottomNavigation;
