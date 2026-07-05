import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, MessageCircle, Volume2, VolumeX, Play, Pause, Eye, Heart } from 'lucide-react';
import { storiesService } from '../services/storiesService';

interface Story {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'text';
  url: string;
  created_at: string;
  thumbnail?: string;
  duration?: number;
  storyLinkUrl?: string;
  storyLinkText?: string;
  linkType?: 'whatsapp' | 'custom';
  views?: number;
  likes?: number;
}

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex?: number;
  companionName: string;
  companionAvatar: string;
  companionId?: string;
  planType: 'basic' | 'destaque' | 'premium';
  allCompanions?: Array<{
    id: string;
    companion_name: string;
    companion_image: string;
    plan_type: 'basic' | 'destaque' | 'premium';
    stories: Story[];
  }>;
  currentCompanionIndex?: number;
  onCompanionChange?: (companionIndex: number, storyIndex: number) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  stories,
  initialStoryIndex = 0,
  companionName,
  companionAvatar,
  companionId,
  planType,
  allCompanions,
  currentCompanionIndex,
  onCompanionChange,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNavigationHint, setShowNavigationHint] = useState(true);
  const [currentViews, setCurrentViews] = useState(0);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  
  // Estados para navegação por toque (mobile)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStory = stories[currentIndex];
  const hasContactActions = Boolean(currentStory?.storyLinkUrl) || Boolean(companionId);
  
  // Log para debug dos links
  useEffect(() => {
    if (currentStory) {
      console.log('📱 Story atual:', {
        id: currentStory.id,
        type: currentStory.type,
        storyLinkUrl: currentStory.storyLinkUrl,
        storyLinkText: currentStory.storyLinkText,
        linkType: currentStory.linkType
      });
    }
  }, [currentStory]);

  // Atualizar currentViews e currentLikes quando mudar de story
  useEffect(() => {
    if (currentStory) {
      setCurrentViews(currentStory.views || 0);
      setCurrentLikes(currentStory.likes || 0); // Carregar curtidas do banco
      setHasLiked(false); // Reset do like quando muda de story
    }
  }, [currentStory]);

  // Incrementar views quando alguém visualizar o story (+4 por entrada)
  useEffect(() => {
    if (currentStory && isOpen) {
      const incrementViews = async () => {
        try {
          await storiesService.incrementViews(currentStory.id);
          // Atualizar views localmente em tempo real (+4)
          setCurrentViews(prev => prev + 4);
        } catch (error) {
          console.error('Erro ao incrementar views:', error);
        }
      };
      
      incrementViews();
    }
  }, [currentStory?.id, isOpen]);

  // Duração de 20 segundos para cada story individual
  const STORY_DURATION = 20000;

  // Reset completo quando muda de acompanhante ou story index inicial
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Resetando story viewer - acompanhante:', companionName, 'story:', initialStoryIndex);
      setCurrentIndex(initialStoryIndex);
      setProgress(0);
      setIsPlaying(true);
      setShowNavigationHint(true);
      
      // Limpar timer anterior se existir
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isOpen, companionName, initialStoryIndex]);

  useEffect(() => {
    if (!isOpen) {
      // Limpar tudo quando fecha
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setProgress(0);
      setIsPlaying(true);
      return;
    }

    if (!currentStory) return;

    console.log('⏱️ Iniciando timer para story:', currentIndex, 'tipo:', currentStory.type);

    const isVideo = currentStory.type === 'video';
    const isAudio = currentStory.type === 'audio';
    const isMediaContent = isVideo || isAudio;

    // Limpar timer anterior
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Para conteúdo de mídia, usar eventos do elemento
    if (isMediaContent) {
      const mediaElement = (isVideo ? videoRef.current : audioRef.current) as HTMLMediaElement;
      
      if (mediaElement) {
        const updateProgress = () => {
          if (mediaElement.duration) {
            const percentage = (mediaElement.currentTime / mediaElement.duration) * 100;
            setProgress(percentage);
          }
        };

        const onEnded = () => {
          console.log('🎬 Mídia finalizada, avançando...');
          nextStory();
        };

        mediaElement.addEventListener('timeupdate', updateProgress);
        mediaElement.addEventListener('ended', onEnded);

        return () => {
          mediaElement.removeEventListener('timeupdate', updateProgress);
          mediaElement.removeEventListener('ended', onEnded);
        };
      }
    } else {
      // Para fotos/texto, usar timer próprio com 20 segundos
      if (isPlaying) {
        setProgress(0);
        const startTime = Date.now();
        
        console.log('📷 Iniciando timer de 20s para foto/texto');
        
        timerRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const percentage = (elapsed / STORY_DURATION) * 100;
          
          if (percentage >= 100) {
            console.log('⏰ Timer finalizado, avançando...');
            clearInterval(timerRef.current!);
            timerRef.current = null;
            nextStory();
          } else {
            setProgress(percentage);
          }
        }, 100); // Atualização mais frequente para suavidade
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [currentIndex, isPlaying, isOpen, companionName]);

  // Auto-hide controles
  useEffect(() => {
    if (!showControls) return;

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showControls]);

  // Auto-hide da dica de navegação após 3 segundos
  useEffect(() => {
    if (showNavigationHint) {
      const timer = setTimeout(() => {
        setShowNavigationHint(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showNavigationHint]);

  const nextStory = () => {
    console.log('➡️ nextStory - currentIndex:', currentIndex, 'total stories:', stories.length);
    
    // Limpar timer atual
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Se tem mais stories desta acompanhante, navegar dentro
    if (currentIndex < stories.length - 1) {
      console.log('✅ Avançando para próximo story da mesma acompanhante');
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setShowNavigationHint(false);
    }
    // Se acabaram os stories desta acompanhante, ir para próxima
    else {
      if (allCompanions && currentCompanionIndex !== undefined && onCompanionChange) {
        // Tem próxima acompanhante?
        if (currentCompanionIndex < allCompanions.length - 1) {
          const nextCompanionIndex = currentCompanionIndex + 1;
          const nextCompanion = allCompanions[nextCompanionIndex];
          console.log('🔄 Indo para próxima acompanhante:', nextCompanion.companion_name);
          onCompanionChange(nextCompanionIndex, 0); // Ir para o primeiro story da próxima acompanhante
          return;
        }
      }
      
      // Se não tem próxima acompanhante, fechar
      console.log('✅ Último story - fechando');
      onClose();
    }
  };

  const prevStory = () => {
    console.log('⬅️ prevStory - currentIndex:', currentIndex);
    
    // Limpar timer atual
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Se tem stories anteriores desta acompanhante, navegar dentro
    if (currentIndex > 0) {
      console.log('✅ Voltando para story anterior da mesma acompanhante');
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setShowNavigationHint(false);
    }
    // Se é o primeiro story desta acompanhante, ir para acompanhante anterior
    else {
      if (allCompanions && currentCompanionIndex !== undefined && onCompanionChange) {
        // Tem acompanhante anterior?
        if (currentCompanionIndex > 0) {
          const prevCompanionIndex = currentCompanionIndex - 1;
          const prevCompanion = allCompanions[prevCompanionIndex];
          console.log('🔄 Indo para acompanhante anterior:', prevCompanion.companion_name);
          // Ir para o último story da acompanhante anterior
          const lastStoryIndex = prevCompanion.stories.length - 1;
          onCompanionChange(prevCompanionIndex, lastStoryIndex);
          return;
        }
      }
      
      // Se não tem acompanhante anterior, não faz nada (ou fechar)
      console.log('❌ Já está na primeira acompanhante');
    }
  };

  const togglePlayPause = () => {
    const mediaElement = videoRef.current || audioRef.current;
    
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getPlanBorder = () => {
    switch (planType) {
      case 'premium': return 'border-purple-500';
      case 'destaque': return 'border-yellow-500';
      case 'basic': return 'border-blue-500';
      default: return 'border-gray-300';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours === 1) return '1h';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  // Funções para navegação por toque (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;

    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Verificar se é um swipe horizontal (não vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe para direita = story anterior
        prevStory();
      } else {
        // Swipe para esquerda = próximo story
        nextStory();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Função para navegação por clique (mobile e desktop - tipo Instagram)
  const handleScreenClick = (e: React.MouseEvent) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    // Dividir tela em duas metades
    if (clickX < screenWidth / 2) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory?.storyLinkUrl) return;
    console.log('WhatsApp clicado:', currentStory.storyLinkUrl);
    setShowWarningBanner(true);
  };

  const handleOpenSiteChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!companionId) return;
    onClose();
    navigate(`/mensagens?to=${companionId}`);
  };

  if (!isOpen || !currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Container principal */}
      <div 
        className="relative w-full h-full max-w-lg mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleScreenClick}
      >
        {/* Barra de progresso */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Cabeçalho */}
        <div className="absolute top-2 left-0 right-0 flex items-center justify-between px-4 z-10">
          {/* Info da acompanhante */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${getPlanBorder()}`}>
              <img
                src={companionAvatar || '/placeholder.svg'}
                alt={companionName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-2">
              <div className="text-white font-sans text-[15px] tracking-tight leading-tight">
                {companionName}
                <div className="flex items-center space-x-3 text-white/70 text-[13px] font-normal">
                  <span>{formatTimeAgo(currentStory.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center space-x-4">
            {(currentStory.type === 'video' || currentStory.type === 'audio') && (
              <>
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Story */}
        <div className="w-full h-full flex items-center justify-center">
          {currentStory.type === 'video' && (
            <video
              ref={videoRef}
              src={currentStory.url}
              className="w-full h-full object-cover"
              playsInline
              autoPlay
              muted={isMuted}
              onClick={() => setShowControls(true)}
            />
          )}
          {currentStory.type === 'audio' && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-velvet-pink-500 to-velvet-pink-600">
              <audio
                ref={audioRef}
                src={currentStory.url}
                autoPlay
                muted={isMuted}
              />
              <div className="text-white text-center">
                <Volume2 className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Áudio Story</p>
              </div>
            </div>
          )}
          {(currentStory.type === 'photo' || currentStory.type === 'text') && (
            <img
              src={currentStory.url}
              alt="Story"
              className="w-full h-full object-cover"
              onClick={() => setShowControls(true)}
            />
          )}

          {/* Botão de Link */}
          {hasContactActions && (
            <div className="absolute bottom-20 left-4 right-4 z-30">
              <div className="mx-auto w-full max-w-[360px] rounded-[28px] border border-white/15 bg-black/45 p-3 backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3">
                  {currentStory.storyLinkUrl && (
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1fb357] active:scale-[0.98]"
                      onClick={handleOpenWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>
                  )}
                  {companionId && (
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
                      onClick={handleOpenSiteChat}
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="truncate">Chat do site</span>
                    </button>
                  )}
                </div>
                <p className="mt-2 text-center text-xs text-white/75">
                  Fale com {companionName.split(' ')[0]} pelo canal que preferir
                </p>
              </div>
            </div>
          )}

          {false && currentStory.storyLinkUrl && currentStory.storyLinkText && (
            <div className="absolute bottom-20 left-4 right-4 flex justify-center z-30">
              <button
                className="bg-gradient-to-r from-white via-white via-[#F8BBD9] to-[#9C27B0] hover:from-gray-100 hover:via-gray-100 hover:via-[#F48FB1] hover:to-[#8E24AA] text-white flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ease-in-out transform hover:shadow-lg active:scale-95 whitespace-nowrap w-full max-w-[340px]"
                style={{
                  height: '58px',
                  borderRadius: '50px',
                  padding: '10px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minHeight: '44px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔗 Link clicado:', currentStory.storyLinkUrl);
                  if (currentStory.linkType === 'whatsapp') {
                    setShowWarningBanner(true);
                  } else {
                    window.open(currentStory.storyLinkUrl, '_blank');
                  }
                }}
              >
                {currentStory.linkType === 'whatsapp' ? (
                  <>
                    <div 
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '38px',
                        height: '38px',
                        backgroundColor: '#25D366',
                        borderRadius: '50%'
                      }}
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="white"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
                      </svg>
                    </div>
                    <span 
                      className="font-sans font-semibold text-black leading-none"
                      style={{ fontSize: '20px' }}
                    >
                      Conversar no WhatsApp
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🔗</span>
                    </div>
                    <span className="font-sans font-semibold text-white text-base truncate">{currentStory.storyLinkText}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Contador de visualizações - canto inferior esquerdo */}
        <div className="absolute bottom-6 left-4 z-20">
          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
            <Eye className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-lg">{currentViews}</span>
          </div>
        </div>

        {/* Balão vertical de ícones - estilo TikTok/Instagram */}
        <div className="absolute right-4 bottom-64 z-20">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-4 flex flex-col items-center space-y-4 shadow-lg">
            {/* Ícone Curtir */}
            <button
              className="group"
              onClick={(e) => {
                e.stopPropagation();
                
                if (!hasLiked) {
                  // Update visual imediato
                  setCurrentLikes(prev => prev + 1);
                  setHasLiked(true);
                  console.log('❤️ Story curtido');
                  
                  // Sincronizar com banco em background
                  storiesService.likeStory(currentStory.id).catch(error => {
                    // Reverter em caso de erro
                    setCurrentLikes(prev => prev - 1);
                    setHasLiked(false);
                    console.error('Erro ao curtir story:', error);
                  });
                } else {
                  // Update visual imediato
                  setCurrentLikes(prev => Math.max(prev - 1, 0));
                  setHasLiked(false);
                  console.log('💔 Like removido');
                  
                  // Sincronizar com banco em background
                  storiesService.unlikeStory(currentStory.id).catch(error => {
                    // Reverter em caso de erro
                    setCurrentLikes(prev => prev + 1);
                    setHasLiked(true);
                    console.error('Erro ao descurtir story:', error);
                  });
                }
              }}
            >
              <Heart className={`w-6 h-6 transition-colors ${
                hasLiked 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-white group-hover:text-red-400'
              }`} />
            </button>
            <span className="text-white text-xs font-semibold -mt-2">{currentLikes}</span>

            {/* Ícone Compartilhar */}
            <button
              className="group"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: `Story de ${companionName}`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  console.log('🔗 Link copiado');
                }
              }}
            >
              <svg className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>

            {/* Ícone Silenciar Áudio - só aparece para vídeos/áudios */}
            {(currentStory.type === 'video' || currentStory.type === 'audio') && (
              <button
                className="group"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navegação entre stories - apenas desktop, posicionados fora da zona de interação do like */}
        <div className="hidden md:flex absolute top-16 bottom-36 left-0 right-0 items-center justify-between px-2 pointer-events-none z-20">
          <button
            onClick={(e) => { e.stopPropagation(); prevStory(); }}
            className="text-white hover:text-gray-300 transition-colors pointer-events-auto bg-black/30 hover:bg-black/50 rounded-full p-2 -ml-1"
            style={{ visibility: (currentIndex > 0 || (currentCompanionIndex !== undefined && currentCompanionIndex > 0)) ? 'visible' : 'hidden' }}
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextStory(); }}
            className="text-white hover:text-gray-300 transition-colors pointer-events-auto bg-black/30 hover:bg-black/50 rounded-full p-2 -mr-1"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Dica de navegação */}
        {showNavigationHint && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-center">
            <div>
              <p className="text-lg font-semibold mb-2">Como navegar</p>
              <div className="text-sm opacity-80">
                {/* Mobile */}
                <div className="md:hidden">
                  <p>Toque na direita para avançar</p>
                  <p>Toque na esquerda para voltar</p>
                  <p className="mt-2">Deslize para navegar rapidamente</p>
                </div>
                {/* Desktop */}
                <div className="hidden md:block">
                  <p>Use as setas ou clique nos lados</p>
                  <p>Espaço para pausar/reproduzir</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Banner de Aviso WhatsApp */}
      {showWarningBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div 
            className="bg-gradient-to-br from-pink-200 to-pink-300 p-8 rounded-3xl max-w-md w-full mx-4 text-center shadow-2xl relative"
            style={{ }}
          >
            {/* Conteúdo */}
            <div className="space-y-6">
              {/* Título */}
              <h2 className="text-2xl font-bold text-black">⚠️ Atenção!</h2>
              
              {/* Mensagem */}
              <div className="text-black leading-relaxed font-semibold text-base">
                <p className="mb-2">
                  Sugerimos que <strong className="text-black">não realize pagamentos antecipados</strong> e que faça uma 
                  <strong className="text-black"> chamada de vídeo para verificação mútua</strong>.
                </p>
              </div>

              {/* Imagem redonda acima do botão */}
              <div className="flex justify-center mb-4">
                <img 
                  src="https://lavzkjjnrgooajzganrh.supabase.co/storage/v1/object/public/images//WhatsApp%20Image%202025-07-15%20at%2011.06.57.jpeg"
                  alt="Aviso"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    setShowWarningBanner(false);
                    const message = encodeURIComponent('Vi seus stories no Faixa Rosa, está disponível?');
                    window.open(`https://wa.me/${currentStory.storyLinkUrl}?text=${message}`, '_blank');
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <img 
                    src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752437210/whatsapp-icon-free-png_s4hkk9.webp" 
                    alt="WhatsApp"
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span className="text-sm sm:text-base">Continuar para WhatsApp</span>
                </button>

                <button
                  onClick={() => setShowWarningBanner(false)}
                  className="text-black hover:text-gray-800 transition-colors text-sm font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* Botão X no canto */}
            <button
              onClick={() => setShowWarningBanner(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors z-20"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer; 
