import React from 'react';
import { Star } from 'lucide-react';
import { Product } from '../../types/rositas';

interface RositasProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
}

export const RositasProductCard: React.FC<RositasProductCardProps> = ({ product, onBuy }) => {
  const {
    tierName,
    price,
    rositasAmount,
    pinkPoints,
    description,
    bonusText,
    isRecommended,
    highlightColor
  } = product;

  return (
    <div className={`relative bg-white rounded-[20px] p-5 shadow-sm border ${highlightColor ? 'border-pink-200 ring-1 ring-pink-100' : 'border-white'} flex flex-col`}>
      {isRecommended && (
        <div className="absolute -top-3 right-6 bg-[#F8BBD0] text-[#C2185B] text-[10px] px-3 py-1 rounded-[8px]" style={{ }}>
          RECOMENDADO
        </div>
      )}

      {/* Header: Name and Price */}
      <div className="mb-0.5">
        <span className="text-[11px] text-gray-900 uppercase tracking-tight" style={{ }}>
          {tierName} – {price}
        </span>
      </div>

      {/* Main Rositas Amount */}
      <div className="mb-0.5">
        <h2 className="text-[28px] text-[#F54180] tracking-tight" style={{ }}>
          {rositasAmount} Rositas
        </h2>
      </div>

      {/* Bonus Text */}
      {bonusText && (
        <div className="mb-1">
          <span className="text-[11px] text-[#F887B0]" style={{ }}>{bonusText}</span>
        </div>
      )}

      {/* PinkPoints */}
      <div className={`flex items-center gap-1 ${bonusText ? 'mb-2' : 'mb-3'}`}>
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <div className="text-[11px]" style={{ }}>
          <span className="text-[#F54180]">Ganha </span>
          <span className="text-[#F54180]">{pinkPoints} </span>
          <span className="text-gray-500">PinkPoints</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-gray-500 leading-relaxed mb-5 pr-2" style={{ }}>
        {description}
      </p>

      {/* Button */}
      <button
        onClick={() => onBuy?.(product)}
        className={`w-full py-3 rounded-[14px] text-[13px] text-white transition-transform active:scale-95 shadow-sm ${
          highlightColor ? 'bg-[#FF4081] hover:bg-pink-600' : 'bg-[#1F1F1F] hover:bg-black'
        }`}
        style={{ }}
      >
        Comprar
      </button>
    </div>
  );
};
