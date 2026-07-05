import React from 'react';
import { MapPin, X, Navigation, Shield } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const LocationPopup: React.FC = () => {
  const { showLocationPopup, requestLocation, dismissLocationPopup, isLocationLoading } = useLocation();

  if (!showLocationPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in" style={{ }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-velvet-pink-600 to-velvet-pink-500 p-6 text-white relative">
          <button
            onClick={dismissLocationPopup}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Encontrar acompanhantes próximas</h3>
              <p className="text-white/90 text-sm">Descubra perfis na sua região</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-velvet-pink-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-velvet-pink-600" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Permitir acesso à localização?
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vamos detectar sua cidade automaticamente para mostrar 
                acompanhantes da sua região. Sua localização é privada e segura.
              </p>
            </div>
          </div>

          {/* Benefícios */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Perfis da sua região aparecem primeiro</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Resultados mais relevantes para você</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Shield className="w-4 h-4 text-gray-500" />
              <span>Sua privacidade está protegida</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <button
              onClick={requestLocation}
              disabled={isLocationLoading}
              className="w-full bg-gradient-to-r from-velvet-pink-600 to-velvet-pink-500 hover:from-velvet-pink-700 hover:to-velvet-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLocationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Detectando sua cidade...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Detectar minha cidade</span>
                </>
              )}
            </button>
            
            <button
              onClick={dismissLocationPopup}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300"
            >
              Escolher cidade manualmente
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Você pode alterar sua cidade manualmente a qualquer momento usando o seletor no topo da página.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPopup; 