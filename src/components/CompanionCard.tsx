import { Heart, CheckCircle, Crown, Volume2, Play, Pause, Phone, Globe, MessageSquare, X, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import AdPreviewModal from './AdPreviewModal';

type Plan = "free" | "gold" | "rosa" | "black";

interface CompanionCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  gallery?: string[];
  videos?: string[];
  videoThumbnails?: string[];
  adVideo?: string;
  audioUrl?: string;
  rating: number;
  tags: string[];
  phone?: string;
  age?: number;
  description?: string;
  pricePerHour?: string;
  plan?: Plan;
  isAvailable?: boolean;
  hasBoost?: boolean;
  boostBadge?: string;
  boostColor?: string;
}

const CompanionCard = ({
  id,
  name,
  location,
  image,
  gallery,
  videos,
  videoThumbnails,
  adVideo,
  audioUrl,
  rating,
  phone,
  age,
  description,
  pricePerHour,
  plan = "free",
  isAvailable = true,
  hasBoost = false,
  boostBadge = "Disponivel agora",
  boostColor = "#FF007F"
}: CompanionCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showAdPreview, setShowAdPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);

  const isAmbassador = plan === 'black';
  const reliabilityPercent = 92;

  const handleViewProfile = () => {
    setShowAdPreview(true);
  };

  const formatPhoneForWhatsApp = (phoneNumber: string) => {
    const numbersOnly = phoneNumber.replace(/\D/g, '');
    if (numbersOnly.length <= 11) {
      return `55${numbersOnly}`;
    }
    return numbersOnly;
  };

  const formatLocation = (location: string) => {
    if (!location) return '';

    const parts = location.split(' - ').map(p => p.trim()).filter(p => p);

    if (parts.length >= 3) {
      const neighborhood = parts[parts.length - 3];
      const city = parts[parts.length - 2];

      return `${city} - ${neighborhood}`;
    }

    if (parts.length === 2) {
      const city = parts[0];
      const state = parts[1];

      const stateMap: { [key: string]: string } = {
        'Pernambuco': 'PE', 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG',
        'Bahia': 'BA', 'Ceará': 'CE', 'Paraíba': 'PB', 'Rio Grande do Norte': 'RN',
        'Alagoas': 'AL', 'Sergipe': 'SE', 'Piauí': 'PI', 'Maranhão': 'MA',
        'Amazonas': 'AM', 'Pará': 'PA', 'Acre': 'AC', 'Rondônia': 'RO',
        'Roraima': 'RR', 'Amapá': 'AP', 'Tocantins': 'TO', 'Goiás': 'GO',
        'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Distrito Federal': 'DF',
        'Paraná': 'PR', 'Santa Catarina': 'SC', 'Rio Grande do Sul': 'RS',
        'Espírito Santo': 'ES'
      };

      return `${city} - ${stateMap[state] || state}`;
    }

    return location;
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const waveHeights = [40, 60, 30, 80, 50, 90, 40, 70, 30, 50, 20, 60, 80, 40, 30];

  return (
    <>
      <div
        className={`group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-soft transition-all duration-300 hover:shadow-xl ${
          isAmbassador ? 'ring-2 ring-yellow-400 shadow-yellow-400/20' : ''
        }`}
        onClick={handleViewProfile}
      >
        {adVideo ? (
          <>
            <video
              ref={videoRef}
              src={adVideo}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              autoPlay
              muted={videoMuted}
              loop
              playsInline
              onClick={(e) => { e.stopPropagation(); setVideoMuted(m => !m); }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setVideoMuted(m => !m); }}
              className="absolute left-1/2 top-[42%] z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 sm:top-[40%] sm:h-16 sm:w-16"
              title={videoMuted ? 'Ativar som' : 'Silenciar'}
            >
              {videoMuted ? (
                <Volume2 className="h-7 w-7 opacity-50 sm:h-8 sm:w-8" />
              ) : (
                <Volume2 className="h-7 w-7 sm:h-8 sm:w-8" />
              )}
            </button>
          </>
        ) : (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-profile.png";
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        {!adVideo && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/5" />
            <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 sm:top-[40%]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/20 shadow-lg backdrop-blur-md transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
                <Play className="ml-1 h-8 w-8 fill-white text-white sm:h-9 sm:w-9" />
              </div>
            </div>
          </>
        )}

        <div className="absolute left-4 top-4 z-20 flex flex-col items-start gap-2">
          {isAmbassador && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400/90 shadow-lg backdrop-blur-sm">
              <Crown className="h-5 w-5 text-yellow-800" />
            </div>
          )}

          <div className={`${isAvailable ? 'bg-green-500/90' : 'bg-red-500/90'} flex items-center gap-1.5 rounded-full px-3 py-1 shadow-md backdrop-blur-md`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              {isAvailable ? 'Disponível Agora' : 'Offline'}
            </span>
          </div>

          {hasBoost && (
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1 shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: `${boostColor}E6` }}
            >
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                {'Disponivel agora'}
              </span>
            </div>
          )}
        </div>

        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          {plan !== 'free' && (
            <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 text-green-700" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-green-700">Verificada</span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            {liked ? (
              <Heart className="h-5 w-5 fill-current text-pink-500" />
            ) : (
              <Heart className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-24 sm:p-5 sm:pt-32">
          {pricePerHour && (
            <span className="mb-2 inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm sm:mb-3 sm:text-sm">
              {String(pricePerHour).startsWith('R$') ? pricePerHour : `R$ ${Number(pricePerHour).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}/h
            </span>
          )}

          <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
            <h3 className="truncate text-lg font-bold leading-tight text-white sm:text-xl">
              {name}{age ? `, ${age}` : ''}
            </h3>
            {isAvailable && (
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
            )}
          </div>

          <div className="mb-2.5 sm:mb-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/75 sm:text-[10px]">
                Confiabilidade: {reliabilityPercent}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
              <div className="h-full rounded-full bg-green-400" style={{ width: `${reliabilityPercent}%` }} />
            </div>
          </div>

          <p className="mb-3 flex items-center gap-1 text-xs font-medium text-gray-200 sm:mb-4 sm:text-sm">
            <Globe className="h-3.5 w-3.5 flex-shrink-0 text-gray-200 sm:h-4 sm:w-4" />
            <span className="truncate">{formatLocation(location)}</span>
          </p>

          {audioUrl && audioUrl.trim() !== '' && (
            <div
              className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:mb-4 sm:gap-3 sm:p-3"
              onClick={toggleAudio}
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 sm:h-8 sm:w-8">
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 text-pink-700 sm:h-4 sm:w-4" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-pink-700 sm:h-4 sm:w-4" />
                )}
              </div>
              <span className="text-[10px] font-bold text-white sm:text-xs">Ouça minha voz</span>
              <div className="flex h-5 flex-1 items-center sm:h-6">
                <div className="flex h-full w-full items-center gap-[2px] opacity-75">
                  {waveHeights.map((height, i) => {
                    const progress = duration > 0 ? currentTime / duration : 0;
                    const isFilled = i < Math.floor(progress * waveHeights.length);
                    return (
                      <div
                        key={i}
                        className="w-1 rounded-full"
                        style={{
                          height: `${height}%`,
                          backgroundColor: isFilled ? '#ffffff' : 'rgba(255,255,255,0.45)'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex h-10 items-center justify-center rounded-xl border border-white/40 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10 sm:h-11 sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAdPreview(true);
              }}
            >
              Ver Perfil
            </button>
            {isAvailable ? (
              <button
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#da0b7d] text-xs font-bold text-white shadow-lg shadow-[#da0b7d]/30 transition-colors hover:bg-[#b00965] sm:h-11 sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContactPopup(true);
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
                CONTATO
              </button>
            ) : (
              <div className="flex h-10 items-center justify-center rounded-xl bg-white/15 text-center text-xs font-bold text-white/70 sm:h-11">
                Offline
              </div>
            )}
          </div>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={handleAudioEnded}
            preload="metadata"
          />
        )}
      </div>

      {showContactPopup && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setShowContactPopup(false); }}
        >
          <div
            className="mx-4 w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800">Falar com {name}</h4>
              <button
                onClick={(e) => { e.stopPropagation(); setShowContactPopup(false); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              {phone && phone.trim() !== '' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${formatPhoneForWhatsApp(phone)}?text=Olá ${name}, vi seu perfil no Pink House e gostaria de conversar.`, '_blank');
                    setShowContactPopup(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl bg-green-50 px-4 py-2.5 transition-colors hover:bg-green-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">WhatsApp</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/mensagens?companion_id=${id}`);
                  setShowContactPopup(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-pink-50 px-4 py-2.5 transition-colors hover:bg-pink-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-pink-700">Mensagem no app</span>
              </button>
              {phone && phone.trim() !== '' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${phone}`;
                    setShowContactPopup(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-2.5 transition-colors hover:bg-blue-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Ligar</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Presente - futuro
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-purple-50 px-4 py-2.5 transition-colors hover:bg-purple-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-700">Enviar presente</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showAdPreview && (
        <AdPreviewModal
          profile={{
            id,
            name,
            age,
            location,
            image,
            gallery,
            videos: Array.from(new Set([adVideo, ...(videos || [])].filter(Boolean) as string[])),
            videoThumbnails,
            audioUrl,
            adVideo,
            rating,
            phone,
            description,
            pricePerHour,
            isAvailable,
            reliabilityScore: reliabilityPercent,
            isVerified: plan !== 'free',
          }}
          onClose={() => setShowAdPreview(false)}
          onContact={() => {
            setShowAdPreview(false);
            setShowContactPopup(true);
          }}
        />
      )}
    </>
  );
};

export default CompanionCard;
