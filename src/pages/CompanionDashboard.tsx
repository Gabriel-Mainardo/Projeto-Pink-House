import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acompanhantesService, supabase, type Acompanhante } from '../lib/supabase';
import * as messagesService from '../services/messagesService';
import ProfileVerificationModal from '../components/ProfileVerificationModal';
import { EditAcompanhanteModal } from '../components/EditAcompanhanteModal';
import { getReliabilityScore } from '../services/verificationService';
import { useToast } from '../hooks/use-toast';
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Coins,
  Edit2,
  Eye,
  History,
  Image,
  Info,
  LayoutDashboard,
  Loader2,
  Locate,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  MessageSquare,
  Rocket,
  Settings,
  Settings2,
  ShieldCheck,
  Star,
  Trophy,
  User,
  Users,
  X,
  Zap
} from 'lucide-react';

type DashboardTab = 'dashboard' | 'perfil' | 'config';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: boolean;
  onClick?: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  helper?: string;
  button?: boolean;
  onButtonClick?: () => void;
}

interface ManagementCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  iconBg: string;
  onClick?: () => void;
  locked?: boolean;
}

interface ChangeCityModalProps {
  isOpen: boolean;
  initialLocation: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (location: string) => Promise<void>;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex w-full items-center gap-3 px-6 py-3 text-left transition-colors ${
      active
        ? 'border-r-4 border-[#d91d83] bg-pink-50 text-[#d91d83]'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className={active ? 'text-[#d91d83]' : 'text-gray-400'}>{icon}</div>
    <span className="font-medium">{label}</span>
    {badge && <div className="absolute right-6 top-4 h-1.5 w-1.5 rounded-full bg-[#d91d83]" />}
  </button>
);

const ManagementCard: React.FC<ManagementCardProps> = ({
  icon,
  title,
  description,
  badge,
  iconBg,
  onClick,
  locked
}) => (
  <button
    onClick={locked ? undefined : onClick}
    className={`relative rounded-2xl border border-gray-50 bg-white p-5 text-left shadow-sm transition-shadow ${
      locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'
    }`}
  >
    {locked && (
      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
        <Lock size={10} className="text-gray-400" />
        <span className="text-[9px] font-medium text-gray-400">Em breve</span>
      </div>
    )}
    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
      {icon}
    </div>
    <h3 className="mb-1 text-sm font-semibold text-gray-800">{title}</h3>
    <p className="mb-2 text-xs leading-relaxed text-gray-400">{description}</p>
    {badge && !locked && (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-[#d91d83]">
        <Zap size={10} fill="#d91d83" /> {badge}
      </span>
    )}
  </button>
);

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, helper, button, onButtonClick }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-50 bg-white p-6 text-center shadow-sm">
    <div className="mb-4">{icon}</div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
    {helper && <div className="mt-2 text-xs text-gray-400">{helper}</div>}
    {button && (
      <button
        onClick={onButtonClick}
        className="mt-3 rounded-full border border-[#d91d83] px-4 py-1.5 text-xs font-semibold text-[#d91d83] transition-colors hover:bg-pink-50"
      >
        Comprar
      </button>
    )}
  </div>
);

const BroadcastIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = ''
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    className={className}
    fill="currentColor"
  >
    <path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Zm73.71,7.14a80,80,0,0,1-14.08,22.2,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.34,8,8,0,1,1,11.92-10.66,80.08,80.08,0,0,1,14.08,84.47ZM69,85.33a8,8,0,0,1,.57,11.34,64,64,0,0,0,0,85.34,8,8,0,0,1-11.92,10.67,80,80,0,0,1,0-106.68A8,8,0,0,1,69,85.33ZM248,128a119.58,119.58,0,0,1-34.29,84,8,8,0,1,1-11.42-11.2,103.9,103.9,0,0,0,0-145.56A8,8,0,1,1,213.71,44,119.58,119.58,0,0,1,248,128ZM53.71,200.78A8,8,0,1,1,42.29,212a120,120,0,0,1,0-168,8,8,0,1,1,11.42,11.2,103.9,103.9,0,0,0,0,145.56Z" />
  </svg>
);

