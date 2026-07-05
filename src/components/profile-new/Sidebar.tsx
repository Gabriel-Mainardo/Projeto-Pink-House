import React from 'react';
import { Heart } from 'lucide-react';

interface SidebarProps {
  name: string;
  imageUrl: string;
  location: string;
  height: string;
  weight: string;
  price: number;
  time: string;
  preference: string;
  smoker: boolean;
  phone?: string;
  onWhatsAppClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  name,
  imageUrl,
  location,
  height,
  weight,
  price,
  time,
  preference,
  smoker,
  onWhatsAppClick
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile Image Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm bg-white group max-h-96">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-96 object-cover"
        />
        <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-pink-600 hover:scale-110 transition-transform">
          <Heart size={20} fill="currentColor" />
        </button>
      </div>

      {/* Details List */}
      <div className="bg-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg mb-4 text-gray-900" style={{ }}>Detalhes</h3>

        <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Localização</p>
            <p className="text-gray-900" style={{ }}>{location}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Detalhes Físicos</p>
            <p className="text-gray-900" style={{ }}>{height}, {weight}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Cachê mínimo</p>
            <p className="text-gray-900" style={{ }}>R$ {price}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Tempo de atendimento</p>
            <p className="text-gray-900" style={{ }}>A partir de {time}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Atende</p>
            <p className="text-gray-900" style={{ }}>{preference}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Preferências</p>
            <p className="text-gray-900" style={{ }}>{smoker ? 'Fumantes' : 'Não fumantes'}</p>
          </div>
        </div>
      </div>

      {/* Price / Action Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500" style={{ }}>A partir de</span>
        </div>
        <div className="flex justify-between items-end mb-6">
          <span className="text-3xl text-gray-900" style={{ }}>R$ {price}</span>
        </div>
        <button
          onClick={onWhatsAppClick}
          className="w-full bg-pink-600 text-white py-3 px-6 rounded-full hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
          style={{ }}
        >
          Enviar mensagem
        </button>
      </div>
    </div>
  );
};
