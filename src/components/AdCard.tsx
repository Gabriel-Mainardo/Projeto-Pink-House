import React, { useEffect } from 'react';
import { ExternalLink, Star, Zap } from 'lucide-react';

interface AdCardProps {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaUrl: string;
  isSponsored?: boolean;
  fullWidth?: boolean;
  onView?: (id: string) => void;
  onClick?: (id: string) => void;
}

const AdCard: React.FC<AdCardProps> = ({ 
  id,
  title, 
  description, 
  imageUrl, 
  ctaText, 
  ctaUrl, 
  isSponsored = true,
  fullWidth = false,
  onView,
  onClick
}) => {
  const handleClick = () => {
    if (id && onClick) {
      onClick(id);
    }
    window.open(ctaUrl, '_blank', 'noopener,noreferrer');
  };

  // Tracking de visualização quando o componente monta
  useEffect(() => {
    if (id && onView) {
      onView(id);
    }
  }, [id, onView]);

  // Função para detectar se é mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Função para detectar se é GIF
  const isGif = (url?: string) => {
    return url?.toLowerCase().includes('.gif') || false;
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg w-full"
      onClick={handleClick}
      style={{ 
        height: fullWidth ? (isMobile() ? '200px' : '120px') : '100px', 
        boxShadow: '0 4px 15px -3px rgba(147, 51, 234, 0.25)' 
      }}
    >
      {/* Badge de anúncio */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-purple-600/90 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
          <Zap className="w-3 h-3 mr-1" />
          <span>Ad</span>
        </div>
      </div>

      {/* Imagem ocupando todo o espaço */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <Star className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        )}
        
        {/* Indicador GIF */}
        {isGif(imageUrl) && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold">
            GIF
          </div>
        )}
      </div>
    </div>
  );
};

export default AdCard; 