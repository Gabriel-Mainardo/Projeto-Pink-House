import React from 'react';
import { X, Video } from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({ isOpen, onClose, onStart }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity pointer-events-none"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-[28px] w-full max-w-[330px] px-6 pt-8 pb-6 flex flex-col items-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Top Label */}
        <h2 className="text-[#111827] font-bold text-[17px] mb-6 mt-1 tracking-tight" style={{ }}>
          Etapa Ativada
        </h2>

        {/* Icon Circle */}
        <div className="w-[88px] h-[88px] bg-[#FFF0F5] rounded-full flex items-center justify-center mb-6">
          <Video className="text-[#FF4081]" size={40} strokeWidth={2} />
        </div>

        {/* Heading */}
        <h1 className="text-[#111827] font-bold text-[20px] leading-tight text-center mb-3 tracking-tight px-2" style={{ }}>
          Iniciar videochamada de 1 min
        </h1>

        {/* Subtext */}
        <p className="text-[#6B7280] text-[15px] text-center leading-relaxed px-4 mb-8" style={{ }}>
          Aguardando seu cliente para iniciar a chamada.
        </p>

        {/* Primary Action Button */}
        <button
          onClick={onStart}
          className="w-full bg-[#FF4081] hover:bg-[#F50057] active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-xl text-[16px] shadow-[0_4px_12px_rgba(255,64,129,0.25)] mb-3"
          style={{ }}
        >
          Iniciar Videochamada
        </button>

        {/* Secondary Action Button */}
        <button
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#374151] font-medium text-[15px] py-2 transition-colors"
          style={{ }}
        >
          Cancelar
        </button>

      </div>
    </div>
  );
};
