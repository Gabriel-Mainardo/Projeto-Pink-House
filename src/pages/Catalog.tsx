import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, MapPin, Users, Star } from 'lucide-react';
import Footer from '../components/Footer';
import CompanionCard from '../components/CompanionCard';
import AdCard from '../components/AdCard';
import { acompanhantesService } from '../services/acompanhantesService';
import { especialidadesService, type Especialidade } from '../lib/supabase';

// Tipo local que estende o service com campos de boost
type Acompanhante = Awaited<ReturnType<typeof acompanhantesService.getAll>>[number];
import { useLocation } from '../contexts/LocationContext';

const Catalog = () => {
  console.log('DEBUG: Catalog component renderizado');
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [filteredAcompanhantes, setFilteredAcompanhantes] = useState<Acompanhante[]>([]);
  const [shuffledAcompanhantes, setShuffledAcompanhantes] = useState<Acompanhante[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Acompanhante[]>([]);
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [displayedItems, setDisplayedItems] = useState(15);
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 40,
    services: [] as string[],
    location: '',
    rating: 0,
    featured: false,
    priceMax: 0 // 0 = sem filtro, outros valores = filtro ativo
  });

  const [sortBy, setSortBy] = useState('rating'); // rating, age, name
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Usar contexto de localização
  const { selectedCity, detectedCity } = useLocation();

  // Obter nome da cidade para exibir
  const getCityForDisplay = () => {
    if (detectedCity) {
      return detectedCity.split(' - ')[0]; // Pega só o nome da cidade, sem o estado
    }
    return selectedCity.name;
  };

  // Dados dos anúncios
  const adsData = [
    {
      id: 'ad-1',
      title: 'Título do Clube Premium',
      description: 'Descrição do Clube Premium',
      ctaText: 'Saiba Mais',
      ctaUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'ad-2', 
      title: 'Título dos Produtos de Bem-Estar',
      description: 'Descrição dos Produtos de Bem-Estar',
      ctaText: 'Saiba Mais',
      ctaUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'ad-3',
      title: 'Título do Elite Dating',
      description: 'Descrição do Elite Dating',
      ctaText: 'Saiba Mais',
      ctaUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80'
    }
  ];

  // Função para embaralhar array
  const shuffleArray = (array: Acompanhante[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const sortAcompanhantes = (items: Acompanhante[]) => {
    const sorted = [...items];

    sorted.sort((left, right) => {
      if (left.hasBoost !== right.hasBoost) {
        return left.hasBoost ? -1 : 1;
      }

      if (left.hasBoost && right.hasBoost) {
        const amountDiff = Number(right.boostAmountPaid || 0) - Number(left.boostAmountPaid || 0);
        if (amountDiff !== 0) {
          return amountDiff;
        }

        const startedAtDiff =
          new Date(right.boostStartedAt || 0).getTime() - new Date(left.boostStartedAt || 0).getTime();
        if (startedAtDiff !== 0) {
          return startedAtDiff;
        }

        return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
      }

      if (sortBy === 'age') {
        return left.age - right.age;
      }

      if (sortBy === 'name') {
        return left.name.localeCompare(right.name, 'pt-BR');
      }

      return Number(right.rating || 0) - Number(left.rating || 0);
    });

    return sorted;
  };

  // Lista de serviços disponíveis
  const availableServices = [
    'Acompanhante Social',
    'Eventos Corporativos', 
    'Jantar Executivo',
    'Viagens',
    'Massagem Relaxante',
    'Eventos Sociais',
    'Companhia Social',
    'Jantar Romântico',
    'Eventos Especiais',
    'Acompanhante Executiva',
    'Viagens Executivas'
  ];

  const locations = ['Recife - PE', 'Olinda - PE', 'Jaboatão - PE', 'Caruaru - PE', 'Petrolina - PE'];

  // Ler parâmetro de busca da URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📱 Catalog - Iniciando carregamento de dados...');
        
        const [acompanhantesData, especialidadesData] = await Promise.all([
          acompanhantesService.getAll(),
          especialidadesService.getAll()
        ]);
        
        console.log('📱 Catalog - Dados carregados:', {
          totalAcompanhantes: acompanhantesData.length,
          totalEspecialidades: especialidadesData.length
        });

        // O service já retorna ordenado por boost (boosted primeiro, depois por data)
        // Não re-ordenar para preservar a prioridade de boost
        const sortedAcompanhantes = acompanhantesData;

        console.log('📱 Catalog - Primeiros 5 perfis (boost primeiro):', 
          sortedAcompanhantes.slice(0, 5).map(a => ({
            id: a.id,
            name: a.name,
            hasBoost: a.hasBoost,
            created_at: a.created_at
          }))
        );
        
        setAcompanhantes(sortedAcompanhantes);
        setFilteredAcompanhantes(sortedAcompanhantes);
        setShuffledAcompanhantes(sortedAcompanhantes); // Não embaralhar inicialmente
        setEspecialidades(especialidadesData);
      } catch (err) {
        console.error('❌ Catalog - Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Tente novamente.');
        setAcompanhantes([]);
        setFilteredAcompanhantes([]);
        setShuffledAcompanhantes([]);
        setEspecialidades([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sistema de embaralhamento automático a cada 10 minutos
  // IMPORTANTE: Perfis com boost ativo SEMPRE ficam no topo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (sortBy === 'random' && shuffledAcompanhantes.length > 0) {
      console.log('📱 Catalog - Iniciando sistema de embaralhamento...');
      
      // Primeira execução após 10 minutos
      interval = setInterval(() => {
        console.log('📱 Catalog - Embaralhando lista (preservando boost no topo)...');
        
        setShuffledAcompanhantes(prevShuffled => {
          // Separar perfis com boost dos sem boost
          const boostedProfiles = prevShuffled.filter(a => a.hasBoost);
          const nonBoostedProfiles = prevShuffled.filter(a => !a.hasBoost);
          
          // Só embaralhar os perfis SEM boost
          const shuffledNonBoosted = shuffleArray(nonBoostedProfiles);
          
          // Boost sempre no topo, depois os embaralhados
          const newOrder = [...boostedProfiles, ...shuffledNonBoosted];
          
          console.log('📱 Catalog - Nova ordem dos primeiros 5:', 
            newOrder.slice(0, 5).map(a => ({
              id: a.id,
              name: a.name,
              hasBoost: a.hasBoost,
              created_at: a.created_at
            }))
          );
          
          return newOrder;
        });
      }, 600000); // 10 minutos
    }

    return () => {
      if (interval) {
        console.log('📱 Catalog - Limpando interval de embaralhamento');
        clearInterval(interval);
      }
    };
  }, [shuffledAcompanhantes.length, sortBy]);

  // Atualizar lista embaralhada quando filtros mudarem
  // IMPORTANTE: Preservar boost no topo
  useEffect(() => {
    setShuffledAcompanhantes(filteredAcompanhantes);
    setDisplayedItems(15);
  }, [filteredAcompanhantes]);

  // Sistema de rotação automática dos cards (2 primeiros)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (filteredAcompanhantes.length > 2) {
      console.log('Iniciando rotação automática no catálogo - 2 primeiros cards');
      
      interval = setInterval(() => {
        console.log('Rotacionando cards no catálogo...');
        
        // Gerar índices aleatórios diferentes para as 2 primeiras posições
        const getRandomIndex = () => Math.floor(Math.random() * filteredAcompanhantes.length);
        
        let newFirstIndex = getRandomIndex();
        let newSecondIndex = getRandomIndex();
        
        // Garantir que os dois índices sejam diferentes
        while (newSecondIndex === newFirstIndex) {
          newSecondIndex = getRandomIndex();
        }
        
        // setRotationIndex(newFirstIndex);
        // setSecondRotationIndex(newSecondIndex);
        
        console.log(`Novos índices de rotação no catálogo: ${newFirstIndex} e ${newSecondIndex}`);
      }, 60000); // 1 minuto para cada rotação
    }

    return () => {
      if (interval) {
        console.log('Limpando interval de rotação do catálogo');
        clearInterval(interval);
      }
    };
  }, [filteredAcompanhantes.length]);

  // Resetar rotação quando filtrar
  useEffect(() => {
    // setRotationIndex(0);
    // setSecondRotationIndex(1);
  }, [searchTerm, filters]);

  // Scroll infinito - detectar quando chegar perto do final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedItems < shuffledAcompanhantes.length) {
          setDisplayedItems(prev => Math.min(prev + 3, shuffledAcompanhantes.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [displayedItems, shuffledAcompanhantes.length]);

  // Resetar displayedItems ao filtrar
  useEffect(() => {
    setDisplayedItems(15);
  }, [searchTerm, filters]);

  // Calcular items para mostrar da lista embaralhada
  const getCurrentItems = () => {
    return shuffledAcompanhantes.slice(0, displayedItems);
  };

  // Toggle para serviços nos filtros
  const toggleService = (service: string) => {
    setFilters(prev => {
      if (prev.services.includes(service)) {
        return {
          ...prev,
          services: prev.services.filter(s => s !== service)
        };
      } else {
        return {
          ...prev,
          services: [...prev.services, service]
        };
      }
    });
  };

  // Toggle para filtro de preço
  const togglePriceFilter = (maxPrice: number) => {
    setFilters(prev => ({
      ...prev,
      priceMax: prev.priceMax === maxPrice ? 0 : maxPrice
    }));
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilters({
      ageMin: 18,
      ageMax: 40,
      services: [],
      location: '',
      rating: 0,
      featured: false,
      priceMax: 0
    });
    setSearchTerm('');
  };

  // Busca no banco de dados com debounce
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      setIsSearchingDB(false);
      return;
    }

    setIsSearchingDB(true);
    const timer = setTimeout(async () => {
      try {
        console.log('🔍 Catalog - Buscando no banco:', searchTerm);
        const results = await acompanhantesService.search(searchTerm);
        console.log(`🔍 Catalog - ${results.length} resultados encontrados no banco`);
        
        setSearchResults(results as Acompanhante[]);
        setIsSearchingDB(false);
      } catch (err) {
        console.error('❌ Catalog - Erro na busca:', err);
        setIsSearchingDB(false);
        // Fallback: filtrar client-side
        const filtered = acompanhantes.filter(a =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(filtered);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, acompanhantes]);

  // Aplicar filtros sobre a lista base atual
  useEffect(() => {
    const baseAcompanhantes = searchTerm && searchTerm.length >= 2 ? searchResults : acompanhantes;
    let filtered = [...baseAcompanhantes];

    console.log('Catalog - Aplicando filtros...');
    console.log('Catalog - Cidade selecionada:', selectedCity);

    const cityToFilter = detectedCity ? detectedCity.split(' - ')[0] : selectedCity?.name;

    if (cityToFilter) {
      const cityName = cityToFilter.toLowerCase();
      filtered = filtered.filter((acompanhante) => {
        const acompanhanteCity = acompanhante.location.toLowerCase();
        const matchesLocation = acompanhanteCity.includes(cityName) || cityName.includes(acompanhanteCity);
        const matchesCitiesServed =
          acompanhante.cities_served?.some((city) => {
            const normalizedCity = city.toLowerCase();
            return normalizedCity.includes(cityName) || cityName.includes(normalizedCity);
          }) || false;

        return matchesLocation || matchesCitiesServed;
      });
    }

    if (filters.location) {
      const selectedLocation = filters.location.toLowerCase();
      filtered = filtered.filter((acompanhante) => {
        const acompanhanteCity = acompanhante.location.toLowerCase();
        const matchesLocation =
          acompanhanteCity.includes(selectedLocation) || selectedLocation.includes(acompanhanteCity);
        const matchesCitiesServed =
          acompanhante.cities_served?.some((city) => {
            const normalizedCity = city.toLowerCase();
            return normalizedCity.includes(selectedLocation) || selectedLocation.includes(normalizedCity);
          }) || false;

        return matchesLocation || matchesCitiesServed;
      });
    }

    filtered = filtered.filter(
      (acompanhante) => acompanhante.age >= filters.ageMin && acompanhante.age <= filters.ageMax
    );

    if (filters.priceMax > 0) {
      filtered = filtered.filter((acompanhante) => {
        if (!acompanhante.pricePerHour) return false;
        const price = parseInt(acompanhante.pricePerHour.replace(/\D/g, ''), 10);

        if (filters.priceMax === 999) {
          return price > 200;
        }

        return price <= filters.priceMax;
      });
    }

    if (filters.services.length > 0) {
      filtered = filtered.filter((acompanhante) =>
        filters.services.some((service) => acompanhante.tags.includes(service))
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((acompanhante) => Number(acompanhante.rating || 0) >= filters.rating);
    }

    if (filters.featured) {
      filtered = filtered.filter((acompanhante) => acompanhante.is_featured);
    }

    const sorted = sortAcompanhantes(filtered);

    console.log(`Catalog - Filtros aplicados: ${sorted.length} acompanhantes restantes`);
    setFilteredAcompanhantes(sorted);
  }, [acompanhantes, searchResults, searchTerm, filters, selectedCity, detectedCity, sortBy]);


  // Função para intercalar cards com ads - ad em primeiro lugar igual página inicial
  const getItemsWithAds = () => {
    const companions = getCurrentItems();
    const itemsWithAds: Array<{ type: 'companion' | 'ad', data: any }> = [];
    
    // Apenas um ad logo no início, antes dos cards
    if (companions.length > 0) {
      itemsWithAds.push({ type: 'ad', data: adsData[0] });
    }
    
    // Adiciona todos os cards das acompanhantes
    companions.forEach((companion) => {
      itemsWithAds.push({ type: 'companion', data: companion });
    });
    
    return itemsWithAds;
  };

  const currentItems = getCurrentItems();
  const itemsWithAds = getItemsWithAds();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      
      {/* Container principal com max-width e espaçamento lateral */}
      <div className="w-full max-w-[1180px] mx-auto px-3 sm:px-8 lg:px-12 xl:px-16 py-8">
        {/* Título da página com cidade */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Catálogo de Acompanhantes
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhantes em <span className="text-velvet-pink-600 font-semibold">{getCityForDisplay()}</span>
          </p>
          {!loading && filteredAcompanhantes.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {filteredAcompanhantes.length} acompanhante{filteredAcompanhantes.length !== 1 ? 's' : ''} encontrada{filteredAcompanhantes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Barra de busca e filtros */}
        <div className="mb-8">
          {/* Filtros e ordenação */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ArrowUpDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={() => togglePriceFilter(100)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                  filters.priceMax === 100
                    ? 'bg-velvet-pink-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Até R$ 100</span>
              </button>

              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:border-velvet-pink-500 focus:outline-none"
              >
                <option value="rating">Melhor Avaliado</option>
                <option value="age">Idade</option>
                <option value="name">Nome</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {currentItems.length} de {shuffledAcompanhantes.length} acompanhantes
            </div>
          </div>

          {/* Painel de filtros */}
          {showFilters && (
            <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Filtros</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Localização */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-velvet-pink-500 focus:outline-none"
                  >
                    <option value="">Todas</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Idade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idade: {filters.ageMin} - {filters.ageMax} anos
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="18"
                      max="40"
                      value={filters.ageMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageMin: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="18"
                      max="40"
                      value={filters.ageMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageMax: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Filtro de Valores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Valores</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => togglePriceFilter(100)}
                      className={`w-full px-3 py-1 rounded-lg text-xs transition-colors ${
                        filters.priceMax === 100
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Até R$ 100
                    </button>
                    <button
                      onClick={() => {
                        console.log('Clicou no Faixa Rosa Pro');
                        togglePriceFilter(999);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg ${
                        filters.priceMax === 999
                          ? 'bg-gradient-to-r from-pink-800 to-pink-900 text-white border-2 border-pink-700'
                          : 'bg-gradient-to-r from-pink-700 to-pink-800 text-white hover:from-pink-800 hover:to-pink-900 transform hover:scale-105'
                      }`}
                    >
                      👑 Faixa Rosa Pro
                    </button>
                    <button
                      onClick={() => togglePriceFilter(150)}
                      className={`w-full px-3 py-1 rounded-lg text-xs transition-colors ${
                        filters.priceMax === 150
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Até R$ 150
                    </button>
                    <button
                      onClick={() => togglePriceFilter(200)}
                      className={`w-full px-3 py-1 rounded-lg text-xs transition-colors ${
                        filters.priceMax === 200
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Até R$ 200
                    </button>
                    <button
                      onClick={() => togglePriceFilter(300)}
                      className={`w-full px-3 py-1 rounded-lg text-xs transition-colors ${
                        filters.priceMax === 300
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Até R$ 300
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, priceMax: 0 }))}
                      className={`w-full px-3 py-1 rounded-lg text-xs transition-colors ${
                        filters.priceMax === 0
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos os valores
                    </button>
                  </div>
                </div>

                {/* Avaliação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação Mínima</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-velvet-pink-500 focus:outline-none"
                  >
                    <option value={0}>Qualquer</option>
                    <option value={4.5}>4.5+</option>
                    <option value={4.0}>4.0+</option>
                    <option value={3.5}>3.5+</option>
                  </select>
                </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Destacados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtros Especiais</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-velvet-pink-600 focus:ring-velvet-pink-500"
                    />
                    <span className="text-sm text-gray-700">Apenas Destacados</span>
                  </label>
              </div>

              {/* Serviços */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serviços</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {especialidades.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.name)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        filters.services.includes(service.name)
                          ? 'bg-velvet-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={resetFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Limpar Todos
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de carregamento */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-pink-600"></div>
            <p className="text-gray-600 mt-2">Carregando...</p>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Erro ao carregar dados. Tente novamente mais tarde.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-velvet-pink-600 text-white px-4 py-2 rounded-lg hover:bg-velvet-pink-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Resultados */}
        {!loading && !error && (
          <>
            {/* Contador de resultados - centralizado */}
            <div className="text-center mb-8">
              <div className="inline-flex flex-col items-center space-y-2">
              </div>
              {(filters.services.length > 0 || filters.location || filters.rating > 0 || filters.featured || filters.priceMax > 0 || searchTerm) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-velvet-pink-600 hover:text-velvet-pink-700 text-sm flex items-center justify-center space-x-1 mx-auto"
                >
                  <X className="w-4 h-4" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>

            {/* Grade de acompanhantes com layout otimizado */}
            {currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-12 justify-items-center px-1 sm:px-0">
                  {itemsWithAds.map((item) => (
                    item.type === 'companion' ? (
                  <CompanionCard
                        key={item.data.id}
                        id={item.data.id}
                        name={item.data.name}
                        location={item.data.location}
                        image={item.data.image}
                        gallery={item.data.gallery}
                        videos={item.data.videos}
                        videoThumbnails={item.data.video_thumbnails}
                        audioUrl={item.data.audio_url}
                        adVideo={item.data.adVideo}
                        rating={item.data.rating}
                        tags={item.data.tags}
                        isFeatured={item.data.is_featured}
                        phone={item.data.phone}
                        age={item.data.age}
                        height={item.data.height}
                        description={item.data.description}
                        pricePerHour={item.data.pricePerHour}
                        hasOwnLocation={item.data.hasOwnLocation}
                        acceptsClientLocation={item.data.acceptsClientLocation}
                        acceptsMotel={item.data.acceptsMotel}
                        citiesServed={item.data.cities_served}
                        isAvailable={item.data.is_available}
                        hasBoost={item.data.hasBoost}
                        boostBadge={item.data.boostBadge}
                        boostColor={item.data.boostColor}
                  />
                    ) : (
                      <AdCard
                        key={item.data.id}
                        title={item.data.title}
                        description={item.data.description}
                        ctaText={item.data.ctaText}
                        ctaUrl={item.data.ctaUrl}
                        imageUrl={item.data.imageUrl}
                      />
                    )
                ))}
              </div>

                {/* Trigger para scroll infinito - centralizado */}
                {displayedItems < shuffledAcompanhantes.length && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-velvet-pink-600"></div>
                    <p className="text-gray-600 ml-3">Carregando mais acompanhantes...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Não encontramos acompanhantes com os filtros selecionados. Tente remover alguns filtros ou alterar sua busca.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-velvet-pink-600 text-white px-6 py-3 rounded-lg hover:bg-velvet-pink-700 transition-colors"
                  >
                    Remover todos os filtros
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Catalog; 
