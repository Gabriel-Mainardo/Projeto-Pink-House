import React from 'react';
import { Zap } from 'lucide-react';

interface BoostButtonProps {
  onClick: () => void;
}

export const BoostButton: React.FC<BoostButtonProps> = ({ onClick }) => {
  return (
    <div className="relative w-1/5 flex justify-center z-50">
      <button
        onClick={onClick}
        className="absolute -top-12 w-[72px] h-[72px] flex flex-col items-center justify-center rounded-full shadow-2xl transition-transform active:scale-95 group"
        style={{
          background: 'linear-gradient(180deg, #F44E8C 0%, #D81B60 100%)',
          boxShadow: '0 8px 25px rgba(233, 30, 99, 0.35)'
        }}
      >
        <Zap size={30} className="text-white fill-white mb-0.5 group-hover:scale-110 transition-transform" strokeWidth={0} />
        <span className="text-[10px] font-bold text-white leading-none tracking-wide">subidas</span>
      </button>
    </div>
  );
};
