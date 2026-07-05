import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Diamond, ChevronDown, User, LogOut, MapPin, Filter, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { getNeighborhoodsByCity, type Neighborhood } from '../lib/neighborhoods';
import { RegistrationModal } from './RegistrationModal';
import SideMenu from './menu/SideMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isMobileCityDropdownOpen, setIsMobileCityDropdownOpen] = useState(false);
  const [mobileCitySearchTerm, setMobileCitySearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'Mulheres' | 'Homens' | 'Trans'>('Mulheres');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Usar contexto de localização com validação
  const locationContext = useLocationContext();
  const selectedCity = locationContext?.selectedCity || { name: 'Recife', state: 'Pernambuco', fullName: 'Recife - PE' };
  const setSelectedCity = locationContext?.setSelectedCity || (() => {});
  const availableCities = locationContext?.availableCities || [];
  const detectedCity = locationContext?.detectedCity || null;

  // Verificar se está na página inicial
  const isHomePage = location.pathname === '/';
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState(availableCities.slice(0, 50));
  const [isSearching, setIsSearching] = useState(false);
  const [filteredMobileCities, setFilteredMobileCities] = useState(availableCities.slice(0, 50));
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [isNeighborhoodDropdownOpen, setIsNeighborhoodDropdownOpen] = useState(false);
  const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
  // Filtrar cidades baseado no termo de busca com debounce
  useEffect(() => {
    if (citySearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      if (!citySearchTerm) {
        // Quando não há busca, mostrar apenas as principais cidades (primeiras 50)
        setFilteredCities(availableCities.slice(0, 50));
        setIsSearching(false);
      } else {
        const searchLower = citySearchTerm.toLowerCase();
        
        // Filtrar e ordenar por relevância
        const filtered = availableCities
          .filter(city => 
            city.name.toLowerCase().includes(searchLower) ||
            city.state.toLowerCase().includes(searchLower) ||
            city.fullName.toLowerCase().includes(searchLower)
          )
          .sort((a, b) => {
            // Priorizar cidades que começam com o termo de busca
            const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
            const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
            
            if (aNameStarts && !bNameStarts) return -1;
            if (!aNameStarts && bNameStarts) return 1;
            
            // Secundariamente, por ordem alfabética
            return a.name.localeCompare(b.name);
          })
          .slice(0, 50); // Limitar a 50 resultados para performance
        
        setFilteredCities(filtered);
        setIsSearching(false);
      }
    }, 200); // Debounce de 200ms
    
    return () => clearTimeout(timer);
  }, [citySearchTerm, availableCities]);

  // Filtrar cidades mobile baseado no termo de busca com debounce
  useEffect(() => {
    if (mobileCitySearchTerm) {
      setIsMobileSearching(true);
    }

    const timer = setTimeout(() => {
      if (!mobileCitySearchTerm) {
        setFilteredMobileCities(availableCities.slice(0, 50));
        setIsMobileSearching(false);
      } else {
        const searchLower = mobileCitySearchTerm.toLowerCase();

        const filtered = availableCities
          .filter(city =>
            city.name.toLowerCase().includes(searchLower) ||
            city.state.toLowerCase().includes(searchLower) ||
            city.fullName.toLowerCase().includes(searchLower)
          )
          .sort((a, b) => {
            const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
            const bNameStarts = b.name.toLowerCase().startsWith(searchLower);

            if (aNameStarts && !bNameStarts) return -1;
            if (!aNameStarts && bNameStarts) return 1;

            return a.name.localeCompare(b.name);
          })
          .slice(0, 50);

        setFilteredMobileCities(filtered);
        setIsMobileSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [mobileCitySearchTerm, availableCities]);

  // Carregar bairros quando a cidade mudar
  useEffect(() => {
    if (selectedCity) {
      const cityNeighborhoods = getNeighborhoodsByCity(selectedCity.name, selectedCity.state);
      setNeighborhoods(cityNeighborhoods);
      setSelectedNeighborhood(''); // Resetar bairro ao mudar cidade
    }
  }, [selectedCity]);

  // Detectar scroll para mostrar/esconder barra de filtros
  useEffect(() => {
    const handleScroll = () => {
      // Mostrar barra quando rolar mais de 200px
      if (window.scrollY > 200) {
        setShowFilterBar(true);
      } else {
        setShowFilterBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para dividir texto do mobile (Publicar|Anúncio -> [Publicar, Anúncio])
  const getMobileText = (text: string) => {
    return text.split('|');
  };

  // Verificar se o usuário está logado
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.isLoggedIn) {
            setUser(parsedUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao analisar dados do usuário:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const userDropdown = document.querySelector('.user-dropdown');
      const loginDropdown = document.querySelector('.login-dropdown');
      const cityDropdown = document.querySelector('.city-dropdown');
      const mobileCityDropdown = document.querySelector('.mobile-city-dropdown');
      const neighborhoodDropdown = document.querySelector('.neighborhood-dropdown');

      if (userDropdown && !userDropdown.contains(target)) {
        setIsUserMenuOpen(false);
      }

      if (loginDropdown && !loginDropdown.contains(target)) {
        setIsLoginDropdownOpen(false);
      }

      // Desktop city dropdown
      if (cityDropdown && !cityDropdown.contains(target)) {
        setIsCityDropdownOpen(false);
      }

      // Mobile city dropdown - apenas fechar se clicou fora do container mobile
      if (mobileCityDropdown && !mobileCityDropdown.contains(target)) {
        setIsMobileCityDropdownOpen(false);
        setMobileCitySearchTerm(''); // Limpar busca mobile ao fechar
      }

      // Neighborhood dropdown
      if (neighborhoodDropdown && !neighborhoodDropdown.contains(target)) {
        setIsNeighborhoodDropdownOpen(false);
        setNeighborhoodSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleCityChange = (city: typeof availableCities[0]) => {
    console.log('🌍 Header - Mudando cidade:', {
      cidadeAnterior: selectedCity,
      cidadeNova: city
    });
    
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
    setIsMobileCityDropdownOpen(false);
    setMobileCitySearchTerm(''); // Limpar busca mobile ao selecionar cidade
    
    // Log da mudança de cidade (pode ser substituído por lógica de filtro)
    console.log(`🌍 Header - Cidade selecionada: ${city.fullName}`);
    
    // Salvar no localStorage
    localStorage.setItem('selectedCity', JSON.stringify(city));
  };

  // Função para fazer scroll to top quando clicar no logo
  const handleLogoClick = () => {
    // Se não estiver na página inicial, forçar recarga
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        console.log('Forçando navegação para página inicial');
        window.location.href = '/';
      }
    }, 100);
  };

  // Função para lidar com a busca
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Redirecionar para o catálogo com o termo de busca
      navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-white to-white backdrop-blur-xl border-b border-gray-200 shadow-lg shadow-gray-100/40">
      {/* Elemento decorativo superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-velvet-pink-700 via-white/80 to-velvet-pink-700 mt-6"></div>

          <div className="mx-auto max-w-[1180px] px-4 md:px-10 xl:px-14">
        <div className="flex items-center justify-between h-20 mt-6">
            {/* Menu Hamburguer + Logo - Esquerda */}
            <div className="flex items-center space-x-3">
              <button
                className="text-velvet-pink-600 bg-white p-2 hover:bg-velvet-pink-50 rounded-full transition-colors shadow-sm focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link
                to="/"
                onClick={handleLogoClick}
                className="relative self-center flex items-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src="https://res.cloudinary.com/dtvsnunnl/image/upload/v1752345900/ChatGPT_Image_12_de_jul._de_2025_15_44_28_rpe2ex.png"
                  alt="Faixa Rosa Logo"
                  className="h-16 sm:h-20 md:h-32 lg:h-40 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transform hover:scale-105 transition-all duration-300"
                />
              </Link>
            </div>

            {/* Seletor de Cidade Central - Estilo Barra de Pesquisa */}
            <div className="hidden md:flex flex-1 justify-center px-8">
              <div className="relative city-dropdown max-w-sm w-full">
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  data-city-selector
                  className="w-full flex items-center justify-between space-x-3 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-velvet-pink-500" />
                    <span className="text-sm font-medium text-gray-800">{selectedCity.fullName}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown de cidades - Estilo mais elegante */}
                {isCityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50 max-h-48 md:max-h-64 overflow-y-auto">
                    <div className="px-3 py-1 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selecione sua cidade</span>
                    </div>
                    
                    {/* Campo de busca */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Digite o nome da cidade..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent"
                          value={citySearchTerm}
                          onChange={(e) => setCitySearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && filteredCities.length > 0) {
                              handleCityChange(filteredCities[0]);
                            }
                          }}
                        />
                        {isSearching ? (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-velvet-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Mostrar cidade detectada em destaque se existir e for diferente das da lista */}
                    {detectedCity && selectedCity.lat && selectedCity.lng && !availableCities.some(city => 
                      city.name.toLowerCase() === selectedCity.name.toLowerCase() &&
                      city.state.toLowerCase() === selectedCity.state.toLowerCase()
                    ) && (
                      <>
                        <div className="px-3 py-1 bg-green-50 border-b border-green-100">
                          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">📍 Sua localização</span>
                        </div>
                        <button
                          onClick={() => {
                            if (selectedCity.lat && selectedCity.lng) {
                              handleCityChange({
                                name: selectedCity.name,
                                state: selectedCity.state,
                                fullName: selectedCity.fullName,
                                lat: selectedCity.lat,
                                lng: selectedCity.lng
                              });
                            }
                          }}
                          className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 transition-all duration-200 flex items-center space-x-2 group border-b border-green-100"
                        >
                          <MapPin className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-green-700">{selectedCity.fullName}</span>
                          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                        </button>
                        <div className="px-3 py-1 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outras cidades</span>
                        </div>
                      </>
                    )}
                    
                    {filteredCities.map((city) => (
                      <button
                        key={`${city.name}-${city.state}`}
                        onClick={() => handleCityChange(city)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 group ${
                          selectedCity.name === city.name && selectedCity.state === city.state ? 'bg-velvet-pink-50 border-r-2 border-velvet-pink-500' : ''
                        }`}
                      >
                        <MapPin className={`w-3 h-3 transition-colors ${
                          selectedCity.name === city.name && selectedCity.state === city.state ? 'text-velvet-pink-500' : 'text-gray-400 group-hover:text-velvet-pink-400'
                        }`} />
                        <span className={`text-sm font-medium transition-colors ${
                          selectedCity.name === city.name && selectedCity.state === city.state ? 'text-velvet-pink-700' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>{city.fullName}</span>
                        {selectedCity.name === city.name && selectedCity.state === city.state && (
                          <div className="ml-auto w-2 h-2 bg-velvet-pink-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                    
                    {filteredCities.length === 0 && citySearchTerm && !isSearching && (
                      <div className="px-3 py-4 text-center">
                        <div className="text-sm text-gray-500 mb-2">
                          Nenhuma cidade encontrada com "{citySearchTerm}"
                        </div>
                        <div className="text-xs text-gray-400">
                          Tente buscar pelo nome da cidade ou sigla do estado
                        </div>
                      </div>
                    )}
                    
                    {isSearching && (
                      <div className="px-3 py-4 text-center">
                        <div className="text-sm text-gray-500">
                          Buscando cidades...
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation - Direita */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Botão de Busca */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowSearch(!showSearch);
              }}
              className="text-gray-800 hover:text-velvet-pink-500 transition-colors p-2 hover:bg-velvet-pink-50 rounded-full"
            >
              <Search className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              {user ? (
                  <div className="relative user-dropdown">
                  <button
                    className="flex items-center space-x-2 text-gray-800 hover:text-velvet-pink-500 transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <User className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="hidden lg:inline-block text-sm font-medium">{user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'}</span>
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </button>

                  {/* Dropdown do usuário */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl py-2 z-10">
                      <Link
                        to={user?.type === 'companion' ? '/companion-dashboard' : '/client-dashboard'}
                        className="block px-4 py-2 text-gray-800 hover:bg-velvet-pink-50 hover:text-velvet-pink-500 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Meu Perfil
                      </Link>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-velvet-pink-50 hover:text-velvet-pink-500 transition-colors flex items-center space-x-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
            </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/companion-dashboard')}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-velvet-pink-50 border border-gray-200 transition-colors"
                  title="Entrar / Cadastrar"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </div>
          </nav>

          {/* Mobile Controls - Direita */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Botão de Busca Mobile */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowSearch(!showSearch);
                }}
                className="text-gray-800 hover:text-velvet-pink-500 transition-colors p-2 hover:bg-velvet-pink-50 rounded-full"
              >
                <Search className="w-5 h-5" />
              </button>

            {!user && (
              <button
                onClick={() => navigate('/companion-dashboard')}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-velvet-pink-50 border border-gray-200 transition-colors"
                title="Entrar / Cadastrar"
              >
                <User className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Mobile City Selector - Abaixo do header */}
      <div className="md:hidden px-4 py-2 border-t border-gray-100">
        <div className="relative mobile-city-dropdown">
          <button
            onClick={() => setIsMobileCityDropdownOpen(!isMobileCityDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-velvet-pink-400 transition-all"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-velvet-pink-500" />
              <span className="text-sm font-medium text-gray-800">{selectedCity.fullName}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isMobileCityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMobileCityDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50 max-h-64 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar cidade..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent"
                    value={mobileCitySearchTerm}
                    onChange={(e) => setMobileCitySearchTerm(e.target.value)}
                    autoFocus
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              {filteredMobileCities.map((city) => (
                <button
                  key={`mobile-${city.name}-${city.state}`}
                  onClick={() => handleCityChange(city)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-all flex items-center space-x-2 ${
                    selectedCity.name === city.name && selectedCity.state === city.state ? 'bg-velvet-pink-50 border-r-2 border-velvet-pink-500' : ''
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${
                    selectedCity.name === city.name && selectedCity.state === city.state ? 'text-velvet-pink-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedCity.name === city.name && selectedCity.state === city.state ? 'text-velvet-pink-700' : 'text-gray-700'
                  }`}>{city.fullName}</span>
                </button>
              ))}
              {filteredMobileCities.length === 0 && mobileCitySearchTerm && (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  Nenhuma cidade encontrada
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Busca */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Buscar Acompanhante</h3>
              <button
                onClick={() => setShowSearch(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite o nome da acompanhante..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  autoFocus
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-gradient-to-r from-velvet-pink-500 to-velvet-pink-600 text-white py-3 rounded-lg font-medium hover:from-velvet-pink-600 hover:to-velvet-pink-700 transition-colors"
                >
                  Buscar
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Botão Flutuante "Publicar Anúncio" */}
    {!user && (
      <div className="fixed top-[60px] sm:top-[70px] md:top-[88px] right-2 sm:right-3 md:right-6 z-40 animate-bounce-slow">
        <Link
          to="/login?type=companion"
          className="flex items-center space-x-1 sm:space-x-1 md:space-x-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-3 rounded-full shadow-2xl hover:shadow-pink-500/50 hover:from-pink-500 hover:to-pink-700 transition-all duration-300 hover:scale-105 group"
        >
          <Plus className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Publicar Anúncio</span>
        </Link>
      </div>
    )}

    {/* Barra de Filtro de Bairros - Fixo abaixo do header - Aparece após scroll - Apenas na página inicial */}
    {isHomePage && showFilterBar && (
      <div className="sticky top-[65px] md:top-[85px] z-40 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 shadow-md animate-fade-in">
          <div className="mx-auto max-w-[1180px] px-4 md:px-10 xl:px-14 py-2 md:py-3">
          <div className="flex flex-col space-y-2">
            {/* Filtro de Gênero */}
            <div className="flex items-center justify-center">
              <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
                {(['Mulheres', 'Homens', 'Trans'] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedGender === gender
                        ? 'bg-white text-velvet-pink-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-300/50'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Bairro */}
            <div className="flex items-center justify-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="w-4 h-4 text-velvet-pink-500" />
              <span className="text-xs md:text-sm font-medium">Filtrar por cidade e bairro:</span>
            </div>

          {/* Dropdown de Bairros */}
          <div className="relative neighborhood-dropdown w-full md:w-auto">
            <button
              onClick={() => setIsNeighborhoodDropdownOpen(!isNeighborhoodDropdownOpen)}
              className="w-full md:w-auto flex items-center space-x-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-velvet-pink-500 hover:shadow-sm transition-all duration-200"
            >
              <MapPin className="w-4 h-4 text-velvet-pink-500" />
              <span className="text-xs md:text-sm font-medium text-gray-700">
                {selectedNeighborhood || 'Todos os bairros'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isNeighborhoodDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown de bairros */}
            {isNeighborhoodDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50 min-w-[280px] max-h-48 md:max-h-64 overflow-y-auto">
                <div className="px-3 py-1 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Bairros de {selectedCity.name}
                  </span>
                </div>

                {/* Campo de busca de bairros */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar bairro..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-velvet-pink-500 focus:border-transparent"
                      value={neighborhoodSearchTerm}
                      onChange={(e) => setNeighborhoodSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Opção "Todos os bairros" */}
                <button
                  onClick={() => {
                    setSelectedNeighborhood('');
                    setIsNeighborhoodDropdownOpen(false);
                    setNeighborhoodSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 ${
                    !selectedNeighborhood ? 'bg-velvet-pink-50 border-r-2 border-velvet-pink-500' : ''
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${!selectedNeighborhood ? 'text-velvet-pink-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${!selectedNeighborhood ? 'text-velvet-pink-700' : 'text-gray-700'}`}>
                    Todos os bairros
                  </span>
                  {!selectedNeighborhood && (
                    <div className="ml-auto w-2 h-2 bg-velvet-pink-500 rounded-full"></div>
                  )}
                </button>

                {/* Lista de bairros */}
                {neighborhoods
                  .filter(n =>
                    !neighborhoodSearchTerm ||
                    n.name.toLowerCase().includes(neighborhoodSearchTerm.toLowerCase())
                  )
                  .map((neighborhood) => (
                    <button
                      key={neighborhood.name}
                      onClick={() => {
                        setSelectedNeighborhood(neighborhood.name);
                        setIsNeighborhoodDropdownOpen(false);
                        setNeighborhoodSearchTerm('');
                        console.log(`🏘️ Bairro selecionado: ${neighborhood.name}`);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 ${
                        selectedNeighborhood === neighborhood.name ? 'bg-velvet-pink-50 border-r-2 border-velvet-pink-500' : ''
                      }`}
                    >
                      <MapPin className={`w-3 h-3 ${
                        selectedNeighborhood === neighborhood.name ? 'text-velvet-pink-500' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedNeighborhood === neighborhood.name ? 'text-velvet-pink-700' : 'text-gray-700'
                      }`}>
                        {neighborhood.name}
                      </span>
                      {selectedNeighborhood === neighborhood.name && (
                        <div className="ml-auto w-2 h-2 bg-velvet-pink-500 rounded-full"></div>
                      )}
                    </button>
                  ))}

                {neighborhoods.filter(n =>
                  !neighborhoodSearchTerm ||
                  n.name.toLowerCase().includes(neighborhoodSearchTerm.toLowerCase())
                ).length === 0 && neighborhoodSearchTerm && (
                  <div className="px-3 py-4 text-center">
                    <div className="text-sm text-gray-500 mb-2">
                      Nenhum bairro encontrado com "{neighborhoodSearchTerm}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mostrar filtros ativos */}
           {selectedNeighborhood && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-velvet-pink-100 text-velvet-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                <span>{selectedNeighborhood}</span>
                <button
                  onClick={() => setSelectedNeighborhood('')}
                  className="ml-1 hover:text-velvet-pink-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
           )}
            </div>{/* close neighborhood filter row */}
          </div>{/* close flex-col */}
        </div>
      </div>
    )}

    {/* Side Menu */}
    <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

    {/* Registration Modal */}
    {isRegistrationModalOpen && (
      <RegistrationModal onClose={() => setIsRegistrationModalOpen(false)} />
    )}
    </>
  );
};

export default Header;
