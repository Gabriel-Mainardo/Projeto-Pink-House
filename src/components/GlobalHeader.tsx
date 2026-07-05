import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  CircleDollarSign,
  Gift,
  HelpCircle,
  Home,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  User,
  UserCircle,
  Wallet,
  X,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';
import RegisterTypeModal from './RegisterTypeModal';

type MenuItem = {
  icon: typeof Home;
  label: string;
  path: string;
  locked: boolean;
  requiresAuth: boolean;
};

const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);

  const hideHeaderRoutes = [
    '/admin-login', '/simple-admin',
    '/client/login', '/client/signup', '/client-login', '/client-signup',
    '/companion/login', '/companion/signup', '/login', '/auth-register',
    '/set-password', '/auth/callback',
    '/basic-info-register', '/service-type', '/location-register',
    '/professional-name-wizard', '/privacy-selection', '/face-verification',
    '/welcome', '/register-success', '/photo-upload', '/cadastro-modelo',
    '/client-register', '/client-area'
  ];

  const shouldHide = hideHeaderRoutes.some((route) => location.pathname.startsWith(route));
  useEffect(() => {
    const syncUserState = (sessionUser?: any | null) => {
      try {
        const stored = localStorage.getItem('user');
        const parsedUser = stored ? JSON.parse(stored) : null;

        setUser(sessionUser || (parsedUser?.isLoggedIn ? parsedUser : null));
        setUserType(parsedUser?.type || null);
      } catch {
        setUser(sessionUser || null);
        setUserType(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserState(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserState(session?.user || null);
    });

    const handleStorageSync = () => syncUserState();
    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('userLogout', handleStorageSync);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('userLogout', handleStorageSync);
    };
  }, []);

  if (shouldHide) return null;

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearchModal(false);
      setSearchTerm('');
    }
  };

  // Check userType from React state OR localStorage as fallback
  // (covers case when state is still loading after login)
  const getStoredUserType = (): string | null => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.isLoggedIn ? parsed?.type || null : null;
    } catch {
      return null;
    }
  };
  const effectiveUserType = userType || getStoredUserType();
  const isCompanion = effectiveUserType === 'companion';
  const isAuthenticated = Boolean(user) || Boolean(getStoredUserType());

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Início', path: '/', locked: false, requiresAuth: false },
    { icon: Search, label: 'Catálogo', path: '/catalog', locked: false, requiresAuth: false },
    { icon: MessageSquare, label: 'Mensagens', path: '/mensagens', locked: false, requiresAuth: true },
    { icon: Wallet, label: 'Carteira', path: '/wallet', locked: true, requiresAuth: true },
    ...(isCompanion
      ? [{ icon: TrendingUp, label: 'Subidas', path: '/subidas', locked: false, requiresAuth: true }]
      : []),
    { icon: Award, label: 'PinkPoints', path: '/pinkpoints', locked: true, requiresAuth: true },
    { icon: Gift, label: 'Indique e Ganhe', path: '/indique-ganhe', locked: true, requiresAuth: true },
  ];

  const getAccountPath = () => {
    // Also check localStorage directly in case userType state is stale
    if (userType === 'companion') return '/companion-dashboard';
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.type === 'companion') return '/companion-dashboard';
      }
    } catch {}
    return '/client-dashboard';
  };

  const bottomMenuItems: MenuItem[] = [
    { icon: Settings, label: 'Configurações', path: getAccountPath(), locked: false, requiresAuth: true },
    { icon: HelpCircle, label: 'Termos de Uso', path: '/terms-of-use', locked: false, requiresAuth: false },
  ];

  const openRegisterPrompt = () => {
    setShowMobileMenu(false);
    setShowRegisterPrompt(true);
  };

  const navigateWithAuth = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      openRegisterPrompt();
      return;
    }

    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="text-gray-900 hover:text-[#da0b7d] transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <Menu className="h-6 w-6 md:h-7 md:w-7" />
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => setShowRegisterPrompt(true)}
                  className="ml-4 hidden h-10 items-center justify-center rounded-xl bg-pink-100 px-6 text-sm font-bold text-[#da0b7d] shadow-sm transition-all hover:bg-pink-200/50 md:flex"
                >
                  Criar conta grátis
                </button>
              )}
            </div>

            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex cursor-pointer items-center"
              onClick={() => navigate('/')}
            >
              <h1 className="text-lg font-extrabold tracking-tight sm:text-xl md:text-2xl">
                <span className="text-gray-900">Pink</span>
                <span className="text-[#da0b7d]">House</span>
              </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* PinkCoins Badge - code.html style */}
              <div 
                onClick={() => navigate('/pinkpoints')}
                className="group flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 px-0 transition-colors hover:bg-gray-200 min-[440px]:w-auto min-[440px]:justify-start min-[440px]:px-3"
              >
                <CircleDollarSign className="h-5 w-5 text-[#da0b7d] group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="hidden text-sm font-bold text-gray-900 sm:inline">PinkCoins : 3.000</span>
                <span className="hidden text-sm font-bold text-gray-900 min-[440px]:inline sm:hidden">3.000</span>
              </div>

              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  // Check both React state and localStorage (in case state is still loading)
                  let loggedIn = isAuthenticated;
                  if (!loggedIn) {
                    try {
                      const stored = localStorage.getItem('user');
                      loggedIn = stored ? JSON.parse(stored)?.isLoggedIn === true : false;
                    } catch {}
                  }
                  if (!loggedIn) {
                    openRegisterPrompt();
                    return;
                  }
                  navigate(getAccountPath());
                }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                aria-label="Minha Conta"
              >
                <UserCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showMobileMenu && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute bottom-0 left-0 top-0 w-72 bg-white shadow-xl animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#d91d83] to-pink-500 p-4">
              <div className="flex items-center">
                <span className="text-lg font-bold">
                  <span className="text-white">Pink</span>
                  <span className="text-pink-200">House</span>
                </span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="text-white/80 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {isAuthenticated && (
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d91d83]/10">
                    <User className="h-5 w-5 text-[#d91d83]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="max-h-[calc(100vh-200px)] flex-1 overflow-y-auto p-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = !item.locked && location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (item.locked) {
                        toast({
                          title: '🔒 Em desenvolvimento',
                          description: 'Esta funcionalidade estará disponível em breve!',
                        });
                        return;
                      }
                      navigateWithAuth(item.path, item.requiresAuth);
                    }}
                    className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      item.locked
                        ? 'cursor-not-allowed text-gray-400 opacity-50'
                        : isActive
                          ? 'bg-[#d91d83]/10 font-semibold text-[#d91d83]'
                          : 'font-medium text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${item.locked ? 'text-gray-300' : isActive ? 'text-[#d91d83]' : 'text-gray-400'}`} />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.locked && <Lock className="h-3.5 w-3.5 text-gray-300" />}
                  </button>
                );
              })}

              <div className="my-2 border-t border-gray-100 pt-2">
                {bottomMenuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigateWithAuth(item.path, item.requiresAuth)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {isAuthenticated && (
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      localStorage.removeItem('user');
                      setShowMobileMenu(false);
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 text-red-400" />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {showSearchModal && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 pt-20" onClick={() => setShowSearchModal(false)}>
          <div
            className="w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold">Buscar Acompanhante</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome ou cidade..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d91d83]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowSearchModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSearch}
                className="flex-1 rounded-xl bg-[#d91d83] py-2.5 text-sm font-semibold text-white hover:bg-[#c01872]"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterPrompt && (
        <RegisterTypeModal
          isOpen={showRegisterPrompt}
          onClose={() => setShowRegisterPrompt(false)}
          variant="modal"
        />
      )}
    </>
  );
};

export default GlobalHeader;