const getReadableAddress = (payload: Record<string, string | undefined>) => {
  const city =
    payload.city ||
    payload.town ||
    payload.municipality ||
    payload.village ||
    payload.county ||
    '';
  const neighborhood =
    payload.suburb || payload.neighbourhood || payload.city_district || payload.state_district || '';

  return [neighborhood, city].filter(Boolean).join(', ');
};

const ChangeCityModal: React.FC<ChangeCityModalProps> = ({
  isOpen,
  initialLocation,
  isSaving,
  onClose,
  onSave
}) => {
  const [location, setLocation] = useState(initialLocation);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalizacao indisponivel neste dispositivo.');
      return;
    }

    setError('');
    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await response.json();
          const nextLocation = getReadableAddress(data.address || {});
          setLocation(nextLocation || data.display_name || initialLocation || '');
        } catch (fetchError) {
          console.error('Erro ao detectar cidade:', fetchError);
          setError('Nao foi possivel identificar sua cidade automaticamente.');
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setError('Permissao de localizacao negada ou indisponivel.');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      setError('Informe sua cidade antes de salvar.');
      return;
    }

    setError('');
    await onSave(trimmedLocation);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[95vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-800 transition-colors hover:bg-gray-100"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
          <h2 className="text-xl font-bold tracking-tight text-gray-800">Mudar cidade</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6 pt-2">
          <p className="px-4 text-center text-sm leading-relaxed text-gray-500">
            Atualize sua localizacao para aparecer nas buscas certas.
          </p>

          <div className="space-y-2">
            <label className="ml-4 text-xs font-semibold uppercase tracking-wider text-gray-800">
              Cidade e bairro
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#d91d83]">
                <MapPin size={22} />
              </span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[#f8f5f7] py-4 pl-12 pr-4 font-medium text-gray-800 outline-none transition focus:border-[#d91d83]/30 focus:bg-white focus:ring-4 focus:ring-[#d91d83]/10"
                placeholder="Ex: Jardins, Sao Paulo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={detectLocation}
              disabled={isDetecting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d91d83]/10 px-5 py-3 text-sm font-bold text-[#d91d83] transition-colors hover:bg-[#d91d83]/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDetecting ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
              {isDetecting ? 'Detectando localizacao...' : 'Detectar localizacao atual'}
            </button>
            <p className="text-center text-[10px] text-gray-400">
              A localizacao e usada apenas para posicionar seu perfil nas buscas.
            </p>
          </div>

          <div className="rounded-2xl border border-[#F8D3E0] bg-[#F8D3E0]/60 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white p-1.5 text-[#d91d83]">
                <Info size={18} />
              </div>
              <p className="text-xs font-medium text-[#8a3c5b]">
                Ao confirmar, sua nova cidade fica salva no perfil e no dashboard.
              </p>
            </div>
          </div>

          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        </div>

        <div className="space-y-3 bg-white p-6 pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d91d83] py-4 font-bold text-white shadow-lg shadow-[#d91d83]/30 transition-colors hover:bg-[#c4006b] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {isSaving ? 'Salvando...' : 'Confirmar mudanca'}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-full border border-gray-200 py-3.5 font-semibold text-gray-500 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const CompanionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [userName, setUserName] = useState('Usuario');
  const [userAge, setUserAge] = useState(25);
  const [userLocation, setUserLocation] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showLowReliabilityWarning, setShowLowReliabilityWarning] = useState(false);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [reliability, setReliability] = useState(0);
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showChangeCityModal, setShowChangeCityModal] = useState(false);
  const [companionProfile, setCompanionProfile] = useState<Acompanhante | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [activeBoostData, setActiveBoostData] = useState<{
    expiresAt: string;
    planName: string;
    hoursRemaining: number;
  } | null>(null);

  // Detecta se veio de confirmacao de email
  useEffect(() => {
    const showEmailConfirmedModal = () => {
      // NÃO chamar markEmailAsVerified aqui — AuthCallback já faz isso quando
      // a usuária retorna do link de e-mail. Chamar aqui com mailer_autoconfirm
      // ativo permitiria que qualquer sessão logada marcasse o e-mail como
      // verificado sem ter clicado no link.
      setShowVerificationModal(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        const hash = window.location.hash;
        if (hash.includes('type=signup') || hash.includes('type=email') || hash.includes('type=magiclink')) {
          showEmailConfirmedModal();
        }
      }
    });

    // Verifica query params (caso venha do AuthCallback redirect)
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_verified') === '1') {
      showEmailConfirmedModal();
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Verifica flag no localStorage (método mais confiável, não afetado pelo PKCE)
    // Só consumir a flag quando companionId já estiver disponível
    if (localStorage.getItem('email_just_confirmed') === '1') {
      const cIdFromStorage = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').companionId || ''; } catch { return ''; }
      })();
      if (companionId || cIdFromStorage) {
        localStorage.removeItem('email_just_confirmed');
        showEmailConfirmedModal();
      }
      // Se companionId ainda não está disponível, não consome a flag — o effect roda novamente quando companionId mudar
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [companionId]);

  // Abrir modal de verificação automaticamente após cadastro ou ao voltar do EditarPerfil
  useEffect(() => {
    if (searchParams.get('newRegistration') === 'true' || searchParams.get('openVerification') === 'true') {
      setShowVerificationModal(true);
      // Limpar os parâmetros da URL sem recarregar
      searchParams.delete('newRegistration');
      searchParams.delete('openVerification');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDataString = localStorage.getItem('user');

      if (!userDataString) {
        navigate('/login');
        return;
      }

      try {
        const userData = JSON.parse(userDataString);
        if (userData.userType !== 'companion' && userData.type !== 'companion') {
          navigate('/');
          return;
        }

        setUserName(userData.name || userData.artisticName || 'Acompanhante');
        setUserLocation(userData.location || '');
        setUserAge(userData.age || 25);
        const id = userData.companionId || userData.id;
        setCompanionId(id);

        if (!id) {
          navigate('/login');
          return;
        }

        const profile = await acompanhantesService.getById(id);
        setCompanionProfile(profile);
        setIsAvailable(profile.is_available || false);
        setUserLocation(profile.location || userData.location || '');
        setUserAge(profile.age || userData.age || 25);
        setUserAvatar(profile.gallery?.[0] || profile.image || null);
        setUserName(profile.display_name || profile.name || userData.name || 'Acompanhante');

        const score = await getReliabilityScore(id);
        setReliability(score);
      } catch (error) {
        console.error('Erro ao carregar dados da acompanhante:', error);
        navigate('/login');
      } finally {
        // loading removido
      }

      const tempAuthData = localStorage.getItem('tempAuthData');
      if (tempAuthData) {
        try {
          const authData = JSON.parse(tempAuthData);
          if (authData.artisticName) {
            setUserName(authData.artisticName);
          }
        } catch {
          // noop
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (!companionId) {
      return;
    }

    const loadUnread = async () => {
      try {
        const conversations = await messagesService.getUserConversations(companionId);
        const total = conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
        setUnreadMessages(total);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    // Verificar boost ativo
    const loadActiveBoost = async () => {
      try {
        const { data, error } = await supabase
          .from('active_boosts')
          .select('expires_at, boost_plans(name)')
          .eq('companion_id', companionId)
          .eq('is_active', true)
          .eq('payment_status', 'approved')
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const expiresAt = new Date(data.expires_at);
          const hoursRemaining = Math.max(0, (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
          setActiveBoostData({
            expiresAt: data.expires_at,
            planName: (data.boost_plans as any)?.name || 'Subida',
            hoursRemaining,
          });
        } else {
          setActiveBoostData(null);
        }
      } catch {
        setActiveBoostData(null);
      }
    };

    loadUnread();
    loadActiveBoost();
  }, [companionId]);

  const syncLocalUser = (updates: Partial<Acompanhante>) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const nextUser = {
        ...parsedUser,
        name: updates.display_name || updates.name || parsedUser.name,
        artisticName: updates.display_name || updates.name || parsedUser.artisticName,
        email: updates.email || parsedUser.email,
        location: updates.location || parsedUser.location,
        age: updates.age || parsedUser.age,
        image: updates.gallery?.[0] || updates.image || parsedUser.image
      };
      localStorage.setItem('user', JSON.stringify(nextUser));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Erro ao sincronizar localStorage:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao encerrar sessao do Supabase:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('tempAuthData');
      window.dispatchEvent(new Event('userLogout'));
      navigate('/');
    }
  };

  const handleViewProfile = () => {
    if (companionId) {
      navigate(`/profile/${companionId}`);
    }
  };

  const handleEditInfo = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowEditProfileModal(true);
  };

  const handleCompanionSave = async (updates: Partial<Acompanhante>) => {
    if (!companionId) {
      return;
    }

    // Campos admin-only não podem ser alterados pela própria acompanhante
    const { is_featured, is_verified, ...safeUpdates } = updates as any;

    try {
      const updatedProfile = await acompanhantesService.update(companionId, safeUpdates);
      setCompanionProfile(updatedProfile);
      setUserName(updatedProfile.display_name || updatedProfile.name || 'Acompanhante');
      setUserLocation(updatedProfile.location || '');
      setUserAge(updatedProfile.age || 25);
      setIsAvailable(updatedProfile.is_available || false);
      setUserAvatar(updatedProfile.gallery?.[0] || updatedProfile.image || null);
      syncLocalUser(updatedProfile);
      toast({
        title: 'Perfil atualizado',
        description: 'As alteracoes da conta foram salvas com sucesso.'
      });
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      throw new Error(err?.message || 'Não foi possível salvar as alterações. Tente novamente.');
    }
  };

  const handleSaveLocation = async (location: string) => {
    if (!companionId) {
      return;
    }

    setIsSavingLocation(true);
    try {
      const updatedProfile = await acompanhantesService.update(companionId, { location });
      setCompanionProfile(updatedProfile);
      setUserLocation(updatedProfile.location || location);
      syncLocalUser({ location: updatedProfile.location || location });
      setShowChangeCityModal(false);
      toast({
        title: 'Cidade atualizada',
        description: 'Sua nova localizacao ja esta salva no perfil.'
      });
    } catch (error) {
      console.error('Erro ao salvar cidade:', error);
      toast({
        title: 'Erro ao salvar cidade',
        description: 'Nao foi possivel atualizar a localizacao agora.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingLocation(false);
    }
  };

  const updateAvailability = async (newAvailability: boolean) => {
    if (!companionId) {
      return;
    }

    setIsAvailable(newAvailability);

    try {
      const updatedProfile = await acompanhantesService.update(companionId, {
        is_available: newAvailability
      });
      setCompanionProfile(updatedProfile);
      setIsAvailable(updatedProfile.is_available || false);
      syncLocalUser({ is_available: updatedProfile.is_available });

      if (newAvailability) {
        toast({
          title: 'Voce esta online',
          description: `Check-in realizado em ${updatedProfile.location || userLocation || 'sua cidade'}.`
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      setIsAvailable(!newAvailability);
      toast({
        title: 'Falha ao atualizar status',
        description: 'Nao foi possivel alterar sua disponibilidade.',
        variant: 'destructive'
      });
    }
  };

  const handleToggleAvailability = async () => {
    const nextValue = !isAvailable;

    if (nextValue && profileCompleteness < 100) {
      setShowLowReliabilityWarning(true);
      return;
    }

    await updateAvailability(nextValue);
  };

  const handleForceActivate = async () => {
    setShowLowReliabilityWarning(false);
    await updateAvailability(true);
  };

  const stats = useMemo(() => {
    const pinkPointsValue =
      localStorage.getItem('pinkPoints') ||
      localStorage.getItem('pinkpoints') ||
      (reliability ? String(reliability * 25) : '0');
    const rositasValue = localStorage.getItem('rositasBalance') || localStorage.getItem('rositas') || '0';
    const ratingValue =
      companionProfile?.rating && Number(companionProfile.rating) > 0
        ? Number(companionProfile.rating).toFixed(1)
        : '--';
    const rankingValue =
      reliability > 0 ? `#${Math.max(1, 101 - Math.min(reliability, 100))}` : '--';

    return {
      pinkPoints: pinkPointsValue,
      rositas: rositasValue,
      rating: ratingValue,
      ranking: rankingValue
    };
  }, [companionProfile?.rating, reliability]);

  const profileCompleteness = useMemo(() => {
    if (!companionProfile) {
      return 0;
    }

    const checks = [
      companionProfile.display_name || companionProfile.name,
      companionProfile.description,
      companionProfile.location,
      companionProfile.gallery?.length,
      companionProfile.videos?.length,
      companionProfile.pricePerHour,
      companionProfile.phone,
      companionProfile.email,
      companionProfile.is_verified
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [companionProfile]);

  const renderDashboardTab = () => (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="relative mb-4 inline-block">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-r from-[#d91d83] to-pink-400 shadow-lg">
                  <User size={40} className="text-white" />
                </div>
              )}
              <div
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                  isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800">
              {userName}, <span className="font-extrabold text-gray-500">{userAge}</span>
            </h3>
            <p className="text-sm text-gray-400">{userLocation || 'Localizacao nao definida'}</p>
            <button
              onClick={handleEditInfo}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d91d83]/20 px-4 py-2 text-xs font-semibold text-[#d91d83] transition hover:bg-pink-50"
            >
              <Edit2 size={14} />
              Editar perfil
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-[#d91d83]">
                  <BroadcastIcon size={22} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Disponivel para atendimento</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Status atual
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`relative h-6 w-12 rounded-full transition-colors ${
                  isAvailable ? 'bg-[#d91d83]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                    isAvailable ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex gap-2 rounded-2xl border border-yellow-100 bg-yellow-50 p-3">
              <Star size={14} className="mt-0.5 shrink-0 fill-yellow-500 text-yellow-500" />
              <p className="text-[11px] leading-tight text-gray-600">
                Fique online e mantenha a localizacao atualizada para aumentar sua relevancia nas buscas.
              </p>
            </div>

            {/* Boost ativo */}
            {activeBoostData ? (
              <div className="mt-4 rounded-2xl border-2 border-[#d91d83]/30 bg-gradient-to-r from-pink-50 to-purple-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Rocket size={16} className="text-[#d91d83]" />
                    <span className="text-sm font-bold text-gray-800">Subida Ativa</span>
                  </div>
                  <span className="text-xs font-semibold text-[#d91d83] bg-pink-100 px-2 py-0.5 rounded-full">
                    {activeBoostData.planName}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Seu perfil esta no topo do catalogo!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tempo restante: <span className="font-bold text-[#d91d83]">
                    {activeBoostData.hoursRemaining >= 24
                      ? `${Math.floor(activeBoostData.hoursRemaining / 24)}d ${Math.floor(activeBoostData.hoursRemaining % 24)}h`
                      : `${activeBoostData.hoursRemaining.toFixed(1)}h`}
                  </span>
                </p>
              </div>
            ) : (
              <button
                onClick={() => navigate('/subidas')}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 hover:border-[#d91d83] hover:text-[#d91d83] transition-colors"
              >
                <Rocket size={16} />
                Comprar subida para aparecer no topo
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-3xl border border-[#d91d83]/10 bg-[#d91d83]/5 p-8 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="font-extrabold text-gray-800">Confiabilidade do perfil: {reliability}%</h3>
              <ShieldCheck size={20} className="text-[#d91d83]" />
            </div>
            <div className="mb-6 h-2.5 w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#d91d83] shadow-[0_0_10px_rgba(233,30,99,0.3)] transition-all duration-500"
                style={{ width: `${reliability}%` }}
              />
            </div>
            <p className="mb-auto text-sm leading-relaxed text-gray-400">
              Complete as verificacoes para melhorar sua seguranca, confianca do cliente e visibilidade.
            </p>
            <button
              onClick={() => setShowVerificationModal(true)}
              className="mt-8 w-full rounded-2xl bg-[#d91d83] py-4 font-semibold text-white shadow-lg shadow-pink-100 transition-opacity hover:opacity-90"
            >
              Completar verificacoes
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-5">
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-50 bg-white p-8 shadow-sm">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-50 opacity-50 blur-3xl" />

            <div className="mb-2 flex items-center gap-2">
              <Zap size={18} className="fill-yellow-500 text-yellow-500" />
              <h3 className="font-bold text-gray-800">Checklist da conta</h3>
            </div>
            <p className="mb-6 text-xs leading-relaxed text-gray-400">
              O dashboard agora mostra seu progresso real de perfil e operacao.
            </p>

            <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#d91d83]">
                Progresso atual
              </span>
              <h4 className="mb-2 text-sm font-bold text-gray-800">Perfil preenchido em {profileCompleteness}%</h4>
              <p className="mb-4 text-[11px] leading-tight text-gray-400">
                Descricao, midia, verificacao, cidade e status influenciam sua performance.
              </p>

              <div className="mb-2 h-1.5 w-full rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-yellow-400" style={{ width: `${profileCompleteness}%` }} />
              </div>
              <span className="text-[9px] font-semibold text-gray-400">
                {companionProfile?.is_verified ? 'Perfil verificado' : 'Falta concluir verificacoes'}
              </span>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className={`h-1.5 w-4 rounded-full ${profileCompleteness >= 25 ? 'bg-[#d91d83]' : 'bg-gray-200'}`} />
                  <div className={`h-1.5 w-4 rounded-full ${profileCompleteness >= 50 ? 'bg-[#d91d83]' : 'bg-gray-200'}`} />
                  <div className={`h-1.5 w-4 rounded-full ${profileCompleteness >= 75 ? 'bg-[#d91d83]' : 'bg-gray-200'}`} />
                  <div className={`h-1.5 w-4 rounded-full ${profileCompleteness >= 100 ? 'bg-[#d91d83]' : 'bg-gray-200'}`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-400">
                  {Math.min(4, Math.max(1, Math.ceil(profileCompleteness / 25)))} de 4
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('config')}
              className="mt-4 w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Revisar configuracoes da conta
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative mt-10 flex flex-col items-center justify-between overflow-hidden rounded-[32px] p-8 text-white shadow-xl shadow-blue-100 lg:flex-row lg:p-10"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' }}
      >
        <div className="z-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <Users size={32} />
          </div>
          <div>
            <h3 className="mb-1 text-2xl font-bold">Indique e ganhe</h3>
            <p className="text-white/80">Convide outras acompanhantes e ganhe PinkUps.</p>
          </div>
        </div>
        <button
          className="z-10 mt-6 flex cursor-not-allowed items-center gap-2 rounded-2xl bg-white/50 px-8 py-3 font-semibold text-blue-400 shadow-lg lg:mt-0"
          disabled
        >
          <Lock size={14} /> Em breve
        </button>

        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/5" />
      </div>
    </>
  );

  const renderProfileTab = () => (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Resumo do perfil</h3>
            <p className="text-sm text-gray-400">Tudo que esta publico no seu cadastro pode ser revisado aqui.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleViewProfile}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Eye size={16} />
              Ver perfil publico
            </button>
            <button
              onClick={handleEditInfo}
              className="inline-flex items-center gap-2 rounded-full bg-[#d91d83] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c4006b]"
            >
              <Edit2 size={16} />
              Editar dados
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nome de exibicao</div>
            <div className="mt-2 font-semibold text-gray-800">{companionProfile?.display_name || companionProfile?.name || userName}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email</div>
            <div className="mt-2 font-semibold text-gray-800">{companionProfile?.email || '-'}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Telefone</div>
            <div className="mt-2 font-semibold text-gray-800">{companionProfile?.phone || '-'}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Cidade</div>
            <div className="mt-2 font-semibold text-gray-800">{userLocation || '-'}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Valor por hora</div>
            <div className="mt-2 font-semibold text-gray-800">{companionProfile?.pricePerHour || '-'}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</div>
            <div className="mt-2 font-semibold text-gray-800">{isAvailable ? 'Online' : 'Offline'}</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Descricao</div>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {companionProfile?.description || 'Descricao ainda nao preenchida.'}
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-6 text-lg font-semibold text-gray-800">Gerenciamento do perfil</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <ManagementCard
            icon={<Eye size={20} className="text-blue-500" />}
            iconBg="bg-blue-50"
            title="Ver meu perfil"
            description="Visualize seu perfil publico"
            onClick={handleViewProfile}
          />
          <ManagementCard
            icon={<Edit2 size={20} className="text-purple-500" />}
            iconBg="bg-purple-50"
            title="Editar informacoes"
            description="Atualize seus dados pessoais"
            onClick={handleEditInfo}
          />
          <ManagementCard
            icon={<Image size={20} className="text-pink-500" />}
            iconBg="bg-pink-50"
            title="Gerenciar fotos e videos"
            description="Visualize e edite sua midia"
            badge="Adicionar PinkFlash"
            onClick={() => navigate('/photo-video-manager')}
          />
          <ManagementCard
            icon={<MapPin size={20} className="text-green-500" />}
            iconBg="bg-green-50"
            title="Mudar cidade"
            description="Mantenha sua localizacao atualizada"
            onClick={() => setShowChangeCityModal(true)}
          />
          <ManagementCard
            icon={<History size={20} className="text-orange-500" />}
            iconBg="bg-orange-50"
            title="Meus stories"
            description="Edite ou crie novos"
            onClick={() => navigate('/my-stories')}
          />
          <ManagementCard
            icon={<Rocket size={20} className="text-indigo-500" />}
            iconBg="bg-indigo-50"
            title="Minhas subidas"
            description="Veja seu historico de subidas"
            onClick={() => navigate('/subidas')}
          />
        </div>
      </section>
    </div>
  );

  const renderConfigTab = () => (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Configuracoes da conta</h3>
          <p className="text-sm text-gray-400">
            Nesta aba ficam os controles que antes apontavam para uma rota inexistente.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={() => setShowVerificationModal(true)}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left transition hover:bg-gray-100"
          >
            <div>
              <div className="text-sm font-semibold text-gray-800">Verificacoes</div>
              <div className="mt-1 text-xs text-gray-400">
                Confiabilidade atual: {reliability}% {companionProfile?.is_verified ? '(verificada)' : '(pendente)'}
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => setShowChangeCityModal(true)}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left transition hover:bg-gray-100"
          >
            <div>
              <div className="text-sm font-semibold text-gray-800">Cidade e cobertura</div>
              <div className="mt-1 text-xs text-gray-400">{userLocation || 'Localizacao nao definida'}</div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/mensagens')}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left transition hover:bg-gray-100"
          >
            <div>
              <div className="text-sm font-semibold text-gray-800">Mensagens</div>
              <div className="mt-1 text-xs text-gray-400">{unreadMessages} nao lidas</div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={handleEditInfo}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left transition hover:bg-gray-100"
          >
            <div>
              <div className="text-sm font-semibold text-gray-800">Dados do perfil</div>
              <div className="mt-1 text-xs text-gray-400">Nome, descricao, midia e dados de contato</div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-800">Estatisticas da conta</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            icon={<Star size={24} className="fill-yellow-400 text-yellow-400" />}
            value={stats.pinkPoints}
            label="PinkPoints"
            helper="Pontuacao atual"
          />
          <StatCard
            icon={<Star size={24} className="text-[#d91d83]" />}
            value={stats.rating}
            label="Avaliacao"
            helper={companionProfile?.rating ? 'Baseado no perfil' : 'Sem nota ainda'}
          />
          <StatCard
            icon={<MessageCircle size={24} className="text-blue-400" />}
            value={String(unreadMessages)}
            label="Mensagens"
            helper="Nao lidas"
          />
          <StatCard
            icon={<Trophy size={24} className="fill-yellow-600 text-yellow-600" />}
            value={stats.ranking}
            label="Ranking"
            helper="Estimado pela confiabilidade"
          />
          <StatCard
            icon={<Coins size={24} className="fill-[#d91d83] text-[#d91d83]" />}
            value={stats.rositas}
            label="Rositas"
            button
            onButtonClick={() => navigate('/minhas-rositas')}
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Sessao</h3>
        <p className="mb-5 text-sm text-gray-400">
          O logout agora encerra a sessao local e a sessao autenticada no Supabase.
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={20} />
          Sair da conta
        </button>
      </section>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">

      {/* ===== POPUP GRANDE DE EMAIL CONFIRMADO ===== */}
      {emailConfirmed && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Faixa rosa topo */}
            <div className="h-2 w-full bg-gradient-to-r from-pink-500 to-rose-400" />

            <div className="flex flex-col items-center text-center px-8 py-10">
              {/* Ícone de sucesso animado */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-12 h-12 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Bem vinda à PinkHouse! 🎉</h2>
              <p className="text-lg font-semibold text-pink-600 mb-4">Seu email foi confirmado com sucesso!</p>

              {/* Mensagem */}
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                Agora você faz parte da nossa comunidade.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Agora complete seu perfil para aparecer no catálogo e começar a receber clientes.
              </p>

              {/* Botão principal */}
              <button
                onClick={() => {
                  setEmailConfirmed(false);
                  setShowVerificationModal(true);
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95"
              >
                Continuar verificação do perfil
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Pink</span>
            <span className="text-[#d91d83]">House</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Painel da acompanhante</p>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem
            icon={<User size={20} />}
            label="Meu perfil"
            active={activeTab === 'perfil'}
            onClick={() => setActiveTab('perfil')}
          />
          <SidebarItem
            icon={<MessageSquare size={20} />}
            label="Mensagens"
            active={false}
            badge={unreadMessages > 0}
            onClick={() => navigate('/mensagens')}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label="Configuracoes"
            active={activeTab === 'config'}
            onClick={() => setActiveTab('config')}
          />
        </nav>

        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 font-medium text-gray-500 transition-colors hover:text-red-500"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1180px] flex-1 p-4 pb-24 lg:px-12 lg:py-10 lg:pb-10 xl:px-16">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'perfil' ? 'Meu perfil' : 'Configuracoes'}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {activeTab === 'dashboard' && 'Visao geral da conta e da operacao.'}
              {activeTab === 'perfil' && 'Edite e acompanhe todos os dados publicados.'}
              {activeTab === 'config' && 'Controle de sessao, verificacoes e preferencias.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/mensagens')}
              className="relative rounded-xl border border-gray-100 bg-white p-2.5 text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Bell size={20} />
              {unreadMessages > 0 && <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className="rounded-xl border border-gray-100 bg-white p-2.5 text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </header>


        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'dashboard' ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'perfil' ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-600'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'config' ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-600'
            }`}
          >
            Config
          </button>
        </div>

        <section className="space-y-10">
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'perfil' && renderProfileTab()}
          {activeTab === 'config' && renderConfigTab()}
        </section>
      </main>
 
      {showLowReliabilityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <ShieldCheck size={32} className="text-yellow-600" />
              </div>
            </div>

            <h3 className="mb-3 text-center text-xl font-semibold text-gray-900">Seu cadastro esta com {profileCompleteness}%</h3>

            <div className="mb-5">
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${profileCompleteness}%`,
                    background: profileCompleteness < 50
                      ? '#ef4444'
                      : profileCompleteness < 80
                        ? '#f59e0b'
                        : '#22c55e'
                  }}
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                Complete seu perfil para ficar visivel e ganhar mais clientes.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLowReliabilityWarning(false);
                  setShowVerificationModal(true);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-[#d91d83] to-pink-500 py-4 font-semibold text-white shadow-lg shadow-[#d91d83]/20 transition-all hover:from-[#d1006f] hover:to-pink-600"
              >
                Completar agora
              </button>

              <button
                onClick={handleForceActivate}
                className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200"
              >
                Completar depois
              </button>

              <button
                onClick={() => setShowLowReliabilityWarning(false)}
                className="w-full py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        companionId={companionId || undefined}
        onReliabilityChange={(score) => setReliability(score)}
      />

      <ChangeCityModal
        isOpen={showChangeCityModal}
        initialLocation={userLocation}
        isSaving={isSavingLocation}
        onClose={() => setShowChangeCityModal(false)}
        onSave={handleSaveLocation}
      />

      {showEditProfileModal && companionProfile && (
        <EditAcompanhanteModal
          acompanhante={companionProfile}
          onClose={() => setShowEditProfileModal(false)}
          onSave={handleCompanionSave}
        />
      )}

      <style>{`
        * {
          font-family: 'Poppins', sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default CompanionDashboard;
