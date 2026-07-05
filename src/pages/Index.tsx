import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Search,
  Menu,
  MapPin,
  ChevronDown,
  Play,
  Pause,
  MessageSquare,
  Plus,
  Home,
  Wallet,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UserCircle,
  X,
  Phone,
  PhoneCall,
  Send
} from 'lucide-react';
import { AgeGateWrapper } from '../components/AgeGateWrapper';
import Footer from '../components/Footer';
import { acompanhantesService, type Acompanhante } from '../services/acompanhantesService';
import { getReliabilityScoresBatch } from '../services/verificationService';
import { useLocation } from '../contexts/LocationContext';
import { metropolitanCities } from '../lib/recife-metropolitan-area';
import { storiesService } from '../services/storiesService';
import StoryViewer from '../components/StoryViewer';
import CreateStoryModal from '../components/CreateStoryModal';

// --- Types ---
interface FlashVideo {
  id: string;
  name: string;
  age: number;
  image: string;
}

interface StoryFromDB {
  id: string;
  companion_id: string;
  companion_name: string;
  companion_image: string;
  preview_image: string;
  plan_type: 'basic' | 'destaque' | 'premium';
  expires_at: string;
  hasNewStory: boolean;
  stories?: Array<{
    id: string;
    type: 'photo' | 'video' | 'audio' | 'text';
    url: string;
    thumbnail?: string;
    duration?: number;
    created_at: string;
    storyLinkUrl?: string;
    storyLinkText?: string;
    linkType?: 'whatsapp' | 'custom';
    companion_city?: string;
  }>;
}

interface LoggedCompanion {
  id: string;
  name?: string;
  image?: string;
}

interface LocationGroup {
  zone: string;
  neighborhoods: string[];
}

const locationGroups: LocationGroup[] = [
  {
    zone: 'Zona Sul',
    neighborhoods: ['Boa Viagem', 'Pina', 'Setúbal', 'Ibura', 'Jordão', 'Imbiribeira'],
  },
  {
    zone: 'Zona Norte',
    neighborhoods: ['Casa Amarela', 'Casa Forte', 'Aflitos', 'Graças', 'Rosarinho', 'Arruda', 'Apipucos', 'Dois Irmãos'],
  },
  {
    zone: 'Zona Oeste / Centro',
    neighborhoods: ['Várzea', 'Iputinga', 'Cordeiro', 'Madalena', 'Derby', 'Boa Vista', 'São José', 'Recife Antigo', 'Torre', 'Espinheiro', 'Ilha do Leite'],
  },
  {
    zone: 'Guabiraba',
    neighborhoods: ['Guabiraba'],
  },
  {
    zone: 'Olinda',
    neighborhoods: ['Bairro Novo', 'Casa Caiada', 'Rio Doce', 'Sítio Histórico'],
  },
  {
    zone: 'Jaboatão dos Guararapes',
    neighborhoods: ['Piedade', 'Candeias', 'Paiva', 'Jaboatão Centro', 'Cavaleiro'],
  },
  {
    zone: 'Paulista',
    neighborhoods: ['Janga', 'Pau Amarelo', 'Maria Farinha'],
  },
  {
    zone: 'Cabo de Santo Agostinho',
    neighborhoods: ['Centro', 'Gaibu', 'Enseada dos Corais'],
  },
  {
    zone: 'Camaragibe',
    neighborhoods: ['Centro', 'Aldeia'],
  },
];

const homeLocationOptions = [
  { name: 'Recife RMR', state: 'PE', fullName: 'Recife RMR - PE' },
] as const;

// --- ProfileCard Component ---
interface ProfileCardProps {
  profile: Acompanhante;
  rank?: number;
}

const formatPhoneForWhatsApp = (phoneNumber: string) => {
  const numbersOnly = phoneNumber.replace(/\D/g, '');
  if (numbersOnly.length <= 11) return `55${numbersOnly}`;
  return numbersOnly;
};

