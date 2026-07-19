import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Gift,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageSquare,
  Pause,
  Play,
  ShieldCheck,
  Star,
  Video,
  X,
} from 'lucide-react';

export interface AdPreviewProfile {
  id: string;
  name: string;
  age?: number;
  location?: string;
  image?: string;
  gallery?: string[];
  videos?: string[];
  videoThumbnails?: string[];
  audioUrl?: string;
  adVideo?: string | null;
  video_url?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  phone?: string;
  pricePerHour?: string;
  isAvailable?: boolean;
  is_available?: boolean;
  isVerified?: boolean;
  is_verified?: boolean;
  reliabilityScore?: number;
  rank?: number;
}

interface AdPreviewModalProps {
  profile: AdPreviewProfile;
  onClose: () => void;
  onContact: () => void;
}

const waveHeights = [50, 75, 35, 100, 65, 48, 82, 28, 56, 38, 70, 46, 88, 34];

const clampPercent = (value?: number) => Math.max(0, Math.min(100, Number(value) || 0));

const splitDescription = (description?: string) => {
  const fallback = 'Perfil com atendimento exclusivo, comunicação direta e informações verificadas pela PinkHouse.';
  const text = (description || fallback).trim();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length >= 2) return sentences.slice(0, 4);
  return [text];
};

