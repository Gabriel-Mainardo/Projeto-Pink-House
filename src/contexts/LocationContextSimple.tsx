import React, { createContext, useContext, useState, ReactNode } from 'react';

// Lista simples de cidades
const simpleCities = [
  { name: 'Recife', state: 'Pernambuco', fullName: 'Recife - PE' },
  { name: 'São Paulo', state: 'São Paulo', fullName: 'São Paulo - SP' },
  { name: 'Rio de Janeiro', state: 'Rio de Janeiro', fullName: 'Rio de Janeiro - RJ' },
  { name: 'Brasília', state: 'Distrito Federal', fullName: 'Brasília - DF' },
  { name: 'Salvador', state: 'Bahia', fullName: 'Salvador - BA' }
];

interface LocationContextType {
  selectedCity: { name: string; state: string; fullName: string; lat?: number; lng?: number };
  setSelectedCity: (city: { name: string; state: string; fullName: string; lat?: number; lng?: number }) => void;
  userLocation: { lat: number; lng: number } | null;
  isLocationLoading: boolean;
  showLocationPopup: boolean;
  showCitySelectionModal: boolean;
  requestLocation: () => void;
  dismissLocationPopup: () => void;
  dismissCitySelectionModal: () => void;
  confirmCitySelection: (city: { name: string; state: string; fullName: string; lat?: number; lng?: number }) => void;
  availableCities: typeof simpleCities;
  detectedCity: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    console.error('useLocation must be used within a LocationProvider');
    // Retornar valores padrão em caso de erro
    return {
      selectedCity: { name: 'Recife', state: 'Pernambuco', fullName: 'Recife - PE' },
      setSelectedCity: () => {},
      userLocation: null,
      isLocationLoading: false,
      showLocationPopup: false,
      showCitySelectionModal: false,
      requestLocation: () => {},
      dismissLocationPopup: () => {},
      dismissCitySelectionModal: () => {},
      confirmCitySelection: () => {},
      availableCities: simpleCities,
      detectedCity: null
    };
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<{ name: string; state: string; fullName: string; lat?: number; lng?: number }>({
    name: 'Recife',
    state: 'Pernambuco',
    fullName: 'Recife - PE'
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showCitySelectionModal, setShowCitySelectionModal] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  // Funções simplificadas
  const requestLocation = () => {
    console.log('Request location called');
  };

  const dismissLocationPopup = () => {
    setShowLocationPopup(false);
  };

  const dismissCitySelectionModal = () => {
    setShowCitySelectionModal(false);
  };

  const confirmCitySelection = (city: { name: string; state: string; fullName: string; lat?: number; lng?: number }) => {
    setSelectedCity(city);
    setShowCitySelectionModal(false);
  };

  const value: LocationContextType = {
    selectedCity,
    setSelectedCity,
    userLocation,
    isLocationLoading,
    showLocationPopup,
    showCitySelectionModal,
    requestLocation,
    dismissLocationPopup,
    dismissCitySelectionModal,
    confirmCitySelection,
    availableCities: simpleCities,
    detectedCity
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};



