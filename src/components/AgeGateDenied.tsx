import React from 'react';

interface AgeGateDeniedProps {
  onBack: () => void;
}

export const AgeGateDenied: React.FC<AgeGateDeniedProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: '#79686C' }}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <h1 className="text-2xl text-gray-900 mb-4" style={{ }}>
          Acesso Negado
        </h1>
        <p className="text-gray-600 mb-6" style={{ }}>
          Você precisa ter 18 anos ou mais para acessar este conteúdo.
        </p>
        <button
          onClick={onBack}
          className="text-[#d91d83] hover:underline"
          style={{ }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
