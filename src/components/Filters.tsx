import { useState } from 'react';
import { Filter, MapPin, User, Heart, DollarSign, Crown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Filters = () => {
  const { t, translateSpecialty } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showPremiumInstruction, setShowPremiumInstruction] = useState(false);

  const locations = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Porto Alegre'];
  const physicalTypes = ['Morena', 'Loira', 'Ruiva', 'Morena Clara', 'Negra'];
  const services = ['Acompanhante Social', 'Jantar Executivo', 'Eventos', 'Viagens', 'Massagem'];
  const priceRanges = ['R$ 200-500', 'R$ 500-1000', 'R$ 1000-2000', 'R$ 2000+'];

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="card-velvet p-6 space-y-6">
      <div className="flex items-center space-x-3 border-b border-velvet-pink-700/20 pb-4">
        <Filter className="w-5 h-5 text-velvet-pink-600" />
        <h3 className="text-xl font-serif font-semibold text-velvet-white">{t('filters')}</h3>
      </div>

      {/* Localização */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-velvet-pink-600" />
          <label className="text-velvet-white font-medium">{t('location')}</label>
        </div>
        <select 
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full bg-velvet-dark border border-velvet-pink-700/30 rounded-lg px-4 py-3 text-velvet-white focus:border-velvet-pink-600 focus:outline-none transition-colors"
        >
          <option value="">{t('allCities')}</option>
          {locations.map(location => (
            <option key={location} value={location}>{t(location)}</option>
          ))}
        </select>
      </div>

      {/* Tipo Físico */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-velvet-pink-600" />
          <label className="text-velvet-white font-medium">{t('physicalType')}</label>
        </div>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full bg-velvet-dark border border-velvet-pink-700/30 rounded-lg px-4 py-3 text-velvet-white focus:border-velvet-pink-600 focus:outline-none transition-colors"
        >
          <option value="">{t('allTypes')}</option>
          {physicalTypes.map(type => (
            <option key={type} value={type}>
              {type === 'Morena' ? t('brunette') : 
               type === 'Loira' ? t('blonde') : 
               type === 'Ruiva' ? t('redhead') : 
               type === 'Morena Clara' ? t('lightBrunette') : 
               type === 'Negra' ? t('black') : type}
            </option>
          ))}
        </select>
      </div>

      {/* Serviços */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-velvet-pink-600" />
          <label className="text-velvet-white font-medium">{t('services')}</label>
        </div>
        <div className="space-y-2">
          {services.map(service => (
            <label key={service} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
                className="w-4 h-4 text-velvet-pink-600 bg-velvet-dark border-velvet-pink-700/30 rounded focus:ring-velvet-pink-600 focus:ring-2"
              />
              <span className="text-velvet-white text-sm">{translateSpecialty(service)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-velvet-pink-600" />
          <label className="text-velvet-white font-medium">{t('priceRange')}</label>
        </div>
        <select 
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="w-full bg-velvet-dark border border-velvet-pink-700/30 rounded-lg px-4 py-3 text-velvet-white focus:border-velvet-pink-600 focus:outline-none transition-colors"
        >
          <option value="">{t('allPrices')}</option>
          {priceRanges.map(range => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
      </div>

      {/* Filtro Faixa Rosa Premium */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Crown className="w-4 h-4 text-pink-600" />
          <label className="text-velvet-white font-medium">Faixa Rosa Pro</label>
        </div>
        <button
          onClick={() => {
            setShowPremiumOnly(!showPremiumOnly);
            if (!showPremiumOnly && !localStorage.getItem('premiumInstructionSeen')) {
              setShowPremiumInstruction(true);
            }
          }}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            showPremiumOnly 
              ? 'bg-gradient-to-r from-pink-800 to-pink-900 text-white border-2 border-pink-700' 
              : 'bg-velvet-dark border border-velvet-pink-700/30 text-velvet-white hover:bg-pink-800/20'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>{showPremiumOnly ? 'Faixa Rosa Pro Ativo' : 'Faixa Rosa Pro'}</span>
          </div>
          <div className="text-xs opacity-80 mt-1">
            Acima de R$ 200 - Qualidade Premium
          </div>
        </button>
      </div>

      <button className="w-full btn-velvet">
        {t('applyFilters')}
      </button>

      {/* Modal de Instrução Premium */}
      {showPremiumInstruction && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-gradient-to-br from-pink-200 to-pink-300 p-8 rounded-3xl max-w-md w-full mx-4 text-center shadow-2xl relative"
            style={{ }}
          >
            {/* Conteúdo */}
            <div className="space-y-6">
              {/* Título */}
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-8 h-8 text-pink-800" />
                <h2 className="text-2xl font-bold text-gray-900">Faixa Rosa Pro</h2>
              </div>
              
              {/* Mensagem */}
              <div className="text-gray-800 leading-relaxed font-medium text-base">
                <p className="mb-4">
                  Aqui você encontra nossas <strong>mulheres premium</strong> com valores acima de R$ 200.
                </p>
                <p className="text-pink-800 font-semibold">
                  ✨ Qualidade superior e experiências exclusivas!
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col space-y-3 mt-6">
                <button 
                  onClick={() => {
                    setShowPremiumInstruction(false);
                  }}
                  className="bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-700 hover:to-pink-800 transition-all"
                >
                  Entendi!
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('premiumInstructionSeen', 'true');
                    setShowPremiumInstruction(false);
                  }}
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                  Não mostrar novamente
                </button>
              </div>
            </div>

            {/* Botão X no canto */}
            <button
              onClick={() => setShowPremiumInstruction(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
