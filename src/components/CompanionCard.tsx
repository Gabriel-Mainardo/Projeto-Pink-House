import { Heart, CheckCircle, Crown, Eye, Volume2, Play, Pause, Phone, Bell, Globe, MessageSquare, X, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

type Plan = "free" | "gold" | "rosa" | "black";

interface CompanionCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  gallery?: string[];
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);

  const isAmbassador = plan === 'black';

  const handleViewProfile = () => {
    navigate(`/perfil/${id}`);
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

    // Remove tudo antes da cidade, mantém apenas "Cidade - Estado"
    const parts = location.split(' - ').map(p => p.trim()).filter(p => p);

    if (parts.length >= 3) {
      // Bairro - Cidade - Estado
      const neighborhood = parts[parts.length - 3];
      const city = parts[parts.length - 2];
      const state = parts[parts.length - 1];

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
    <div className={`relative bg-white rounded-3xl overflow-hidden shadow-lg border-[3px] h-full flex flex-col ${isAmbassador ? 'border-yellow-400' : 'border-transparent'}`}
      onClick={handleViewProfile}
      style={{ cursor: 'pointer' }}
    >
      {/* Image / Video Container */}
      <div className="relative h-72 w-full bg-gray-900">
        {adVideo ? (
          <>
            <video
              ref={videoRef}
              src={adVideo}
              className="w-full h-full object-cover object-center"
              autoPlay
              muted={videoMuted}
              loop
              playsInline
              onClick={(e) => { e.stopPropagation(); setVideoMuted(m => !m); }}
            />
            {/* Botão mute */}
            <button
              onClick={(e) => { e.stopPropagation(); setVideoMuted(m => !m); }}
              className="absolute bottom-10 right-3 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors z-10"
              title={videoMuted ? 'Ativar som' : 'Silenciar'}
            >
              {videoMuted ? (
                <Volume2 className="w-3.5 h-3.5 opacity-50" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </>
        ) : (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-profile.png";
            }}
          />
        )}
        {/* Overlay de preço */}
        {pricePerHour && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 py-3 pointer-events-none">
            <span className="text-white font-bold text-lg drop-shadow">
              {String(pricePerHour).startsWith('R$') ? pricePerHour : `R$ ${Number(pricePerHour).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}/h
            </span>
          </div>
        )}

        {/* Top Left: Ambassador Badge */}
        {isAmbassador && (
          <div className="absolute top-4 left-4">
            <div className="bg-yellow-400/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
              <Crown className="w-5 h-5 text-yellow-800" />
            </div>
          </div>
        )}

        {/* Boost Badge - Subida Ativa */}
        {hasBoost && (
          <div className={`absolute ${isAmbassador ? 'top-16' : 'top-4'} left-4`}>
            <div
              className="backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1 animate-pulse"
              style={{
                backgroundColor: `${boostColor}E6`, // E6 = 90% opacity
              }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {'Disponivel agora'}
              </span>
            </div>
          </div>
        )}

        {/* Top Right: Verified Badge & Heart */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {plan !== 'free' && (
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1 shadow-sm">
              <CheckCircle className="w-3 h-3 text-green-700" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Verificada</span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            {liked ? (
              <Heart className="w-5 h-5 text-pink-500 fill-current" />
            ) : (
              <Heart className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Name + Availability */}
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-xl font-bold text-gray-900">
            {name}
          </h3>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1.5 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
              {isAvailable ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* City / Neighborhood */}
        <p className="text-sm text-gray-500 mb-1.5">
          {formatLocation(location)}{age ? ` · ${age} anos` : ''}
        </p>

        {/* Description - italic */}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-3 italic">
            {description}
          </p>
        )}

        {/* Reliability Bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className="bg-pink-400 h-1 rounded-full w-[92%]"></div>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && audioUrl.trim() !== '' && (
          <div className="bg-pink-50 rounded-lg p-3 flex items-center space-x-3 mb-4 cursor-pointer hover:bg-pink-100 transition-colors"
            onClick={toggleAudio}
          >
            <div className="bg-pink-100 p-1.5 rounded-full">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-pink-700" />
              ) : (
                <Play className="w-4 h-4 text-pink-700" />
              )}
            </div>
            <span className="text-xs font-medium text-pink-700" style={{ }}>Ouça minha voz</span>
            <div className="flex-1 h-6 flex items-center">
              {/* Fake Waveform Visual */}
              <div className="flex items-center space-x-[2px] h-full w-full opacity-50">
                {waveHeights.map((height, i) => {
                  const progress = duration > 0 ? currentTime / duration : 0;
                  const isFilled = i < Math.floor(progress * waveHeights.length);
                  return (
                    <div
                      key={i}
                      className="w-1 rounded-full"
                      style={{
                        height: `${height}%`,
                        backgroundColor: isFilled ? '#be185d' : '#f9a8d4'
                      }}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Audio Element */}
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

        {/* Spacer para empurrar botões para o final */}
        <div className="flex-1"></div>

        {/* Actions */}
        <div className="space-y-2 mb-3">
          {isAvailable ? (
            <button
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-full shadow-md shadow-pink-200 transition-all text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowContactPopup(true);
              }}
            >
              Enviar mensagem
            </button>
          ) : (
            <div className="w-full bg-gray-100 text-gray-500 text-center font-medium py-2.5 rounded-full text-xs">
              Offline — contatos indisponíveis
            </div>
          )}
          <button
            className="w-full bg-transparent border border-pink-400 text-pink-500 font-bold py-2.5 rounded-full hover:bg-pink-50 transition-all text-sm flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
          >
            <Eye className="w-4 h-4 mr-2" /> Ver perfil
          </button>
        </div>

        {/* Contact Popup */}
        {showContactPopup && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4"
            onClick={(e) => { e.stopPropagation(); setShowContactPopup(false); }}
          >
            <div
              className="bg-white rounded-2xl p-5 mx-4 w-full max-w-xs shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-800">Falar com {name}</h4>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowContactPopup(false); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
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
                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
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
                  className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
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
                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Ligar</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Presente - futuro
                  }}
                  className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">Enviar presente</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default CompanionCard;
