import React, { useState, useEffect, useRef } from 'react';
import { Play, Crown, Zap, Plus, Diamond, ChevronLeft, ChevronRight } from 'lucide-react';
import StoriesPayModal from './StoriesPayModal';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';
import { storiesService } from '../services/storiesService';
import { useLocation } from '../contexts/LocationContext';

interface Story {
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

interface StoriesSectionProps {
  stories?: Story[];
  hasCompanions?: boolean;
}

interface StoryPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  highlight: boolean;
  icon: React.ReactNode;
  color: string;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ stories = [], hasCompanions = true }) => {
  const { selectedCity, detectedCity } = useLocation();
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approvedStories, setApprovedStories] = useState<Story[]>([]);
  const [showInstructiveMessage, setShowInstructiveMessage] = useState(false);
  const [showFiltersInstruction, setShowFiltersInstruction] = useState(false);
  const [isCompanionLoggedIn, setIsCompanionLoggedIn] = useState(false);
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

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Verificar se o usuário logado é acompanhante
  useEffect(() => {
    const checkCompanionLogin = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verificar se é acompanhante e está logado
          setIsCompanionLoggedIn(parsedUser.isLoggedIn && parsedUser.type === 'companion');
        } catch (error) {
          console.error('Erro ao verificar usuário:', error);
          setIsCompanionLoggedIn(false);
        }
      } else {
        setIsCompanionLoggedIn(false);
      }
    };

    checkCompanionLogin();

    // Verificar novamente quando houver mudanças no localStorage
    window.addEventListener('storage', checkCompanionLogin);
    return () => window.removeEventListener('storage', checkCompanionLogin);
  }, []);

  // Efeito para iniciar a reprodução dos vídeos
  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.play().catch(err => console.warn('Erro ao reproduzir vídeo:', err));
      }
    });
  }, [approvedStories]); // Dependência em approvedStories para garantir que rode quando os stories forem carregados

  // Mostrar mensagem instructiva após verificação de idade
  useEffect(() => {
    console.log('🎯 StoriesSection - Iniciando verificação de instruções');
    
    // Função para mostrar a primeira instrução
    const showFirstInstruction = () => {
      console.log('🎯 StoriesSection - Mostrando primeira instrução');
      setShowInstructiveMessage(true);
      document.body.style.overflow = 'hidden';
      
      // Timer para esconder após 10 segundos
      const hideTimer = setTimeout(() => {
        setShowInstructiveMessage(false);
        document.body.style.overflow = 'auto';
      }, 10000);
      
      return hideTimer;
    };
    
    // Listener para evento de confirmação de localização (preferencial)
    const handleLocationConfirmed = () => {
      console.log('🎯 StoriesSection - Localização confirmada, mostrando instrução imediatamente');
      showFirstInstruction();
    };

    // Listener para evento de verificação de idade (fallback)
    const handleAgeVerified = () => {
      console.log('🎯 StoriesSection - Idade verificada, mostrando instrução imediatamente');
      showFirstInstruction();
    };
    
    // Adicionar listeners para ambos os eventos
    window.addEventListener('locationConfirmed', handleLocationConfirmed);
    window.addEventListener('ageVerified', handleAgeVerified);
    
    return () => {
      window.removeEventListener('locationConfirmed', handleLocationConfirmed);
      window.removeEventListener('ageVerified', handleAgeVerified);
      document.body.style.overflow = 'auto';
    };
  }, []); // Executa apenas uma vez ao montar o componente

  // Carregar stories aprovados do banco
  useEffect(() => {
    const loadApprovedStories = async () => {
      try {
        console.log('🔄 StoriesSection - Carregando stories aprovados...');
        console.log('🔄 StoriesSection - Estados atuais:', {
          selectedCity,
          detectedCity,
          selectedCityName: selectedCity?.name,
          selectedCityFullName: selectedCity?.fullName
        });
        
        // Usar a cidade detectada ou selecionada para filtrar stories
        // PRIORIZAR cidade selecionada manualmente sobre detectada
        const cityToFilter = selectedCity?.name || detectedCity;
        console.log('🔄 StoriesSection - Cidade para filtro:', cityToFilter);
        console.log('🔄 StoriesSection - Lógica de prioridade:', {
          selectedCityName: selectedCity?.name,
          detectedCity: detectedCity,
          cidadeEscolhida: cityToFilter
        });
        
        const approved = await storiesService.getApprovedStories(cityToFilter);
        console.log('✅ StoriesSection - Stories aprovados carregados:', approved);
        setApprovedStories(approved);
      } catch (error) {
        console.error('❌ StoriesSection - Erro ao carregar stories aprovados:', error);
      }
    };

    loadApprovedStories();
  }, [selectedCity, detectedCity]); // Recarregar quando a cidade mudar

  // Prioridade: stories aprovados do banco > stories passados por props
  const displayStoriesRaw = approvedStories.length > 0 ? approvedStories : stories;
  
  // Como o filtro já foi aplicado no backend (storiesService.getApprovedStories), 
  // usar todos os stories retornados
  const displayStories = displayStoriesRaw;

  // Configurações específicas de cada plano
  const planConfigs = {
    premium: {
      gradient: 'from-purple-500 via-pink-500 to-velvet-pink-500',
      duration: '48 horas',
      features: ['Posição no topo', 'Ícone coroa', 'Story por 48 horas', 'Suporte VIP', 'Efeitos especiais'],
      icon: <Crown className="w-3 h-3" />,
      iconBg: 'from-purple-500 to-pink-500'
    },
    destaque: {
      gradient: 'from-yellow-500 via-orange-400 to-yellow-500',
      duration: '48 horas',
      features: ['Posição destacada', 'Borda dourada', 'Story por 48h', 'Suporte prioritário'],
      icon: <Zap className="w-3 h-3" />,
      iconBg: 'from-yellow-500 to-orange-500'
    },
    basic: {
      gradient: 'from-blue-400 via-blue-500 to-blue-400',
      duration: '24 horas',
      features: ['Visibilidade padrão', 'Story por 24h', 'Suporte básico'],
      icon: <Diamond className="w-3 h-3" />,
      iconBg: 'from-blue-500 to-blue-600'
    }
  };

  const handleStoryClick = (story: Story) => {
    console.log('📱 Story clicado:', story);
    console.log('🔢 Total de stories disponíveis:', displayStories.length);
    
    // Encontrar o índice desta acompanhante na lista
    const companionIndex = displayStories.findIndex(s => s.id === story.id);
    console.log('👤 Índice da acompanhante clicada:', companionIndex);
    
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
    } else {
      console.log('❌ Nenhum story encontrado para esta acompanhante');
    }
  };

  const handleNavigateToCompanion = (newCompanionIndex: number) => {
    console.log('🔄 Navegando para acompanhante índice:', newCompanionIndex);
    
    if (newCompanionIndex >= 0 && newCompanionIndex < displayStories.length) {
      const newStory = displayStories[newCompanionIndex];
      
      setViewerState({
        isOpen: true,
        stories: newStory.stories || [],
        companionName: newStory.companion_name,
        companionAvatar: newStory.companion_image,
        planType: newStory.plan_type,
        initialIndex: 0,
        currentCompanionIndex: newCompanionIndex
      });
    }
  };

  const handleCompanionChange = (companionIndex: number, storyIndex: number) => {
    console.log('🔄 Mudando para acompanhante:', companionIndex, 'story:', storyIndex);
    
    if (companionIndex >= 0 && companionIndex < displayStories.length) {
      const newCompanion = displayStories[companionIndex];
      
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

  // Sempre mostrar a seção para permitir criação de stories
  // if (displayStories.length === 0) {
  //   return null;
  // }

  const handleSelectPlan = (plan: StoryPlan) => {
    console.log('Plano selecionado:', plan);
    alert(`Plano ${plan.name} selecionado! Redirecionando para pagamento...`);
  };

  return (
    <>
      {/* Seção de Stories */}
      <div className="py-0 sm:py-3 pt-2 sm:pt-3 pb-0 -mx-4 md:-mx-8">
        <div className="w-full max-w-none px-0">
          <div className="flex items-center justify-center sm:justify-between mb-1 sm:mb-3">
            <div className="flex items-center space-x-2">
            </div>
          </div>

          
          {/* Overlay escuro de fundo quando a instrução aparecer - bloqueia interação */}
          {showInstructiveMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] pointer-events-auto"></div>
          )}

          {/* Overlay escuro de fundo para segunda instrução */}
          {showFiltersInstruction && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-[9998] pointer-events-auto"
              style={{ touchAction: 'none' }}
              onTouchMove={(e) => e.preventDefault()}
              onScroll={(e) => e.preventDefault()}
            ></div>
          )}

          {/* Caixinha de instrução rosa estilo iPhone - centralizada no mobile */}
          {showInstructiveMessage && (
            <div className="absolute top-24 left-28 md:left-60 md:top-24 z-[9999] animate-fade-in pointer-events-auto">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 rounded-2xl shadow-xl max-w-64 border border-pink-400" style={{ }}>
                <div className="mb-3">
                  <p className="text-base md:text-sm font-medium leading-relaxed text-left">
                    Assista os stories e veja as mulheres disponíveis da sua cidade
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowInstructiveMessage(false);
                      // Sempre mostrar a segunda instrução
                      setTimeout(() => {
                        setShowFiltersInstruction(true);
                        // Travar scroll do body
                        document.body.style.overflow = 'hidden';
                        document.body.style.position = 'fixed';
                        document.body.style.width = '100%';
                        // Disparar evento para destacar o botão Faixa Rosa Pro
                        window.dispatchEvent(new CustomEvent('highlightFaixaRosaPro', { detail: { highlight: true } }));
                        
                        // Posicionar tooltip dinamicamente baseado no botão Faixa Rosa Pro
                        setTimeout(() => {
                          const faixaRosaProButton = document.querySelector('[data-filter="faixa-rosa-pro"]') as HTMLElement;
                          const tooltip = document.getElementById('filters-instruction-tooltip');
                          
                          if (faixaRosaProButton && tooltip) {
                            const buttonRect = faixaRosaProButton.getBoundingClientRect();
                            const tooltipHeight = 120; // Altura estimada do tooltip
                            const margin = 5; // Margem pequena para ficar próximo
                            
                            // Posicionar acima do botão
                            tooltip.style.left = `${Math.max(20, buttonRect.left - 50)}px`;
                            tooltip.style.bottom = `${window.innerHeight - buttonRect.top + margin}px`;
                            tooltip.style.top = 'auto';
                            
                            console.log('Tooltip posicionado:', {
                              buttonRect,
                              tooltipLeft: tooltip.style.left,
                              tooltipBottom: tooltip.style.bottom
                            });
                          }
                        }, 100);
                      }, 500); // Delay para suavizar transição
                    }}
                    className="text-white hover:text-pink-200 transition-colors px-3 py-1 rounded-lg bg-white/20"
                  >
                    <span className="text-sm font-bold">OK</span>
                  </button>
                </div>
                {/* Setinha apontando para o botão postar */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                  <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-pink-500"></div>
                </div>
              </div>
            </div>
          )}

          {/* Segunda instrução sobre filtros - acima do botão Faixa Rosa Pro */}
          {showFiltersInstruction && (
            <div 
              id="filters-instruction-tooltip"
              className="fixed z-[9999] animate-fade-in pointer-events-auto"
              style={{
                left: '20px',
                bottom: '400px'
              }}
            >
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 rounded-2xl shadow-xl max-w-64 border border-pink-400" style={{ }}>
                <div className="mb-3">
                  <p className="text-base md:text-sm font-medium leading-relaxed text-left">
                    Aqui você encontra as modelos de médio e alto padrão da sua cidade
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dont-show-again"
                      onChange={(e) => {
                        if (e.target.checked) {
                          localStorage.setItem('filtersInstructionSeen', 'true');
                          setShowFiltersInstruction(false);
                          // Destravar scroll do body
                          document.body.style.overflow = 'auto';
                          document.body.style.position = '';
                          document.body.style.width = '';
                          // Remover destaque do botão Faixa Rosa Pro
                          window.dispatchEvent(new CustomEvent('highlightFaixaRosaPro', { detail: { highlight: false } }));
                        }
                      }}
                      className="w-4 h-4 text-pink-600 bg-white border-pink-300 rounded focus:ring-pink-500"
                    />
                    <label 
                      htmlFor="dont-show-again" 
                      className="text-white text-xs opacity-90 cursor-pointer"
                    >
                      Não mostrar novamente
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      setShowFiltersInstruction(false);
                      // Destravar scroll do body
                      document.body.style.overflow = 'auto';
                      document.body.style.position = '';
                      document.body.style.width = '';
                      // Remover destaque do botão Faixa Rosa Pro
                      window.dispatchEvent(new CustomEvent('highlightFaixaRosaPro', { detail: { highlight: false } }));
                    }}
                    className="text-white hover:text-pink-200 transition-colors px-3 py-1 rounded-lg bg-white/20 text-sm font-bold"
                  >
                    OK
                  </button>
                </div>
                {/* Setinha apontando para baixo (para os filtros) */}
                <div className="absolute bottom-0 left-1/2 transform translate-y-2 -translate-x-1/2">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-pink-500"></div>
                </div>
              </div>
            </div>
          )}

          <div className="stories-scroll relative">
            <div className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-1 no-scrollbar pl-1 sm:pl-0">
              {/* Botão Adicionar - apenas para acompanhantes logadas */}
              {isCompanionLoggedIn && (
                <div className="flex flex-col items-center space-y-0.5 min-w-[56px] sm:min-w-[68px]">
                  <div
                    className="w-[56px] h-[56px] sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-pink-400 transition-colors"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-[56px] sm:max-w-[68px] text-center">Adicionar</span>
                </div>
              )}

              {/* Stories existentes */}
              {displayStories.length > 0 && displayStories.map((story) => {
                const firstVideo = story.stories?.find(s => s.type === 'video');

                return (
                  <div key={story.id} className="flex flex-col items-center space-y-0.5 min-w-[56px] sm:min-w-[68px] cursor-pointer"
                    onClick={() => handleStoryClick(story)}
                  >
                    <div className="w-[56px] h-[56px] sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-500">
                      <div className="w-full h-full rounded-full bg-white p-[2px]">
                        {firstVideo ? (
                          <video
                            ref={el => videoRefs.current[story.id] = el}
                            src={firstVideo.url}
                            className="w-full h-full rounded-full object-cover"
                            muted
                            playsInline
                            loop
                            autoPlay
                          />
                        ) : (
                          <img
                            src={story.preview_image || story.companion_image}
                            alt={story.companion_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-[56px] sm:max-w-[68px] text-center">{story.companion_name.split(' ')[0]}</span>
                  </div>
                );
              })}

              {/* Quando não há stories */}
              {displayStories.length === 0 && (
                <div className="flex items-center justify-center text-center py-2 px-3 min-w-[180px]">
                  <div className="text-center">
                    <span className="text-sm font-medium text-velvet-pink-500 block">Seja a primeira!</span>
                    <span className="text-xs text-velvet-pink-400">Crie seu story agora</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de pagamento para stories */}
      <StoriesPayModal 
        isOpen={isStoriesModalOpen} 
        onClose={() => setIsStoriesModalOpen(false)}
      />

      {/* Modal para criar story */}
      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        companionId={`guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
      />

      {/* Visualizador de stories */}
      <StoryViewer
        isOpen={viewerState.isOpen}
        onClose={closeViewer}
        stories={viewerState.stories}
        companionName={viewerState.companionName}
        companionAvatar={viewerState.companionAvatar}
        companionId={displayStories[viewerState.currentCompanionIndex]?.companion_id}
        planType={viewerState.planType}
        initialStoryIndex={viewerState.initialIndex}
        allCompanions={displayStories.map(story => ({
          id: story.id,
          companion_name: story.companion_name,
          companion_image: story.companion_image,
          plan_type: story.plan_type,
          stories: story.stories || []
        }))}
        currentCompanionIndex={viewerState.currentCompanionIndex}
        onCompanionChange={handleCompanionChange}
      />
    </>
  );
};

export default StoriesSection; 
