import React, { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { mainCities, metropolitanAreas, getMetropolitanArea, type City } from '../../lib/metropolitan-areas';

interface CitiesSelectorProps {
  selectedCities: string[];
  onChange: (cities: string[]) => void;
  placeholder?: string;
  className?: string;
  mainCity?: string; // Cidade principal selecionada no formulário
}

const CitiesSelector: React.FC<CitiesSelectorProps> = ({
  selectedCities,
  onChange,
  placeholder = "Selecione as cidades onde você atende",
  className = "",
  mainCity
}) => {
  const [step, setStep] = useState<'main' | 'metropolitan'>('main');
  const [selectedMainCity, setSelectedMainCity] = useState<City | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Verificar se a cidade principal tem região metropolitana e mostrar automaticamente
  React.useEffect(() => {
    if (mainCity && mainCity.includes(' - ') && !showDropdown) {
      const [cityName, state] = mainCity.split(' - ');
      const metropolitanArea = getMetropolitanArea(cityName.trim(), state.trim());
      
      if (metropolitanArea) {
        const cityObj = { name: cityName.trim(), state: state.trim(), fullName: mainCity };
        setSelectedMainCity(cityObj);
        setStep('metropolitan');
        // Não abrir automaticamente o dropdown
      }
    }
  }, [mainCity]);

  // Filtrar cidades principais baseado na busca
  const filteredMainCities = mainCities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar cidade individual
  const addCity = (city: City) => {
    const cityName = city.fullName;
    if (!selectedCities.includes(cityName)) {
      onChange([...selectedCities, cityName]);
    }
  };

  // Remover cidade
  const removeCity = (cityToRemove: string) => {
    onChange(selectedCities.filter(city => city !== cityToRemove));
  };

  // Selecionar cidade principal e verificar se tem região metropolitana
  const selectMainCity = (city: City) => {
    const metropolitanArea = getMetropolitanArea(city.name, city.state);
    
    if (metropolitanArea) {
      setSelectedMainCity(city);
      setStep('metropolitan');
    } else {
      // Se não tem região metropolitana, adiciona diretamente
      addCity(city);
      setShowDropdown(false);
      setSearchTerm('');
    }
  };

  // Adicionar cidade da região metropolitana
  const addMetropolitanCity = (city: City) => {
    addCity(city);
  };

  // Adicionar toda a região metropolitana
  const addEntireMetropolitanArea = () => {
    if (selectedMainCity) {
      const metropolitanArea = getMetropolitanArea(selectedMainCity.name, selectedMainCity.state);
      if (metropolitanArea) {
        const newCities = metropolitanArea.cities
          .map(city => city.fullName)
          .filter(cityName => !selectedCities.includes(cityName));
        onChange([...selectedCities, ...newCities]);
      }
    }
    backToMain();
  };

  // Voltar para seleção principal
  const backToMain = () => {
    setStep('main');
    setSelectedMainCity(null);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const currentMetropolitanArea = selectedMainCity ? getMetropolitanArea(selectedMainCity.name, selectedMainCity.state) : null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Cidades selecionadas */}
      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCities.map((city, index) => (
            <div key={index} className="flex items-center bg-velvet-pink-100 text-velvet-pink-800 px-3 py-1 rounded-full text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {city}
              <button
                type="button"
                onClick={() => removeCity(city)}
                className="ml-2 hover:text-velvet-pink-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botão de adicionar */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-gray-600 hover:border-velvet-pink-400 hover:text-velvet-pink-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {selectedCities.length === 0 ? placeholder : 'Adicionar mais cidades'}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {step === 'main' && (
              <>
                {/* Campo de busca */}
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cidade..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-velvet-pink-500"
                  />
                </div>

                {/* Lista de cidades principais */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredMainCities.map((city) => {
                    const hasMetropolitan = getMetropolitanArea(city.name, city.state) !== null;
                    return (
                      <button
                        key={`${city.name}-${city.state}`}
                        type="button"
                        onClick={() => selectMainCity(city)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{city.name}</div>
                          <div className="text-sm text-gray-500">{city.state}</div>
                        </div>
                        {hasMetropolitan && (
                          <div className="text-xs text-velvet-pink-600 bg-velvet-pink-100 px-2 py-1 rounded">
                            + Região
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 'metropolitan' && currentMetropolitanArea && (
              <>
                {/* Header da região metropolitana */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{currentMetropolitanArea.name}</h4>
                      <p className="text-sm text-gray-600">{currentMetropolitanArea.cities.length} cidades disponíveis</p>
                    </div>
                    <button
                      type="button"
                      onClick={backToMain}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Botão para adicionar toda a região */}
                <div className="p-3 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={addEntireMetropolitanArea}
                    className="w-full bg-velvet-pink-500 text-white py-2 px-4 rounded-lg hover:bg-velvet-pink-600 transition-colors"
                  >
                    Adicionar toda a região metropolitana
                  </button>
                </div>

                {/* Lista de cidades da região */}
                <div className="max-h-60 overflow-y-auto">
                  {currentMetropolitanArea.cities.map((city) => {
                    const isSelected = selectedCities.includes(city.fullName);
                    return (
                      <button
                        key={`${city.name}-${city.state}`}
                        type="button"
                        onClick={() => addMetropolitanCity(city)}
                        disabled={isSelected}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                          isSelected 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">{city.name}</div>
                          {isSelected && (
                            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Selecionada
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Texto de ajuda */}
      <p className="text-sm text-gray-500">
        Selecione as cidades onde você atende. Cidades com regiões metropolitanas permitem seleção de múltiplas cidades próximas.
      </p>
    </div>
  );
};

export default CitiesSelector;