const AdPreviewModal = ({ profile, onClose, onContact }: AdPreviewModalProps) => {
  const navigate = useNavigate();
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isHeroPlaying, setIsHeroPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const isAvailable = profile.isAvailable ?? profile.is_available ?? true;
  const reliabilityScore = clampPercent(profile.reliabilityScore);
  const isVerified = profile.isVerified ?? profile.is_verified ?? reliabilityScore >= 100;
  const rating = Number(profile.rating || 0);
  const heroVideo = profile.adVideo || profile.video_url || profile.videos?.[0] || '';
  const gallery = useMemo(() => {
    const items = [profile.image, ...(profile.gallery || [])].filter(Boolean) as string[];
    return Array.from(new Set(items)).slice(0, 8);
  }, [profile.gallery, profile.image]);
  const videos = useMemo(() => {
    const items = [heroVideo, ...(profile.videos || [])].filter(Boolean) as string[];
    return Array.from(new Set(items)).slice(0, 6);
  }, [heroVideo, profile.videos]);
  const services = useMemo(() => {
    return (profile.tags || []).map((tag) => tag.trim()).filter(Boolean);
  }, [profile.tags]);
  const descriptionParts = splitDescription(profile.description);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const toggleHeroVideo = () => {
    if (!heroVideoRef.current) return;

    if (heroVideoRef.current.paused) {
      void heroVideoRef.current.play()
        .then(() => setIsHeroPlaying(true))
        .catch(() => setIsHeroPlaying(false));
      return;
    }

    heroVideoRef.current.pause();
    setIsHeroPlaying(false);
  };

  const toggleAudio = () => {
    if (!audioRef.current || !profile.audioUrl) return;

    if (audioRef.current.paused) {
      void audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch(() => setIsAudioPlaying(false));
      return;
    }

    audioRef.current.pause();
    setIsAudioPlaying(false);
  };

  const handleGift = () => {
    onClose();
    navigate('/pinkpoints');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] overflow-x-hidden overflow-y-auto bg-black/90 px-4 py-6 text-[#e5e2e1] backdrop-blur-md sm:px-6 lg:px-10"
      onClick={onClose}
    >
      <div
        className="mx-auto min-h-full w-full max-w-[1440px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-white/20"
            aria-label="Fechar anúncio"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#1a1a1a]/70 shadow-2xl backdrop-blur-xl sm:min-h-[680px]">
            {heroVideo ? (
              <video
                ref={heroVideoRef}
                src={heroVideo}
                poster={profile.image || '/default-profile.png'}
                className="h-full w-full object-cover"
                playsInline
                preload="metadata"
                onEnded={() => setIsHeroPlaying(false)}
              />
            ) : (
              <img
                src={profile.image || '/default-profile.png'}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            )}

            {profile.rank && profile.rank <= 3 && (
              <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-[#3c2f00] shadow-lg" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' }}>
                <ShieldCheck className="h-4 w-4 fill-current" />
                {profile.rank}º LUGAR
              </div>
            )}

            {heroVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <button
                  type="button"
                  onClick={toggleHeroVideo}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-105 sm:h-24 sm:w-24"
                  aria-label={isHeroPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                >
                  {isHeroPlaying ? (
                    <Pause className="h-9 w-9 fill-current" />
                  ) : (
                    <Play className="ml-1 h-10 w-10 fill-current" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-7">
            <div>
              <h2 className="text-[34px] font-extrabold leading-tight text-white sm:text-5xl">
                Olá, sou <span className="text-[#ff4994]">{profile.name}</span>
                {profile.age ? <> e tenho <span className="text-[#ff4994]">{profile.age} anos</span></> : null}
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 backdrop-blur-xl">
                  <CheckCircle className="h-4 w-4 text-[#4ae176]" />
                  <span className="text-sm font-bold text-[#4ae176]">
                    {reliabilityScore}% {isVerified ? 'Verificada' : 'Confiabilidade'}
                  </span>
                </div>
                {rating > 0 && (
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 backdrop-blur-xl">
                    <Star className="h-4 w-4 fill-[#e9c349] text-[#e9c349]" />
                    <span className="text-sm font-bold text-white">{rating.toFixed(1)} avaliação</span>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 backdrop-blur-xl">
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-[#4ae176]' : 'bg-rose-400'}`} />
                  <span className="text-sm font-bold text-white">{isAvailable ? 'Online Agora' : 'Offline'}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 backdrop-blur-xl">
                    <MapPin className="h-4 w-4 text-[#ffb1c7]" />
                    <span className="text-sm font-bold text-white">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#e2bdc6]">Nível de Confiabilidade</span>
                <span className="font-black text-[#ffb1c7]">{reliabilityScore}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`${reliabilityScore >= 80 ? 'bg-[#4ae176]' : reliabilityScore >= 50 ? 'bg-[#e9c349]' : 'bg-rose-400'} h-full rounded-full`} style={{ width: `${reliabilityScore}%` }} />
              </div>
            </div>

            {profile.audioUrl && (
              <div className="flex items-center gap-5 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#ff4994] text-[#ff4994] transition-colors hover:bg-[#ff4994]/10"
                  aria-label={isAudioPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
                >
                  {isAudioPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-0.5 h-6 w-6 fill-current" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#ffb1c7]">Ouça minha voz</p>
                  <div className="flex h-8 items-end gap-1">
                    {waveHeights.map((height, index) => {
                      const progress = audioDuration > 0 ? audioTime / audioDuration : 0;
                      const isFilled = index < Math.floor(progress * waveHeights.length);
                      return (
                        <span
                          key={`${height}-${index}`}
                          className="w-1 rounded-full bg-[#ff4994]"
                          style={{
                            height: `${height}%`,
                            opacity: isFilled ? 1 : 0.35,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={profile.audioUrl}
                  preload="metadata"
                  onTimeUpdate={() => setAudioTime(audioRef.current?.currentTime || 0)}
                  onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
                  onEnded={() => {
                    setIsAudioPlaying(false);
                    setAudioTime(0);
                  }}
                />
              </div>
            )}

            <div className="space-y-4 text-base leading-relaxed text-[#e2bdc6] sm:text-lg">
              {descriptionParts.map((part) => (
                <p key={part}>{part}</p>
              ))}
            </div>

            {services.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#e2bdc6]">Serviços</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-[#ff4994]/30 bg-[#ff4994]/15 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#ffb1c7]"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onContact}
                className="flex h-14 min-w-[220px] flex-1 items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#ff4994] to-[#ba0061] text-base font-black text-white shadow-[0_0_20px_rgba(255,45,141,0.35)] transition-transform hover:scale-[1.02] active:scale-95 sm:h-16"
              >
                <MessageSquare className="h-5 w-5" />
                CONTATO
              </button>
              <button
                type="button"
                onClick={handleGift}
                className="flex h-14 flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-7 text-base font-black text-white backdrop-blur-xl transition-colors hover:bg-white/15 sm:h-16 lg:flex-none"
              >
                <Gift className="h-5 w-5 text-[#ffb1c7]" />
                Enviar Presente
              </button>
            </div>
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-[#ffb1c7]" />
                <h3 className="text-3xl font-black text-white">Fotos</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {gallery.map((photo) => (
                <div key={photo} className="aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl">
                  <img src={photo} alt={`Foto de ${profile.name}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                </div>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="mb-10 mt-14">
            <div className="mb-6 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <Video className="h-6 w-6 text-[#ffb1c7]" />
                <h3 className="text-3xl font-black text-white">Vídeos</h3>
                <span className="rounded bg-[#ff4994]/20 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff4994]">VIP Exclusive</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {videos.map((video, index) => (
                <div key={video} className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl">
                  <video src={video} poster={profile.videoThumbnails?.[index] || profile.image || '/default-profile.png'} className="h-full w-full object-cover brightness-75" controls playsInline preload="metadata" />
                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    <Lock className="h-3.5 w-3.5 text-[#ffb1c7]" />
                    Conteúdo VIP
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AdPreviewModal;
