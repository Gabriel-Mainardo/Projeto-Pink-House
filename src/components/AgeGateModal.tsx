import React from 'react';

interface AgeGateModalProps {
  onConfirm: () => void;
  onDeny: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirm, onDeny }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-[500px] w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">

        {/* Title */}
        <h1 className="text-[2rem] leading-tight text-gray-900 mb-3 tracking-tight" style={{ }}>
          Confirme sua Idade
        </h1>

        {/* Subtitle */}
        <p className="text-[#666666] text-[0.95rem] leading-normal mb-8 max-w-[85%]" style={{ }}>
          Para acessar, precisamos confirmar que você tem 18 anos ou mais.
        </p>

        {/* Warning Label */}
        <div className="mb-4 mt-2">
          <span className="text-[#d91d83] text-[0.85rem] tracking-[0.15em] uppercase" style={{ }}>
            Conteúdo Adulto
          </span>
        </div>

        {/* Description Text */}
        <p className="text-[0.8rem] leading-relaxed text-[#888888] mb-10 max-w-[92%]" style={{ }}>
          O Faixa Rosa apresenta conteúdo explícito destinado a adultos. Utilizamos cookies em conformidade com a LGPD para melhorar a sua experiência e garantir a sua segurança.
        </p>

        {/* Buttons */}
        <div className="flex flex-row gap-4 w-full justify-center items-stretch">
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#d91d83] hover:bg-[#C4006B] text-white text-[0.9rem] py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            style={{ }}
          >
            Concordo
          </button>

          <button
            onClick={onDeny}
            className="flex-1 bg-[#F3F4F6] hover:bg-gray-200 text-gray-700 text-[0.85rem] leading-tight py-3 px-4 rounded-full transition-colors duration-200 flex items-center justify-center"
            style={{ }}
          >
            Não sou maior de idade
          </button>
        </div>
      </div>
    </div>
  );
};
