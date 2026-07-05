import React from 'react';
import { X } from 'lucide-react';
import PinkPointsWalletCard from './pinkpoints/PinkPointsWalletCard';
import PinkPointsHistoryList from './pinkpoints/PinkPointsHistoryList';
import { HISTORY_DATA } from '../constants/pinkpoints';

interface PinkPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinkPointsModal: React.FC<PinkPointsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const rosaCarteira = "#d91d83";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#FAFAFA] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* Header com botão fechar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PinkPoints</h1>
            <p className="text-gray-500 text-sm">Programa de recompensas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-8">
          {/* Balance Card */}
          <PinkPointsWalletCard />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="h-14 text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center text-base"
              style={{ backgroundColor: rosaCarteira }}
            >
              Converter PinkPoints em Rositas
            </button>

            <button
              className="h-14 bg-white font-semibold rounded-lg border-2 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center text-base"
              style={{
                borderColor: rosaCarteira,
                color: rosaCarteira
              }}
            >
              Ganhar mais PinkPoints
            </button>
          </div>

          {/* History Section */}
          <PinkPointsHistoryList items={HISTORY_DATA} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white py-6 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Faixa Rosa. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-[#d91d83] text-sm transition-colors">Termos de Serviço</a>
              <a href="#" className="text-gray-500 hover:text-[#d91d83] text-sm transition-colors">Política de Privacidade</a>
              <a href="#" className="text-gray-500 hover:text-[#d91d83] text-sm transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinkPointsModal;
