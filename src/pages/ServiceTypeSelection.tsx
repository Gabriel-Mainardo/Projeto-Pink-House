import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { ChevronRight, MapPin, Monitor, X, Search } from 'lucide-react';
import { brazilianCities } from '../lib/cities-optimized';
import { registrationService } from '../services/registrationService';

const ServiceTypeSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email') || '';
  const [selectedService, setSelectedService] = useState<'presencial' | 'virtual' | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState(brazilianCities);

  const handleServiceSelect = (serviceType: 'presencial' | 'virtual') => {
    setSelectedService(serviceType);

    if (serviceType === 'presencial') {
      setShowCityModal(true);
    }
  };

  const handleContinue = () => {
    if (!selectedService) return;

    if (selectedService === 'presencial' && !selectedCity) {
      setShowCityModal(true);
      return;
    }

    // Salvar dados no localStorage
    registrationService.saveData({
      serviceType: selectedService
    });

    const params = new URLSearchParams({
      email: userEmail,
      service: selectedService
    });

    if (selectedService === 'presencial' && selectedCity) {
      params.append('city', selectedCity);
    }

    navigate(`/profile-creation?${params.toString()}`);
  };

  const handleCitySearch = (searchTerm: string) => {
    setCitySearch(searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredCities(brazilianCities);
    } else {
      const filtered = brazilianCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  };

  const handleCitySelect = (cityName: string, state: string) => {
    setSelectedCity(`${cityName} - ${state}`);
    setShowCityModal(false);
    setCitySearch('');
    setFilteredCities(brazilianCities);
  };

  const handleCityConfirm = () => {
    if (selectedCity.trim()) {
      setShowCityModal(false);
    }
  };

  const serviceOptions = [
    {
      type: 'presencial' as const,
      title: 'Atendimento Presencial',
      icon: <MapPin className="w-8 h-8 text-velvet-pink-600" />,
      description: 'Encontros pessoais em locais acordados',
      benefits: [
        'Experiência mais próxima e pessoal',
        'Flexibilidade de locais',
        'Contato direto com clientes'
      ]
    },
    {
      type: 'virtual' as const,
      title: 'Atendimento Virtual',
      icon: <Monitor className="w-8 h-8 text-velvet-pink-600" />,
      description: 'Videochamadas e serviços online',
      benefits: [
        'Comodidade e segurança',
        'Atendimento de qualquer lugar',
        'Agenda mais flexível'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light mb-4">
              Que tipo de <span className="text-velvet-pink-600">serviço</span> você presta?
            </h1>
            <p className="text-gray-600 text-lg">
              Escolha como você deseja atender seus clientes
            </p>
          </div>

          {/* Opções de serviço */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {serviceOptions.map((option) => (
              <div
                key={option.type}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedService === option.type
                    ? 'border-velvet-pink-500 bg-velvet-pink-50'
                    : 'border-gray-200 bg-white hover:border-velvet-pink-300'
                }`}
                onClick={() => handleServiceSelect(option.type)}
              >
                <div className="text-center mb-4">
                  {option.icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {option.title}
                </h3>

                <p className="text-gray-600 mb-4 text-center">
                  {option.description}
                </p>

                <ul className="space-y-2">
                  {option.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-velvet-pink-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {selectedService === option.type && (
                  <div className="mt-4 text-center space-y-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-velvet-pink-100 text-velvet-pink-700 text-sm font-medium">
                      Selecionado
                    </div>
                    {option.type === 'presencial' && selectedCity && (
                      <div className="text-sm text-gray-600">
                        📍 {selectedCity}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botão de continuar */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedService}
              className={`px-8 py-3 rounded-lg text-white text-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 mx-auto ${
                selectedService
                  ? 'bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 hover:from-velvet-pink-800 hover:to-velvet-pink-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continuar</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {!selectedService && (
              <p className="text-gray-500 text-sm mt-3">
                Selecione um tipo de serviço para continuar
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de Seleção de Cidade */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-auto shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Selecione sua cidade
              </h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-hidden">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  placeholder="Buscar cidade ou estado..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-velvet-pink-600 focus:ring-1 focus:ring-velvet-pink-600"
                  autoFocus
                />
              </div>

              {/* Lista de cidades */}
              <div className="overflow-y-auto max-h-96 border border-gray-200 rounded-lg">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city, index) => (
                    <button
                      key={`${city.name}-${city.state}-${index}`}
                      onClick={() => handleCitySelect(city.name, city.state)}
                      className="w-full text-left px-4 py-3 hover:bg-velvet-pink-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800">{city.name}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {city.state}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma cidade encontrada</p>
                    <p className="text-sm">Tente buscar por outro termo</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCityModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTypeSelection;