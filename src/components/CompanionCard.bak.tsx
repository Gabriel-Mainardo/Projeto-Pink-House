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
  audioUrl?: string; // URL do áudio de apresentação
  rating: number;
  tags: string[];
  isFeatured?: boolean;
  phone?: string;
  age?: number;
  height?: string;
  measurements?: string;
  description?: string;
  // Usando camelCase conforme o Catalog.tsx
  pricePerHour?: string;
  hasOwnLocation?: boolean;
  acceptsClientLocation?: boolean;
  acceptsMotel?: boolean;
  citiesServed?: string[]; // Novo campo para cidades atendidas
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
  
  // Estados do player de áudio
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Alturas fixas das ondas para efeito decorativo - mais ondas, mais finas
  // Array menor para desktop
  const desktopWaveHeights = [8, 16, 12, 20, 14, 18, 10, 15, 9, 17, 11, 19, 13, 16, 8, 14, 12, 18, 10, 16, 13, 20, 9, 15];
  
  // Array completo para mobile
  const mobileWaveHeights = [...desktopWaveHeights, 11, 17, 14, 19, 12, 16, 10, 18, 13, 17, 9, 15, 12, 19, 11, 16, 14, 20, 8, 18, 10, 17, 13, 15];
  
  // Usar hook para detectar mobile
  const isMobile = useIsMobile();
  
  // Escolher array baseado no device
  const waveHeights = isMobile ? mobileWaveHeights : desktopWaveHeights;

  // Criar array de todas as mídias (imagens + vídeos)
  const allImages = [
    image, 
    ...(gallery || []).filter(galleryImage => galleryImage !== image),
    ...(videos || [])
  ].filter(Boolean);

  // Função para verificar se é vídeo
  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  // Minimum swipe distance (em pixels) - tornando mais sensível
  const minSwipeDistance = 30;

  // Usando hook de mobile

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && allImages.length > 1) {
      // Swipe para esquerda - próxima imagem
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
    
    if (isRightSwipe && allImages.length > 1) {
      // Swipe para direita - imagem anterior  
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
    
    // Reset das variáveis
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
  };

  // Função para validar e corrigir URLs de imagem
  const getValidImageUrl = (imageUrl: string | undefined): string => {
    const defaultImageUrl = "/default-profile.png";
    
    if (!imageUrl || 
        imageUrl === 'foto/' || 
        imageUrl === 'foto' || 
        imageUrl.length < 10 || 
        (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      return defaultImageUrl;
    }
    
    return imageUrl;
  };

  const handleViewProfile = () => {
    navigate(`/profile/${id}`);
  };

  const formatPhoneForWhatsApp = (phoneNumber: string) => {
    // Remove tudo que não for número
    const numbersOnly = phoneNumber.replace(/\D/g, '');
    
    // Adiciona o código do Brasil (55) se não tiver
    if (numbersOnly.length <= 11) {
      return `55${numbersOnly}`;
    }
    
    return numbersOnly;
  };

  const getLocationOptions = () => {
    const options = [];
    if (hasOwnLocation) options.push('ownPlace');
    if (acceptsClientLocation) options.push('goToYou');
    if (acceptsMotel) options.push('motel');
    return options;
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Funções do player de áudio
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

  const formatTime = (time: number) => {
    if (!time || time === Infinity || isNaN(time)) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDurationInSeconds = (time: number) => {
    if (!time || time === Infinity || isNaN(time)) {
      return '0s';
    }
    return `${Math.floor(time)}s`;
  };

  // Função para copiar link do perfil
  const copyProfileLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const profileUrl = `${window.location.origin}/profile/${id}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      // Método moderno (HTTPS)
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('✅ Link copiado! Cole nos seus stories do Instagram ou WhatsApp');
      }).catch(() => {
        // Fallback se falhar
        fallbackCopyTextToClipboard(profileUrl);
      });
    } else {
      // Fallback para HTTP ou navegadores antigos
      fallbackCopyTextToClipboard(profileUrl);
    }
  };

  // Função fallback para copiar texto
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('✅ Link copiado! Cole nos seus stories do Instagram ou WhatsApp');
    } catch (err) {
      // Se tudo falhar, mostrar o link para copiar manualmente
      prompt('📋 Copie este link:', text);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-lg bg-pink-100 w-full mx-auto h-full flex flex-col border border-pink-300 md:border-gray-900"
      onClick={handleViewProfile}
      style={{ minHeight: '550px', boxShadow: '0 5px 20px -5px rgba(219, 39, 119, 0.4)' }}
    >
      
      {/* Image Container com suporte a swipe */}
      <div 
        ref={imageContainerRef}
        className="relative h-[31rem] md:h-96 overflow-hidden rounded-lg bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <img 
          src={getValidImageUrl(allImages[currentImageIndex])} 
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 select-none"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-profile.png";
          }}
          draggable={false}
        />
        
        {/* Botões de navegação de fotos - Só aparecem se houver mais de 1 foto */}
        {allImages.length > 1 && (
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
            
            {/* Indicadores de foto */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Status Badges - No canto esquerdo superior */}
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

        {/* Overlay premium com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        
        {/* Segundo overlay com gradiente horizontal para dar profundidade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      {/* Linha decorativa abaixo da foto */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-300 via-pink-500 to-pink-300 md:bg-gray-300"></div>

      {/* Card Content - FUNDO ROSA E CAIXINHAS BRANCAS */}
      <div className="p-2 space-y-1.5 relative bg-pink-100 border-t border-pink-300 md:border-gray-300 flex-1 flex flex-col">
        {/* Header com nome apenas */}
        <div className="space-y-0.5">
          <h3 className="text-lg md:text-base font-serif font-semibold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-700 group-hover:to-pink-600 transition-all duration-500">
            {name}
          </h3>
          

        </div>

        {/* Player de Áudio - Primeira seção ocupando toda a largura */}
          {audioUrl && (
          <div className="bg-white rounded-lg p-2 md:p-1.5 space-y-1 md:space-y-0.5 border border-gray-200 shadow-sm mb-2">
            <div className="flex items-center space-x-1">
              <Volume2 className="w-4 h-4 md:w-3 md:h-3 text-black" />
              <span className="text-sm md:text-xs font-bold text-black">ouça minha voz</span>
            </div>
            
                            <div className="flex items-center space-x-2">
            <button
              onClick={toggleAudio}
                    className="w-8 h-8 bg-velvet-pink-600 hover:bg-velvet-pink-700 rounded-full flex items-center justify-center transition-all duration-200"
            >
              {isPlaying ? (
                      <Pause className="w-3 h-3 text-white" />
              ) : (
                      <Play className="w-3 h-3 text-white ml-0.5" />
              )}
            </button>
                  
                  {/* Ondas sonoras com progresso - contidas no card */}
                  <div className="flex-1 flex items-center justify-center space-x-px sm:space-x-0.5 px-0.5 sm:px-4 mx-auto max-w-full">
                    {waveHeights.map((height, index) => {
                      // Lógica simples: se tocando, preenche por progresso
                      const totalWaves = waveHeights.length;
                      let isFilled = false;
                      
                      if (isPlaying && duration > 0) {
                        const progress = currentTime / duration;
                        const wavesToFill = Math.floor(progress * totalWaves);
                        isFilled = index < wavesToFill;
                      }
                      
                                              return (
                          <div
                            key={index}
                            className="w-1 sm:w-1 rounded-full"
                            style={{
                              height: `${height}px`,
                              backgroundColor: isFilled ? '#ec4899' : '#d1d5db'
                            }}
                          />
                        );
                    })}
                  </div>
                  
                  {/* Contador de segundos no final */}
                  <div className="text-xs text-gray-600 font-medium">
                    {Math.floor(currentTime || 0)}s/{duration && isFinite(duration) ? Math.floor(duration) : 0}s
                  </div>
        </div>
            
            {/* Elemento de áudio */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onLoadedMetadata={handleAudioLoadedMetadata}
              onEnded={handleAudioEnded}
              preload="metadata"
            />
          </div>
        )}

        {/* Layout dividido - Duas colunas - flex-1 para ocupar espaço disponível */}
        <div className="grid grid-cols-2 gap-2 text-sm md:text-xs flex-1">
          {/* Coluna Esquerda - Informações físicas e comerciais */}
          <div className="space-y-1.5 flex flex-col">
            {/* Valores - Sempre mostrar - MOVIDO PARA O TOPO */}
            <div className="bg-white rounded-lg p-2 md:p-1.5 space-y-1 md:space-y-0.5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 md:w-3 md:h-3 text-black" />
                <span className="text-sm md:text-xs font-bold text-black">valores</span>
              </div>
              
              {pricePerHour ? (
                <div className="md:text-xs" style={{ fontSize: '13px' }}>
                  <span style={{ color: '#111827', fontWeight: 'bold' }}>hora:</span> 
                  <span style={{ color: '#111827', fontWeight: 'normal' }}> R$ {pricePerHour}</span>
                </div>
              ) : (
                <div className="md:text-xs" style={{ fontSize: '13px' }}>
                  <span style={{ color: '#111827', fontWeight: 'bold' }}>hora:</span> 
                  <span style={{ color: '#111827', fontWeight: 'normal' }}> consultar</span>
                </div>
              )}
            </div>

            {/* Idade, Altura, Local e Cidade - ALTURA ADICIONADA AQUI */}
            <div className="bg-white rounded-lg p-2 md:p-1.5 space-y-1 md:space-y-0.5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 md:w-3 md:h-3 text-black" />
                <span className="text-sm md:text-xs font-bold text-black">informações</span>
              </div>
              
              <div className="md:text-xs" style={{ fontSize: '13px' }}>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>idade:</span> 
                <span style={{ color: '#111827', fontWeight: 'normal' }}> {age} anos</span>
              </div>
              
              {height && (
                <div className="md:text-xs" style={{ fontSize: '13px' }}>
                  <span style={{ color: '#111827', fontWeight: 'bold' }}>altura:</span> 
                  <span style={{ color: '#111827', fontWeight: 'normal' }}> {height}</span>
                </div>
              )}
              
              <div className="md:text-xs" style={{ fontSize: '13px' }}>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>cidade:</span> 
                <span style={{ color: '#111827', fontWeight: 'normal' }}> {location}</span>
              </div>
            </div>

            {/* Local de atendimento */}
            <div className="bg-white rounded-lg p-2 md:p-1.5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-1 mb-1 md:mb-0.5">
                <MapPin className="w-4 h-4 md:w-3 md:h-3 text-black" />
                <span className="text-sm md:text-xs font-bold text-black">atendimento</span>
              </div>
              <div className="space-y-1 md:space-y-0.5 text-sm md:text-xs">
                {hasOwnLocation && (
                  <div className="md:text-xs" style={{ fontSize: '13px', color: '#111827', fontWeight: 'normal' }}>✓ local próprio</div>
                )}
                {acceptsClientLocation && (
                  <div className="md:text-xs" style={{ fontSize: '13px', color: '#111827', fontWeight: 'normal' }}>✓ vou até você</div>
                )}
                {acceptsMotel && (
                  <div className="md:text-xs" style={{ fontSize: '13px', color: '#111827', fontWeight: 'normal' }}>✓ motel</div>
                )}
                {!hasOwnLocation && !acceptsClientLocation && !acceptsMotel && (
                  <div className="md:text-xs" style={{ fontSize: '13px', color: '#111827', fontWeight: 'normal' }}>a combinar</div>
                )}
              </div>
            </div>

            {/* Cidades atendidas */}
            {citiesServed && citiesServed.length > 0 && (
              <div className="bg-white rounded-lg p-2 md:p-1.5 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-1 md:mb-0.5">
                  <MapIcon className="w-4 h-4 md:w-3 md:h-3 text-black" />
                  <span className="text-sm md:text-xs font-bold text-black">atende</span>
                </div>
                <div className="space-y-1 md:space-y-0.5 text-sm md:text-xs">
                  {citiesServed.slice(0, 3).map((city, index) => (
                    <div key={index} className="md:text-xs" style={{ fontSize: '13px', color: '#111827', fontWeight: 'normal' }}>
                      • {city}
                    </div>
                  ))}
                  {citiesServed.length > 3 && (
                    <div className="md:text-xs" style={{ fontSize: '13px', color: '#111827', fontWeight: 'normal' }}>
                      +{citiesServed.length - 3} cidades
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita - Sobre/Descrição */}
          <div className="space-y-1.5">
            {/* Sobre - Ocupando parte da coluna direita */}
            <div className="bg-white rounded-lg p-2 md:p-1.5 overflow-hidden border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-1 mb-1">
                <MessageSquare className="w-4 h-4 md:w-3 md:h-3 flex-shrink-0 text-black" />
                <span className="break-words text-sm md:text-xs font-bold text-black">sobre mim</span>
              </div>
              <p 
                style={{ color: '#111827', fontWeight: 'normal', fontSize: '13px', fontStyle: 'italic' }} 
                className="md:text-xs leading-tight break-words word-wrap overflow-hidden hyphens-auto line-clamp-4"
                lang="pt-BR"
              >
                {description}
              </p>
            </div>

            {/* Especialidades abaixo do "Sobre mim" */}
            {tags && tags.length > 0 && (
              <div className="bg-white rounded-lg p-2 md:p-1.5 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-4 h-4 md:w-3 md:h-3 text-black" />
                  <span className="text-sm md:text-xs font-bold text-black">especialidades</span>
                </div>
                <div className="flex flex-wrap gap-1 md:gap-0.5">
                  {tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-white px-2 py-1 md:px-1.5 md:py-0.5 rounded text-sm md:text-xs border border-gray-300"
                      style={{ color: '#111827', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 4 && (
                    <span
                      className="bg-white px-2 py-1 md:px-1.5 md:py-0.5 rounded text-sm md:text-xs border border-gray-300"
                      style={{ color: '#111827', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      +{tags.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botões de ação - layout simétrico - sempre no final */}
        <div className="mt-auto pt-2 md:pt-1.5">
          <div className="grid grid-cols-2 gap-2 md:gap-1.5 mb-2 md:mb-1.5 border-t border-pink-300 md:border-gray-300 pt-2 md:pt-1.5">
          <button 
              className="flex items-center justify-center space-x-1 bg-white border border-gray-300 hover:border-gray-400 py-2 md:py-1.5 rounded-lg text-sm md:text-xs font-medium transition-all duration-300 hover:bg-gray-50 shadow-sm"
              style={{ color: '#111827' }}
            onClick={(e) => {
              e.stopPropagation();
              }}
            >
              <Phone className="w-3 h-3 md:w-2.5 md:h-2.5" />
              <span className="truncate text-sm md:text-xs">{phone || 'sem telefone'}</span>
            </button>

            {phone && (
            <button 
                className="flex items-center justify-center space-x-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-2 md:py-1.5 rounded-lg text-sm md:text-xs font-medium transition-all duration-300 shadow-sm"
                style={{ color: 'white' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const formattedPhone = formatPhoneForWhatsApp(phone);
                  const whatsappUrl = `https://wa.me/${formattedPhone}?text=Olá ${name}, vi seu perfil no Faixa Rosa e gostaria de conversar.`;
                  window.open(whatsappUrl, '_blank');
                }}
            >
              <MessageCircle className="w-3 h-3 md:w-2.5 md:h-2.5" />
              <span className="text-sm md:text-xs">WhatsApp</span>
            </button>
          )}
          </div>

          {/* Botão Copiar Link - Novo botão para stories */}
          <div className="mb-2 md:mb-1.5">
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 md:py-1.5 rounded-lg text-sm md:text-xs font-medium transition-all duration-300 shadow-sm"
              onClick={copyProfileLink}
              title="Copie o link do seu perfil para compartilhar nos stories do Instagram ou WhatsApp"
            >
              <Copy className="w-3 h-3 md:w-2.5 md:h-2.5" />
              <span className="text-sm md:text-xs">copiar link para stories</span>
            </button>
          </div>

          {/* Botão Ver Perfil Completo - centralizado */}
          <div>
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-velvet-pink-600 to-velvet-pink-500 hover:from-velvet-pink-700 hover:to-velvet-pink-600 text-white py-3 md:py-2 rounded-lg text-sm md:text-xs font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
            >
              <Eye className="w-4 h-4 md:w-3 md:h-3" />
              <span className="text-sm md:text-xs">ver perfil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionCard;
