import { MapPin, Star, Eye, Clock, Diamond, Phone, Users, Calendar, CheckCircle, BadgeCheck, MessageCircle, DollarSign, Home, Car, MapIcon, ChevronLeft, ChevronRight, MessageSquare, Play, Pause, Volume2, Link, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface CompanionCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  gallery?: string[];
  videos?: string[]; // URLs dos vídeos
  videoThumbnails?: string[]; // Thumbnails dos vídeos
  audioUrl?: string;
  rating: number;
  tags: string[];
  isFeatured?: boolean;
  phone?: string;
  age?: number;
  height?: string;
  measurements?: string;
  description?: string;
  pricePerHour?: string;
  hasOwnLocation?: boolean;
  acceptsClientLocation?: boolean;
  acceptsMotel?: boolean;
  citiesServed?: string[];
}

const CompanionCard = ({ 
  id, 
  name, 
  location, 
  image, 
  gallery,
  videos,
  videoThumbnails,
  audioUrl,
  rating, 
  tags, 
  isFeatured,
  phone,
  age,
  height,
  measurements,
  description,
  pricePerHour,
  hasOwnLocation,
  acceptsClientLocation,
  acceptsMotel,
  citiesServed
}: CompanionCardProps) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Criar array de todas as mídias (imagens + vídeos)
  const allMedia = [
    image,
    ...(gallery || []).filter(item => item !== image),
    ...(videos || [])
  ].filter(Boolean);

  // Função para verificar se é vídeo
  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  // Função para obter thumbnail do vídeo
  const getVideoThumbnail = (index: number) => {
    if (videoThumbnails && videoThumbnails[index]) {
      return videoThumbnails[index];
    }
    return image; // Fallback para a imagem principal
  };

  // Função para validar e corrigir URLs de mídia
  const getValidMediaUrl = (url: string | undefined): string => {
    const defaultImageUrl = "/default-profile.png";
    
    if (!url || 
        url === 'foto/' || 
        url === 'foto' || 
        url.length < 10 || 
        (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return defaultImageUrl;
    }
    
    return url;
  };

  // Funções para touch events (swipe)
  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (!touchStart || !touchStartY) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const currentTouchY = e.targetTouches[0].clientY;
    
    // Calcular diferença horizontal e vertical
    const deltaX = Math.abs(currentTouch - touchStart);
    const deltaY = Math.abs(currentTouchY - touchStartY);
    
    // Se movimento horizontal é maior que vertical, prevenir scroll
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
    
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30; // minSwipeDistance
    const isRightSwipe = distance < -30;

    if (isLeftSwipe && allMedia.length > 1) {
      // Swipe para esquerda - próxima mídia
      setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
    }
    
    if (isRightSwipe && allMedia.length > 1) {
      // Swipe para direita - mídia anterior  
      setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    }
    
    // Reset das variáveis
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
  };

  // Funções de navegação
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Função para lidar com erro de vídeo
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Erro ao carregar vídeo:', e);
    const video = e.target as HTMLVideoElement;
    console.error('Detalhes do erro:', {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState
    });
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-lg bg-pink-100 w-full mx-auto h-full flex flex-col border border-pink-300 md:border-gray-900"
      onClick={handleViewProfile}
      style={{ minHeight: '550px', boxShadow: '0 5px 20px -5px rgba(219, 39, 119, 0.4)' }}
    >
      {/* Container de mídia com suporte a swipe */}
      <div 
        ref={imageContainerRef}
        className="relative h-[31rem] md:h-96 overflow-hidden rounded-lg bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        {/* Renderizar vídeo ou imagem */}
        {isVideo(allMedia[currentImageIndex]) ? (
          <video
            ref={videoRef}
            src={getValidMediaUrl(allMedia[currentImageIndex])}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 select-none"
            controls
            playsInline
            preload="metadata"
            poster={getVideoThumbnail(currentImageIndex)}
            onError={handleVideoError}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img 
            src={getValidMediaUrl(allMedia[currentImageIndex])} 
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 select-none"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-profile.png";
            }}
            draggable={false}
          />
        )}
        
        {/* Botões de navegação - Só aparecem se houver mais de 1 mídia */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20"
            >
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20"
            >
              <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            
            {/* Indicadores de mídia */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`relative w-2.5 h-2.5 md:w-2 md:h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                >
                  {isVideo(media) && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      🎥
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-white/90 backdrop-blur-md text-gray-800 px-2 py-1 md:px-2 md:py-0.5 rounded-full text-sm md:text-xs font-medium flex items-center shadow-sm border border-gray-200">
            <div className="w-1.5 h-1.5 md:w-1 md:h-1 rounded-full bg-green-500 mr-1"></div>
            <span className="text-sm md:text-xs">disponível</span>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md text-gray-800 px-2 py-1 md:px-2 md:py-0.5 rounded-full text-sm md:text-xs font-medium flex items-center shadow-sm border border-gray-200">
            <CheckCircle className="w-3 h-3 md:w-2.5 md:h-2.5 text-blue-500 mr-1" />
            <span className="text-sm md:text-xs">verificada</span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 md:px-2 md:py-0.5 flex items-center space-x-1 shadow-sm border border-gray-200">
          <Star className="w-3 h-3 md:w-2.5 md:h-2.5 text-yellow-500 fill-current" />
          <span className="text-gray-800 text-sm md:text-xs font-medium">{rating}</span>
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      {/* Resto do card (informações, etc.) */}
      {/* ... resto do código existente ... */}
    </div>
  );
};

export default CompanionCard; 