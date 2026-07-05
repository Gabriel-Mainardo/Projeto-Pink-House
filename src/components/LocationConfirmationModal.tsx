
import React, { useState, useEffect } from 'react';
import { MapPin, Check, ChevronDown, Navigation, X, Users, Loader2 } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';

const LocationConfirmationModal: React.FC = () => {
  const {
    showCitySelectionModal,
    detectedCity,
    confirmCitySelection,
    dismissCitySelectionModal,
    availableCities,
    setSelectedCity,
    selectedCity,
    isLocationLoading,
    requestLocation
  } = useLocation();
  
  const [open, setOpen] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [autoDetectAttempted, setAutoDetectAttempted] = useState(false);

  // Tenta detectar localização automaticamente quando o modal abre
  useEffect(() => {
    if (showCitySelectionModal && !autoDetectAttempted && !detectedCity) {
      setAutoDetectAttempted(true);
      requestLocation();
    }
  }, [showCitySelectionModal, autoDetectAttempted, detectedCity, requestLocation]);

  const handleConfirmDetectedCity = () => {
    // Usar a cidade detectada real, não a da lista
    if (detectedCity) {
      const detectedCityObj = {
        name: detectedCity.split(' - ')[0] || detectedCity,
        state: detectedCity.split(' - ')[1] || '',
        fullName: detectedCity,
        lat: selectedCity?.lat,
        lng: selectedCity?.lng
      };
      confirmCitySelection(detectedCityObj);
    }
  };

  const handleRejectDetectedCity = () => {
    setShowManualSelection(true);
  };

  const handleConfirmManualSelection = () => {
    if (selectedCity) {
      confirmCitySelection(selectedCity);
    }
  };

  const renderAutoDetectionContent = () => {
    if (isLocationLoading) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-velvet-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-velvet-pink-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ }}>
            Encontrando acompanhantes próximas...
          </h3>
          <p className="text-gray-600 text-sm">
            Detectando sua região para mostrar os melhores perfis perto de você
          </p>
        </div>
      );
    }

    if (detectedCity) {
      return (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ }}>
            Deseja ver acompanhantes da sua cidade?
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Detectamos que você está em:
          </p>
          <div className="bg-gradient-to-r from-velvet-pink-50 to-velvet-pink-100 border border-velvet-pink-200 rounded-lg p-4 mb-4">
            <p className="font-bold text-velvet-pink-800 text-xl">{detectedCity}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm font-medium">
              ✨ <strong>Clique em "Sim"</strong> para ver acompanhantes e stories da sua região agora!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Navigation className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ }}>
          Ops! Não conseguimos detectar sua cidade
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Para ver as melhores acompanhantes da sua região, tente novamente ou escolha sua cidade.
        </p>
      </div>
    );
  };

  const renderManualSelectionContent = () => (
    <div className="py-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ }}>
          Qual é a sua cidade?
        </h3>
        <p className="text-gray-600 text-sm">
          Escolha para descobrir as acompanhantes mais próximas de você
        </p>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCity
              ? selectedCity.fullName
              : "Selecione uma cidade..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
          <Command>
            <CommandInput placeholder="Buscar cidade..." />
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {availableCities.map((city) => (
                <CommandItem
                  key={city.fullName}
                  value={city.fullName}
                  onSelect={(currentValue) => {
                    const city = availableCities.find(c => c.fullName.toLowerCase() === currentValue.toLowerCase())
                    if(city) setSelectedCity(city)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCity?.fullName === city.fullName ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={showCitySelectionModal} onOpenChange={dismissCitySelectionModal}>
      <DialogContent className="sm:max-w-[450px]" style={{ }}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 text-velvet-pink-600" />
              {showManualSelection ? 'Escolher Cidade' : 'Confirmar Localização'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissCitySelectionModal}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {showManualSelection 
              ? 'Encontre as melhores acompanhantes da sua região'
              : 'Descubra acompanhantes e stories próximos de você automaticamente'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="min-h-[200px]">
          {showManualSelection ? renderManualSelectionContent() : renderAutoDetectionContent()}
        </div>

        <DialogFooter className="flex-col space-y-2">
          {!showManualSelection ? (
            <>
              {detectedCity ? (
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={handleConfirmDetectedCity} 
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    🔥 SIM! Ver acompanhantes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRejectDetectedCity}
                    className="flex-1 text-gray-600 border-gray-300"
                  >
                    Escolher outra cidade
                  </Button>
                </div>
              ) : !isLocationLoading ? (
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={() => {
                      setAutoDetectAttempted(false);
                      requestLocation();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                  <Button 
                    onClick={() => setShowManualSelection(true)}
                    className="flex-1 bg-velvet-pink-600 hover:bg-velvet-pink-700"
                  >
                    Escolher manualmente
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex space-x-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowManualSelection(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleConfirmManualSelection}
                disabled={!selectedCity}
                className="flex-1 bg-velvet-pink-600 hover:bg-velvet-pink-700"
              >
                Confirmar
              </Button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 text-center w-full">
            💝 Acompanhantes e stories da sua cidade aparecerão primeiro
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationConfirmationModal;
