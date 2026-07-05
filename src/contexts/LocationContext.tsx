import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { brazilianCities } from '../lib/cities-complete-optimized';

const availableCities = brazilianCities
  .map((city) => ({
    name: city.name,
    state: city.state,
    fullName: `${city.name} - ${city.state}`,
    lat: 0,
    lng: 0
  }))
  .filter(
    (city, index, array) =>
      array.findIndex((candidate) => candidate.name === city.name && candidate.state === city.state) === index
  );

type City = {
  name: string;
  state: string;
  fullName: string;
  lat?: number;
  lng?: number;
};

interface LocationContextType {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  userLocation: { lat: number; lng: number } | null;
  isLocationLoading: boolean;
  showLocationPopup: boolean;
  showCitySelectionModal: boolean;
  requestLocation: () => void;
  dismissLocationPopup: () => void;
  dismissCitySelectionModal: () => void;
  confirmCitySelection: (city: City) => void;
  availableCities: typeof availableCities;
  detectedCity: string | null;
}

const defaultCity: City = {
  name: 'Recife',
  state: 'PE',
  fullName: 'Recife - PE',
  lat: -8.0476,
  lng: -34.877
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);

  if (!context) {
    return {
      selectedCity: defaultCity,
      setSelectedCity: () => {},
      userLocation: null,
      isLocationLoading: false,
      showLocationPopup: false,
      showCitySelectionModal: false,
      requestLocation: () => {},
      dismissLocationPopup: () => {},
      dismissCitySelectionModal: () => {},
      confirmCitySelection: () => {},
      availableCities: [],
      detectedCity: null
    };
  }

  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

const persistCity = (city: City) => {
  localStorage.setItem('selectedCity', JSON.stringify(city));
  localStorage.setItem('detectedCity', city.fullName);
  localStorage.setItem('locationConfirmed', 'true');
};

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<City>(defaultCity);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showCitySelectionModal, setShowCitySelectionModal] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    setDetectedCity(city.fullName);
    persistCity(city);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const radius = 6371;
    const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
  };

  const findNearestCity = (lat: number, lng: number) => {
    let nearestCity = availableCities[0] ?? defaultCity;
    let minDistance = calculateDistance(lat, lng, nearestCity.lat, nearestCity.lng);

    availableCities.forEach((city) => {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });

    return nearestCity;
  };

  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      if (data?.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          data.address.county;
        const state = data.address.state;

        if (city && state) {
          return `${city} - ${state}`;
        }

        if (city) {
          return city;
        }
      }

      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();

      if (ipData.city && ipData.region) {
        return `${ipData.city} - ${ipData.region}`;
      }

      if (ipData.city) {
        return ipData.city;
      }

      return defaultCity.fullName;
    } catch (error) {
      console.log('Erro no geocoding reverso:', error);
      return defaultCity.fullName;
    }
  };

  const dispatchLocationConfirmed = (city: City, latitude?: number, longitude?: number, isManualSelection = false) => {
    window.dispatchEvent(
      new CustomEvent('locationConfirmed', {
        detail: {
          city: city.name,
          state: city.state,
          fullName: city.fullName,
          latitude,
          longitude,
          isManualSelection,
          timestamp: new Date().toISOString()
        }
      })
    );
  };

  const getCurrentLocation = () => {
    setIsLocationLoading(true);

    if (!navigator.geolocation) {
      setIsLocationLoading(false);
      setShowCitySelectionModal(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const cityName = await getCityFromCoordinates(latitude, longitude);
          const city: City = {
            name: cityName.split(' - ')[0] || cityName,
            state: cityName.split(' - ')[1] || '',
            fullName: cityName,
            lat: latitude,
            lng: longitude
          };

          setSelectedCity(city);
          localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lng: longitude }));
          setIsLocationLoading(false);
          setShowLocationPopup(false);
          dispatchLocationConfirmed(city, latitude, longitude, false);
        } catch (error) {
          console.log('Erro ao obter nome da cidade:', error);
          const nearestCity = findNearestCity(latitude, longitude);
          setSelectedCity(nearestCity);
          setIsLocationLoading(false);
          setShowLocationPopup(false);
          dispatchLocationConfirmed(nearestCity, latitude, longitude, false);
        }
      },
      (error) => {
        console.log('Erro ao obter localizacao:', error.message);
        setIsLocationLoading(false);
        setShowLocationPopup(false);
        setShowCitySelectionModal(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const requestLocation = () => {
    getCurrentLocation();
  };

  const dismissLocationPopup = () => {
    setShowLocationPopup(false);
    localStorage.setItem('hasAskedForLocation', 'true');
    setShowCitySelectionModal(true);
  };

  const dismissCitySelectionModal = () => {
    setShowCitySelectionModal(false);
    localStorage.setItem('hasAskedForLocation', 'true');
  };

  const confirmCitySelection = (city: City) => {
    setSelectedCity(city);
    setShowCitySelectionModal(false);
    localStorage.setItem('hasAskedForLocation', 'true');
    localStorage.setItem('citySelectedManually', 'true');
    dispatchLocationConfirmed(city, city.lat, city.lng, true);
  };

  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      const savedCity = localStorage.getItem('selectedCity');
      const savedDetectedCity = localStorage.getItem('detectedCity');

      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
      }

      if (savedCity) {
        setSelectedCityState(JSON.parse(savedCity));
      }

      if (savedDetectedCity) {
        setDetectedCity(savedDetectedCity);
      }
    } catch (error) {
      console.error('Erro ao carregar localizacao salva:', error);
    }
  }, []);

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
    availableCities,
    detectedCity
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