const ContactPopup: React.FC<{ name: string; phone?: string; id: string; onClose: () => void }> = ({ name, phone, id, onClose }) => {
  const navigate = useNavigate();
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="bg-white rounded-[28px] mx-3 w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-xl font-bold text-gray-900">Como prefere conversar?</h3>
          <p className="text-sm text-gray-500 mt-1">Inicie um atendimento personalizado agora mesmo.</p>
        </div>

        <div className="px-5 pb-5 space-y-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/mensagens?to=${id}`);
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-pink-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-[#d91d83] flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-800 block">Chat do site</span>
              <span className="text-[10px] font-bold text-[#d91d83] uppercase tracking-wider">Atendimento recomendado</span>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-300 group-hover:text-pink-500 transition-colors" />
          </button>

          {phone && phone.trim() !== '' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${formatPhoneForWhatsApp(phone)}?text=Ol� ${name}, vi seu perfil no Pink House e gostaria de conversar.`, '_blank');
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0 shadow-md">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-1 text-left">WhatsApp</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
            </button>
          )}

          {phone && phone.trim() !== '' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://t.me/+${formatPhoneForWhatsApp(phone)}`, '_blank');
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2AABEE] to-[#229ED9] flex items-center justify-center flex-shrink-0 shadow-md">
                <Send className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-1 text-left">Telegram</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </button>
          )}

          {phone && phone.trim() !== '' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${phone}`;
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <PhoneCall className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-1 text-left">Chamada de Voz</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
          )}
        </div>

        <div className="border-t border-gray-100 py-3 text-center">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em]">Faixa Rosa � Atendimento de Elite</p>
        </div>
      </div>
    </div>,
    document.body
  );
};
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, rank }) => {
  const navigate = useNavigate();
  const isFeatured = profile.is_featured;
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const featuredVideoUrl = profile.videos?.[0] || profile.video_url || '';
  const cardVideoRef = useRef<HTMLVideoElement>(null);
  const reliabilityScore = Math.max(0, Math.min(100, Number(profile.reliability_score) || 0));
  const reliabilityFillClass =
    reliabilityScore >= 80 ? 'bg-emerald-400' :
    reliabilityScore >= 50 ? 'bg-amber-400' :
    'bg-rose-400';

  const toggleFeaturedVideo = (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!featuredVideoUrl || !cardVideoRef.current) return;

    const video = cardVideoRef.current;

    if (video.paused) {
      void video.play()
        .then(() => setIsVideoPlaying(true))
        .catch((error) => {
          console.error('Erro ao reproduzir vídeo do destaque:', error);
          setIsVideoPlaying(false);
        });
      return;
    }

    video.pause();
    setIsVideoPlaying(false);
  };

  useEffect(() => {
    if (!isFeatured || !featuredVideoUrl || !cardVideoRef.current) return;

    const video = cardVideoRef.current;

    if (!isVideoPlaying) {
      video.pause();
      return;
    }

    void video.play().catch((error) => {
      console.error('Erro ao reproduzir vídeo do destaque:', error);
      setIsVideoPlaying(false);
    });
  }, [isFeatured, isVideoPlaying, featuredVideoUrl]);

  const handleCardNavigation = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-card-interactive="true"]')) {
      return;
    }

    navigate(`/profile/${profile.id}`);
  };

  // Card de destaque - design premium
  if (isFeatured) {
    return (
      <>
        <div
          className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
          onClick={handleCardNavigation}
        >
          {/* Image or inline video */}
          {featuredVideoUrl ? (
            <video
              ref={cardVideoRef}
              src={featuredVideoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              preload="metadata"
              data-card-interactive="true"
              onClick={toggleFeaturedVideo}
              onEnded={() => setIsVideoPlaying(false)}
            />
          ) : (
            <img
              src={profile.image || '/default-profile.png'}
              alt={profile.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

          {/* Badge Destaque / Boost */}
          <div className="absolute top-4 left-4">
            <div className="bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Disponível Agora</span>
            </div>
          </div>

          {/* Rank Badge */}
          {rank && rank <= 3 && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30">
              <div className={`premium-rank-badge rank-${rank}-new`}>
                <div className="rank-glow-effect"></div>
                <span className="rank-num">{rank}º</span>
                <span className="rank-top-text uppercase">TOP {rank}</span>
                <span className="rank-city-tag uppercase truncate">DA CIDADE</span>
              </div>
            </div>
          )}

          {/* Play/Pause Button — positioned in upper-center, away from text */}
          {featuredVideoUrl && (
            <div className="absolute left-0 right-0 z-20 flex justify-center pointer-events-none" style={{ top: '28%' }}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  toggleFeaturedVideo(e);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                data-card-interactive="true"
                className="pointer-events-auto relative z-30 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white/35 md:h-16 md:w-16"
                aria-label={`Reproduzir/Pausar video de ${profile.name}`}
              >
                {isVideoPlaying ? (
                  <Pause className="h-6 w-6 fill-white text-white md:h-7 md:w-7" />
                ) : (
                  <Play className="ml-0.5 h-6 w-6 fill-white text-white md:h-7 md:w-7" />
                )}
              </button>
            </div>
          )}

          {/* Content — distributed vertically */}
          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)', paddingTop: '6rem'}}>

            {/* Description */}
            {profile.description && (
              <p className="text-white/85 text-sm italic font-medium drop-shadow-md leading-snug line-clamp-2 mb-4">
                &ldquo;{profile.description}&rdquo;
              </p>
            )}

            {/* Name + online dot */}
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-2xl font-bold text-white drop-shadow-sm leading-tight">
                {profile.name}, {profile.age}
              </h2>
              {profile.is_available && (
                <div className="w-3 h-3 rounded-full bg-green-500 border border-white/20 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0" />
              )}
            </div>

            {/* Location */}
            <p className="text-gray-300 text-sm flex items-center gap-1.5 font-medium mb-4">
              <MapPin className="w-4 h-4 text-pink-300 flex-shrink-0" />
              <span className="truncate">{profile.location}</span>
            </p>

            {/* Reliability */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                  Confiabilidade: {reliabilityScore}%
                </span>
                {reliabilityScore === 100 && (
                  <div className="flex items-center gap-0.5 bg-green-500 px-2 py-0.5 rounded-full">
                    <span className="text-[9px] font-black text-white uppercase">✓ Verificada</span>
                  </div>
                )}
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    reliabilityScore >= 80 ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                    reliabilityScore >= 50 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' :
                    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  }`}
                  style={{ width: `${reliabilityScore}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                data-card-interactive="true"
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${profile.id}`); }}
                className="flex items-center justify-center h-12 rounded-xl border border-white/40 hover:bg-white/15 transition-colors text-sm font-bold text-white backdrop-blur-sm"
              >
                Ver Anúncio
              </button>
              <button
                data-card-interactive="true"
                onClick={(e) => { e.stopPropagation(); setShowContactPopup(true); }}
                className="flex items-center justify-center h-12 rounded-xl bg-[#da0b7d] hover:bg-[#b00965] transition-colors text-sm font-bold text-white shadow-lg gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>CONTATO</span>
              </button>
            </div>
          </div>

          {showContactPopup && (
            <ContactPopup name={profile.name} phone={profile.phone} id={profile.id} onClose={() => setShowContactPopup(false)} />
          )}
        </div>

      </>
    );
  }

  // Card regular - design mais simples mas com fontes maiores
  return (
    <div
      className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
      onClick={() => navigate(`/profile/${profile.id}`)}
    >
      <img
        src={profile.image || '/default-profile.png'}
        alt={profile.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Badge Disponível Agora */}
      {profile.is_available && (
        <div className="absolute top-3 left-3">
          <div className="bg-green-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Disponível</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-28" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.68) 56%, transparent 100%)'}}>
        {profile.description && (
          <p className="mb-3 line-clamp-2 text-sm italic font-medium leading-snug text-white/80">
            &ldquo;{profile.description}&rdquo;
          </p>
        )}

        {/* Name + status */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-white leading-tight">{profile.name}, {profile.age}</h3>
          {profile.is_available && (
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
          )}
        </div>

        {/* Location */}
        <p className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-300">
          <MapPin className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />
          <span className="truncate">{profile.location}</span>
        </p>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/75">
              Confiabilidade: {reliabilityScore}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full ${
                reliabilityScore >= 80 ? 'bg-green-400' :
                reliabilityScore >= 50 ? 'bg-yellow-400' :
                'bg-red-500'
              }`}
              style={{ width: `${reliabilityScore}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${profile.id}`); }}
            className="flex items-center justify-center h-11 rounded-xl border border-white/30 hover:bg-white/15 transition-colors text-sm font-bold text-white"
          >
            Ver Anúncio
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowContactPopup(true); }}
            className="flex items-center justify-center h-11 rounded-xl bg-[#da0b7d] hover:bg-[#b00965] transition-colors text-sm font-bold text-white gap-1.5 shadow-md"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>CONTATO</span>
          </button>
        </div>
      </div>

      {showContactPopup && (
        <ContactPopup name={profile.name} phone={profile.phone} id={profile.id} onClose={() => setShowContactPopup(false)} />
      )}
    </div>
  );
};

// --- Main Index Component ---
const Index: React.FC = () => {
  const navigate = useNavigate();
  const locationContext = useLocation();
  const selectedCity = locationContext?.selectedCity || { name: 'Recife', state: 'Pernambuco', fullName: 'Recife - PE' };

  const [activeTab, setActiveTab] = useState<'Mulheres' | 'Homens' | 'Trans'>('Mulheres');
  const [companions, setCompanions] = useState<Acompanhante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const flashScrollRef = useRef<HTMLDivElement>(null);

  // Stories do banco de dados
  const [storiesFromDB, setStoriesFromDB] = useState<StoryFromDB[]>([]);
  const [loggedCompanion, setLoggedCompanion] = useState<LoggedCompanion | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    stories: Array<{
      id: string;
      type: 'photo' | 'video' | 'audio' | 'text';
      url: string;
      thumbnail?: string;
      duration?: number;
      created_at: string;
      storyLinkUrl?: string;
      storyLinkText?: string;
      linkType?: 'whatsapp' | 'custom';
    }>;
    companionName: string;
    companionAvatar: string;
    planType: 'basic' | 'destaque' | 'premium';
    initialIndex: number;
    currentCompanionIndex: number;
  }>({
    isOpen: false,
    stories: [],
    companionName: '',
    companionAvatar: '',
    planType: 'basic',
    initialIndex: 0,
    currentCompanionIndex: 0
  });

  const normalizedSelectedCity = selectedCity?.name?.toLowerCase()?.trim();
  const isRmrSelected = normalizedSelectedCity === 'rmr' || normalizedSelectedCity === 'recife rmr';

  // Load companions from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await acompanhantesService.getAll();
        const validCompanions = data.filter(Boolean);
        const reliabilityScores = await getReliabilityScoresBatch(validCompanions.map((companion) => companion.id));
        setCompanions(
          validCompanions.map((companion) => ({
            ...companion,
            reliability_score: reliabilityScores[companion.id] || 0,
          }))
        );
      } catch (error) {
        console.error('Error loading companions:', error);
        setCompanions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load stories from database
  useEffect(() => {
    if (!locationContext) {
      return;
    }

    if (!isRmrSelected) {
      locationContext.setSelectedCity({
        name: 'Recife RMR',
        state: 'PE',
        fullName: 'Recife RMR - PE',
      });
    }
  }, [isRmrSelected, locationContext]);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const cityToFilter = isRmrSelected ? 'RMR' : selectedCity?.name;
        const stories = await storiesService.getApprovedStories(cityToFilter);
        setStoriesFromDB(stories);
      } catch (error) {
        console.error('Error loading stories:', error);
        setStoriesFromDB([]);
      }
    };

    loadStories();
  }, [isRmrSelected, selectedCity]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setLoggedCompanion(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const isCompanion = parsedUser?.type === 'companion' || parsedUser?.userType === 'companion';
      const companionId = parsedUser?.companionId || parsedUser?.id || null;

      if (!isCompanion || !companionId) {
        setLoggedCompanion(null);
        return;
      }

      setLoggedCompanion({
        id: companionId,
        name: parsedUser?.name || parsedUser?.username || 'Você',
        image: parsedUser?.image || parsedUser?.avatar || parsedUser?.profileImage || '/default-profile.png'
      });
    } catch (error) {
      console.error('Error reading logged companion:', error);
      setLoggedCompanion(null);
    }
  }, []);

  // Get featured and regular profiles - FILTRAR POR LOCALIZAÇÃO
  const cityFilteredCompanions = companions.filter((companion) => {
    // Se um bairro específico foi selecionado, filtrar por ele
    if (selectedNeighborhood) {
      const nb = selectedNeighborhood.toLowerCase();
      const location = (companion.location || '').toLowerCase();
      const citiesServed = (companion.cities_served || []).map((c: string) => c.toLowerCase());

      // Encontrar a qual zona/cidade o bairro pertence para busca mais ampla
      const parentGroup = locationGroups.find(g => g.neighborhoods.includes(selectedNeighborhood));
      const parentZone = parentGroup?.zone?.toLowerCase() || '';

      return (
        location.includes(nb) ||
        nb.includes(location) ||
        citiesServed.some((c: string) => c.includes(nb) || nb.includes(c)) ||
        // Para bairros de cidades vizinhas, também checar o nome da cidade
        (parentZone && !['zona sul', 'zona norte', 'zona oeste / centro', 'guabiraba'].includes(parentZone) && (
          location.includes(parentZone) ||
          citiesServed.some((c: string) => c.includes(parentZone))
        ))
      );
    }

    // Sem bairro selecionado = mostrar toda a RMR
    const location = (companion.location || '').toLowerCase();
    const citiesServed = companion.cities_served || [];

    return metropolitanCities.some((city) => {
      const normalizedCity = city.toLowerCase();
      return (
        location.includes(normalizedCity) ||
        normalizedCity.includes(location) ||
        citiesServed.some((servedCity: string) => {
          const normalizedServedCity = servedCity.toLowerCase();
          return (
            normalizedServedCity.includes(normalizedCity) ||
            normalizedCity.includes(normalizedServedCity)
          );
        })
      );
    });
  });

  const genderFilteredCompanions = cityFilteredCompanions.filter((companion) => {
    const servesWhom = ((companion as Acompanhante & { serves_whom?: string }).serves_whom || '').toLowerCase();

    if (!servesWhom) return activeTab === 'Mulheres';
    if (activeTab === 'Mulheres') return servesWhom.includes('mulher') || servesWhom === 'todos';
    if (activeTab === 'Homens') return servesWhom.includes('homem') || servesWhom === 'todos';
    if (activeTab === 'Trans') return servesWhom.includes('trans');
    return true;
  });

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const displayCompanions = genderFilteredCompanions.filter((companion) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableFields = [
      companion.name,
      companion.location,
      ...(companion.tags || []),
      ...(companion.cities_served || [])
    ];

    return searchableFields.some((field) => field?.toLowerCase().includes(normalizedSearchTerm));
  });

  const flashVideos: FlashVideo[] = displayCompanions.slice(0, 6).map((companion) => ({
    id: companion.id,
    name: companion.name.split(' ')[0],
    age: companion.age,
    image: companion.image || '/default-profile.png'
  }));

  // Ranking: boost ativo primeiro → mais recente primeiro → mais caro como desempate → disponível → destaque → rating
  const boostSort = (a: any, b: any) => {
    // 1. Boost ativo tem prioridade máxima
    if (a.hasBoost && !b.hasBoost) return -1;
    if (!a.hasBoost && b.hasBoost) return 1;
    // 2. Entre boosts: mais recente primeiro
    if (a.hasBoost && b.hasBoost) {
      const startDiff = new Date(b.boostStartedAt || 0).getTime() - new Date(a.boostStartedAt || 0).getTime();
      if (startDiff !== 0) return startDiff;
      // 3. Empate: mais caro primeiro
      const amountDiff = (b.boostAmountPaid || 0) - (a.boostAmountPaid || 0);
      if (amountDiff !== 0) return amountDiff;
      // 4. Prioridade do plano como fallback
      return (b.boostPriority || 0) - (a.boostPriority || 0);
    }
    // Sem boost: disponível > destaque > rating
    if (a.is_available && !b.is_available) return -1;
    if (!a.is_available && b.is_available) return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return Number(b.rating || 0) - Number(a.rating || 0);
  };

  // Separar perfis em 4 grupos: subidas, online, offline
  const boostedProfiles = [...displayCompanions]
    .filter(c => c.hasBoost)
    .sort((a, b) => new Date(b.boostStartedAt || 0).getTime() - new Date(a.boostStartedAt || 0).getTime());

  const boostedIds = new Set(boostedProfiles.map(p => p.id));

  const onlineProfiles = [...displayCompanions]
    .filter(c => !boostedIds.has(c.id) && c.is_available)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const offlineProfiles = [...displayCompanions]
    .filter(c => !boostedIds.has(c.id) && !c.is_available)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  // Para compatibilidade com código existente
  const featuredProfiles = boostedProfiles;
  const regularProfiles = onlineProfiles;

  // Handle story click
  const handleStoryClick = (story: StoryFromDB) => {
    const companionIndex = storiesFromDB.findIndex(s => s.id === story.id);

    if (story.stories && story.stories.length > 0) {
      setViewerState({
        isOpen: true,
        stories: story.stories,
        companionName: story.companion_name,
        companionAvatar: story.companion_image,
        planType: story.plan_type,
        initialIndex: 0,
        currentCompanionIndex: companionIndex
      });
    }
  };

  const handleCompanionChange = (companionIndex: number, storyIndex: number) => {
    if (companionIndex >= 0 && companionIndex < storiesFromDB.length) {
      const newCompanion = storiesFromDB[companionIndex];

      setViewerState(prev => ({
        ...prev,
        stories: newCompanion.stories || [],
        companionName: newCompanion.companion_name,
        companionAvatar: newCompanion.companion_image,
        planType: newCompanion.plan_type,
        initialIndex: storyIndex,
        currentCompanionIndex: companionIndex
      }));
    }
  };

  const closeViewer = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AgeGateWrapper>
      <div className="min-h-screen bg-white relative">
        {/* Filter Bar: Cidade + Gênero */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row sm:px-6 lg:px-8">

            {/* Cidade / Bairro */}
            <div className="relative flex shrink-0 justify-center">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-[#d91d83]"
              >
                <MapPin className="h-4 w-4 text-[#d91d83]" />
                <span className="max-w-[180px] truncate sm:max-w-none">{selectedNeighborhood || 'Recife RMR'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCityDropdown && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowCityDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[260px] max-h-[70vh] overflow-hidden flex flex-col">
                    <div className="overflow-y-auto">
                      {/* Opção: Todas */}
                      <button
                        onClick={() => {
                          setSelectedNeighborhood(null);
                          setShowCityDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-xs md:text-sm font-semibold hover:bg-pink-50 transition-colors border-b border-gray-100 ${
                          !selectedNeighborhood ? 'text-[#d91d83] bg-pink-50' : 'text-gray-800'
                        }`}
                      >
                        Recife RMR - Todas
                      </button>

                      {locationGroups.map((group) => (
                        <div key={group.zone}>
                          <div className="px-4 py-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                            {group.zone}
                          </div>
                          {group.neighborhoods.map((nb) => {
                            const label = group.zone === 'Guabiraba' ? nb : nb;
                            return (
                              <button
                                key={`${group.zone}-${nb}`}
                                onClick={() => {
                                  setSelectedNeighborhood(nb);
                                  setShowCityDropdown(false);
                                }}
                                className={`w-full text-left px-6 py-2.5 text-xs md:text-sm hover:bg-pink-50 transition-colors ${
                                  selectedNeighborhood === nb ? 'text-[#d91d83] font-semibold bg-pink-50' : 'text-gray-700'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Gênero */}
            <div className="flex w-full min-w-0 flex-1 rounded-xl bg-gray-100 p-1 sm:w-auto sm:flex-none sm:shrink-0">
              {(['Mulheres', 'Homens', 'Trans'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`min-w-0 flex-1 rounded-lg px-4 py-1.5 text-sm font-bold transition-all sm:flex-none sm:px-6 ${
                    activeTab === tab
                      ? 'bg-[#d91d83] text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

          </div>
        </div>

        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold leading-tight text-gray-900">
              Descubra as acompanhantes que estão bombando agora em <span className="text-[#da0b7d]">{selectedNeighborhood || 'Recife RMR'}</span> 🔥
            </h2>
          </div>

          {/* Stories — só exibe se houver algum */}
          {(loggedCompanion || storiesFromDB.length > 0) && (
            <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 custom-scrollbar mb-4 no-scrollbar">
              {loggedCompanion && (
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group min-w-[72px]"
                  onClick={() => setIsCreateStoryOpen(true)}
                  aria-label="Criar novo story"
                >
                  <div className="story-ring p-[2px] rounded-full group-hover:scale-105 transition-transform shadow-sm">
                    <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#da0b7d] to-[#f472b6] flex items-center justify-center border-2 border-white shadow-lg">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#da0b7d]">Novo story</span>
                </button>
              )}

              {storiesFromDB.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group min-w-[72px]"
                  onClick={() => handleStoryClick(story)}
                >
                  <div className="story-ring p-[2px] rounded-full group-hover:scale-105 transition-transform shadow-sm">
                    <div className="w-[68px] h-[68px] rounded-full border-2 border-white overflow-hidden">
                      <img
                        src={story.preview_image || story.companion_image}
                        alt={story.companion_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-[#da0b7d] transition-colors">{story.companion_name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d91d83]"></div>
              <p className="text-gray-600 mt-2">Carregando...</p>
            </div>
          )}

          <p className="text-gray-900 font-bold mb-6 px-1 text-center sm:text-left italic text-base">
            Escolha uma acompanhante e entre em contato
          </p>

          {/* === 1. SUBIDAS (boosted profiles) === */}
          {!loading && boostedProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {boostedProfiles.map((profile, index) => (
                <ProfileCard key={profile.id} profile={{...profile, is_featured: true}} rank={index + 1} />
              ))}
            </div>
          )}

          {/* === 2. ONLINE profiles (sem boost) === */}
          {!loading && onlineProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              {onlineProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={{...profile, is_featured: false}} />
              ))}
            </div>
          )}

          {/* === 2b. Ver catálogo completo === */}
          {!loading && onlineProfiles.length > 0 && (
            <div className="flex justify-center mt-10 mb-10">
              <button
                onClick={() => navigate('/catalog')}
                className="px-10 py-4 bg-gray-100 border border-gray-200 text-gray-900 font-bold text-base rounded-xl hover:bg-gray-200 hover:shadow-md transition-all"
              >
                Ver mais acompanhantes
              </button>
            </div>
          )}

          {/* === 3. PinkFlash Section === */}
          {!loading && flashVideos.length > 0 && (
            <section className="mb-10 mt-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    PinkFlash: Conecte-se em segundos <span className="text-[#da0b7d]">🔥</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Vídeos curtos e envolventes das acompanhantes que estão bombando agora.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => flashScrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    aria-label="Rolar para a esquerda"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => flashScrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    aria-label="Rolar para a direita"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div ref={flashScrollRef} className="pinkflash-scroll-container flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar snap-x">
                {flashVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => navigate(`/profile/${video.id}`)}
                    className="pinkflash-item flex-shrink-0 w-[160px] sm:w-[180px] h-[280px] sm:h-[320px] rounded-xl overflow-hidden relative cursor-pointer group border border-pink-500/20 hover:border-pink-500/50 transition-all hover:shadow-pink-glow"
                  >
                    <img src={video.image} alt={video.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-white text-sm font-bold block truncate">{video.name}, {video.age}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* === 4. OFFLINE profiles === */}
          {!loading && offlineProfiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {offlineProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={{...profile, is_featured: false}} />
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && displayCompanions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">
                {activeTab !== 'Mulheres'
                  ? `Nenhum(a) acompanhante de "${activeTab}" encontrado(a) em ${selectedNeighborhood || 'Recife RMR'}.`
                  : `Nenhuma acompanhante encontrada em ${selectedNeighborhood || 'Recife RMR'}.`}
              </p>
              {activeTab !== 'Mulheres' && (
                <button
                  onClick={() => setActiveTab('Mulheres')}
                  className="text-[#d91d83] text-sm font-medium underline underline-offset-2"
                >
                  Ver acompanhantes disponíveis
                </button>
              )}
            </div>
          )}
        </main>


        {/* Story Viewer */}
        <StoryViewer
          isOpen={viewerState.isOpen}
          onClose={closeViewer}
          stories={viewerState.stories}
          companionName={viewerState.companionName}
          companionAvatar={viewerState.companionAvatar}
          companionId={storiesFromDB[viewerState.currentCompanionIndex]?.companion_id}
          planType={viewerState.planType}
          initialStoryIndex={viewerState.initialIndex}
          allCompanions={storiesFromDB.map(story => ({
            id: story.id,
            companion_name: story.companion_name,
            companion_image: story.companion_image,
            plan_type: story.plan_type,
            stories: story.stories || []
          }))}
          currentCompanionIndex={viewerState.currentCompanionIndex}
          onCompanionChange={handleCompanionChange}
        />

        {loggedCompanion && (
          <CreateStoryModal
            isOpen={isCreateStoryOpen}
            onClose={() => setIsCreateStoryOpen(false)}
            companionId={loggedCompanion.id}
          />
        )}

        {/* Styles */}
        <style>{`
          * {
            font-family: 'Plus Jakarta Sans', 'Poppins', sans-serif;
          }
          body {
            font-family: 'Plus Jakarta Sans', 'Poppins', sans-serif;
            background-color: #ffffff;
          }
          .premium-rank-badge {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 4px;
            min-width: 52px;
            border-radius: 12px;
            backdrop-filter: blur(8px);
            border: 1.5px solid rgba(255,255,255,0.3);
            box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
            overflow: hidden;
            z-index: 30;
          }
          .rank-glow-effect {
            position: absolute;
            inset: -50%;
            background: radial-gradient(circle, var(--rank-color-light) 0%, transparent 70%);
            opacity: 0.25;
            animation: pulse-glow 3s infinite;
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(1.2); }
          }
          .rank-num {
            font-size: 26px;
            font-weight: 900;
            line-height: 1;
            background: linear-gradient(to bottom, #fff 30%, var(--rank-color-main) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
          .rank-top-text {
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: #fff;
            opacity: 0.9;
            margin-top: -2px;
          }
          .rank-city-tag {
            font-size: 7px;
            font-weight: 900;
            color: var(--rank-color-main);
            background: rgba(0,0,0,0.7);
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 4px;
            letter-spacing: 0.05em;
          }
          .rank-1-new { 
            --rank-color-main: #FFD700; 
            --rank-color-light: #FFF08A;
            background: linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(139,105,20,0.4) 100%);
            border-color: rgba(255, 215, 0, 0.4);
          }
          .rank-2-new { 
            --rank-color-main: #E0E0E0; 
            --rank-color-light: #FFFFFF;
            background: linear-gradient(135deg, rgba(224,224,224,0.2) 0%, rgba(117,117,117,0.4) 100%);
            border-color: rgba(224, 224, 224, 0.4);
          }
          .rank-3-new { 
            --rank-color-main: #CD7F32; 
            --rank-color-light: #E2A76F;
            background: linear-gradient(135deg, rgba(205,127,50,0.2) 0%, rgba(92,58,31,0.4) 100%);
            border-color: rgba(205, 127, 50, 0.4);
          }
          .custom-scrollbar::-webkit-scrollbar {
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d91d83;
            border-radius: 10px;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .story-ring {
            background: linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7);
            padding: 2px; 
            border-radius: 9999px;
          }
          .pinkflash-scroll-container {
            scroll-snap-type: x mandatory;
          }
          .pinkflash-item {
            scroll-snap-align: start;
          }
          .hover\:shadow-pink-glow:hover {
            box-shadow: 0 0 12px rgba(218, 11, 125, 0.25);
          }
        `}</style>

        <Footer />
      </div>
    </AgeGateWrapper>
  );
};

export default Index;









