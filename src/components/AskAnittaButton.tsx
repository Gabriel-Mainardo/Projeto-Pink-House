import React from 'react';
import { Send } from 'lucide-react';

interface AskAnittaButtonProps {
  onClick: () => void;
}

export const AskAnittaButton: React.FC<AskAnittaButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-24 right-4 md:right-8 z-50 flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
      aria-label="Pergunte à Anitta"
    >
      <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
        <Send className="w-4 h-4 text-white transform rotate-[45deg] group-hover:rotate-[50deg] transition-transform" strokeWidth={2.5} />
      </div>
      <span className="font-bold text-xs tracking-wide uppercase">
        Pergunte à Anitta
      </span>
    </button>
  );
};
