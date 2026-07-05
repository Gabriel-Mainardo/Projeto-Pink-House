import React from 'react';
import { Star } from 'lucide-react';

export const RositasBalanceCard: React.FC = () => {
  return (
    <div className="bg-[#FFF0F5] rounded-[24px] p-5 shadow-sm border border-pink-50">
      <p className="text-[11px] text-gray-500 mb-0.5" style={{ }}>
        Seu Saldo Atual
      </p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🌹</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] text-[#F54180]" style={{ }}>
            1.250
          </span>
          <span className="text-[32px] text-black" style={{ }}>
            Rositas
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-gray-500 text-xs pl-1">
        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        <span className="text-gray-500" style={{ }}>3.480 PinkPoints</span>
      </div>
    </div>
  );
};
