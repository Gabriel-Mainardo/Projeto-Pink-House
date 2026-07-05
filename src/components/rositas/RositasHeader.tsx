import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';

interface RositasHeaderProps {
  onClose?: () => void;
}

export const RositasHeader: React.FC<RositasHeaderProps> = ({ onClose }) => {
  return (
    <header className="flex items-center justify-between py-2">
      <button
        onClick={onClose}
        className="p-1 -ml-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-[16px] text-gray-900" style={{ }}>
        Minhas Rositas
      </h1>
      <button className="p-1 -mr-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700">
        <HelpCircle className="w-6 h-6" />
      </button>
    </header>
  );
};
