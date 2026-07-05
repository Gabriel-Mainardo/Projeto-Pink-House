import React from 'react';
import { BadgeCheck, Play, Smartphone, CreditCard, DollarSign, Gift } from 'lucide-react';

interface MainContentProps {
  name: string;
  verified: boolean;
  active: boolean;
  location: string;
  age: number;
  height: string;
  weight: string;
  price: number;
  time: string;
  preference: string;
  about: string;
  stories: Array<{ id: number; image: string; viewed: boolean }>;
  photos: Array<{ id: number; url: string }>;
  videos: Array<{ id: number; url: string; thumbnail?: string; tag?: string }>;
  services: Array<{ id: number; label: string }>;
}

export const MainContent: React.FC<MainContentProps> = ({
  name,
  verified,
  active,
  location,
  age,
  height,
  weight,
  price,
  time,
  preference,
  about,
  stories,
  photos,
  videos,
  services
}) => {
  return (
    <div className="flex flex-col gap-8">

      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl text-gray-900" style={{ }}>{name}</h1>
          {active && (
            <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>
          )}
          {verified && (
            <BadgeCheck className="w-8 h-8 text-pink-600" fill="currentColor" />
          )}
        </div>
        <p className="text-gray-500 text-sm" style={{ }}>{age} anos, {location}</p>
      </div>

      {/* Trust Bar & Gift Button */}
      <div className="bg-gray-100 rounded-3xl p-6 shadow-sm -mt-4">
        <div className="mb-2">
          <span className="text-gray-900" style={{ }}>Confiança máxima</span>
        </div>
        <div className="w-full bg-white rounded-full h-2.5 mb-2">
          <div className="bg-pink-600 h-2.5 rounded-full w-full shadow-[0_0_10px_rgba(230,0,126,0.5)]"></div>
        </div>
        <p className="text-xs text-gray-500 mb-4" style={{ }}>Esse perfil cumpriu todas etapas de verificação</p>

        <button className="w-full bg-pink-600 text-white py-3 px-6 rounded-full hover:bg-pink-700 transition-colors flex items-center justify-center gap-2" style={{ }}>
          <Gift size={18} />
          Enviar Presente
        </button>
      </div>

      {/* Stories */}
      {stories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-900" style={{ }}>Stories</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0 cursor-pointer">
                <div className={`p-[2px] rounded-full border-2 ${story.viewed ? 'border-gray-200' : 'border-pink-600'}`}>
                  <img
                    src={story.image}
                    alt="Story"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      <div className="space-y-3">
        <h3 className="text-xl text-gray-900" style={{ }}>Sobre mim</h3>
        <div className="bg-transparent text-gray-600 leading-relaxed text-sm md:text-base" style={{ }}>
          {about} <span className="text-pink-600 cursor-pointer hover:underline" style={{ }}>Ver mais</span>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-900" style={{ }}>Fotos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-900" style={{ }}>Vídeos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="relative rounded-2xl overflow-hidden aspect-video bg-black group cursor-pointer">
                <img
                  src={video.thumbnail || video.url}
                  alt="Video"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                {video.tag && (
                  <span className="absolute top-4 left-4 bg-pink-600 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wider" style={{ }}>
                    {video.tag}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-900" style={{ }}>Serviços Oferecidos</h3>
          <div className="flex flex-wrap gap-3">
            {services.map((service) => (
              <span
                key={service.id}
                className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm hover:bg-pink-200 transition-colors cursor-default"
                style={{ }}
              >
                {service.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-xl text-gray-900" style={{ }}>Formas de Pagamento</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-600">
              <Smartphone size={20} />
            </div>
            <span className="text-xs text-gray-500" style={{ }}>Pix</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-600">
              <DollarSign size={20} />
            </div>
            <span className="text-xs text-gray-500" style={{ }}>Dinheiro</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-600">
              <CreditCard size={20} />
            </div>
            <span className="text-xs text-gray-500" style={{ }}>Cartão</span>
          </div>
        </div>
      </div>
    </div>
  );
};
