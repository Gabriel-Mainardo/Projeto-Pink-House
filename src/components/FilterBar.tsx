import { MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { locationFilterOptions } from "@/lib/recife-metropolitan-area";

interface FilterBarProps {
  onFilterClick?: () => void;
  selectedGender?: 'Mulheres' | 'Homens' | 'Trans';
  onGenderChange?: (gender: 'Mulheres' | 'Homens' | 'Trans') => void;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFilterClick,
  selectedGender: propSelectedGender,
  onGenderChange,
  selectedLocation: propSelectedLocation,
  onLocationChange
}) => {
  const [selectedGender, setSelectedGender] = useState<'Mulheres' | 'Homens' | 'Trans'>(propSelectedGender || 'Mulheres');
  const [selectedLocation, setSelectedLocation] = useState<string>(propSelectedLocation || "regiao-metropolitana");

  // Sincronizar com props
  useEffect(() => {
    if (propSelectedGender) {
      setSelectedGender(propSelectedGender);
    }
  }, [propSelectedGender]);

  useEffect(() => {
    if (propSelectedLocation) {
      setSelectedLocation(propSelectedLocation);
    }
  }, [propSelectedLocation]);

  const handleGenderChange = (gender: 'Mulheres' | 'Homens' | 'Trans') => {
    setSelectedGender(gender);
    onGenderChange?.(gender);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    onLocationChange?.(location);
    // Salvar no localStorage
    localStorage.setItem('selectedLocation', location);
  };

  return (
    <div className="sticky top-16 z-40 w-full bg-gray-100 backdrop-blur supports-[backdrop-filter]:bg-gray-100/80">
      <div className="container px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Select value={selectedLocation} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-[150px] sm:w-[200px] ml-0 sm:ml-4 text-xs sm:text-sm">
              <MapPin className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <SelectValue placeholder="Localização" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              {locationFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botões de gênero */}
          <div className="flex-1 flex overflow-x-auto scrollbar-hide bg-gray-200 rounded-lg p-1 gap-2">
            <Button
              variant="ghost"
              className={`flex-1 min-w-[120px] sm:min-w-[150px] text-sm sm:text-base whitespace-nowrap ${selectedGender === 'Mulheres' ? 'bg-white text-primary hover:bg-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-400/50'}`}
              onClick={() => handleGenderChange('Mulheres')}
            >
              Mulheres
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 min-w-[120px] sm:min-w-[150px] text-sm sm:text-base whitespace-nowrap ${selectedGender === 'Homens' ? 'bg-white text-primary hover:bg-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-400/50'}`}
              onClick={() => handleGenderChange('Homens')}
            >
              Homens
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 min-w-[120px] sm:min-w-[150px] text-sm sm:text-base whitespace-nowrap ${selectedGender === 'Trans' ? 'bg-white text-primary hover:bg-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-400/50'}`}
              onClick={() => handleGenderChange('Trans')}
            >
              Trans
            </Button>
          </div>

          <Button
            variant="outline"
            className="p-2 sm:p-2.5 shrink-0"
            size="icon"
            onClick={onFilterClick}
          >
            <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
