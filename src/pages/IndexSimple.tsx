import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { useLocation } from '../contexts/LocationContextSimple';

const IndexSimple = () => {
  const { selectedCity } = useLocation();
  const [loading, setLoading] = useState(true);
  const [companions, setCompanions] = useState([
    {
      id: 'demo-1',
      name: 'Ana Silva',
      age: 25,
      location: 'Recife - PE',
      image: 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Ana+Silva',
      rating: 4.8,
      tags: ['Elegante', 'Companhia'],
      description: 'Companhia elegante e discreta para momentos especiais.',
      pricePerHour: 'R$ 300'
    },
    {
      id: 'demo-2',
      name: 'Maria Santos',
      age: 28,
      location: 'Recife - PE',
      image: 'https://via.placeholder.com/300x400/FFB6C1/FFFFFF?text=Maria+Santos',
      rating: 4.9,
      tags: ['Carinhosa', 'Atenciosa'],
      description: 'Companhia carinhosa e atenciosa para todos os momentos.',
      pricePerHour: 'R$ 250'
    }
  ]);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mb-4 relative animate-bounce">
            <img 
              src="https://i.imgur.com/Cix818V.png" 
              alt="Faixa Rosa Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,192,203,0.5)]"
            />
          </div>
          <div className="text-2xl font-bold text-gray-800">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-50 min-h-screen py-8">
        <div className="w-full max-w-7xl mx-auto px-4">
          
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Descubra as mulheres mais quentes em <span className="text-pink-600">{selectedCity.name}</span>
            </h1>
            <p className="text-gray-600">
              {companions.length} acompanhantes disponíveis
            </p>
          </div>

          {/* Cards de Acompanhantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {companions.map((companion) => (
              <div key={companion.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={companion.image} 
                    alt={companion.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ {companion.rating}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{companion.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{companion.age} anos • {companion.location}</p>
                  <p className="text-gray-700 text-sm mb-3">{companion.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {companion.tags.map((tag, index) => (
                      <span key={index} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-pink-600">{companion.pricePerHour}</span>
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Ver Catálogo */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-pink-600 to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-700 hover:to-pink-800 transition-all transform hover:scale-105 shadow-lg">
              Ver Catálogo Completo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndexSimple;



