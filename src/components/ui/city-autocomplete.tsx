import React, { useState, useEffect, useRef } from 'react';
import { brazilianCities } from '../../lib/cities-optimized';

interface City {
  name: string;
  state: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  citiesList?: City[];
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Digite sua cidade",
  className = "",
  citiesList
}) => {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Usar a lista completa de cidades brasileiras
  const cities = citiesList || brazilianCities;

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função para remover acentos e normalizar texto
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacríticos (acentos)
  };

  // Filtrar sugestões baseado no input
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setLoading(true);

    // Simular delay de API
    setTimeout(() => {
      if (inputValue.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setLoading(false);
        return;
      }

      const normalizedSearch = normalizeText(inputValue);

      const filtered = cities.filter(city => {
        const normalizedCityName = normalizeText(city.name);
        const normalizedStateName = normalizeText(city.state);
        
        // Buscar por nome da cidade ou estado, com e sem acentos
        return normalizedCityName.includes(normalizedSearch) || 
               normalizedStateName.includes(normalizedSearch) ||
               city.name.toLowerCase().includes(inputValue.toLowerCase()) ||
               city.state.toLowerCase().includes(inputValue.toLowerCase());
      }).slice(0, 10); // Limitar a 10 sugestões para performance

      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setLoading(false);
    }, 100);
  };

  // Selecionar uma sugestão
  const handleSelectSuggestion = (city: City) => {
    onChange(`${city.name} - ${city.state}`);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => value && handleInputChange(value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none ${className}`}
      />

      {/* Indicador de loading */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Lista de sugestões */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-velvet-pink-600 rounded-lg shadow-lg border border-white/20 max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.state}-${index}`}
              className="px-4 py-2 cursor-pointer hover:bg-velvet-pink-700 text-white transition-colors"
              onClick={() => handleSelectSuggestion(city)}
            >
              {city.name} - {city.state}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete; 