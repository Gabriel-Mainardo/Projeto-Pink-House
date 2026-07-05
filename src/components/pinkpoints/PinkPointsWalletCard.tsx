import React from 'react';

const PinkPointsWalletCard: React.FC = () => {
  const currentPoints = 3480;
  const goalPoints = 4000;
  const missingPoints = 520;
  const progressPercentage = (currentPoints / goalPoints) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-500">Saldo PinkPoints</p>

        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl sm:text-5xl font-bold" style={{ color: '#d91d83' }}>
            {currentPoints.toLocaleString('pt-BR')}
          </h2>
          <span className="text-2xl sm:text-3xl font-bold text-gray-800">PinkPoints</span>
        </div>

        <p className="text-sm text-gray-500">
          Faltam <span className="font-semibold text-gray-700">{missingPoints}</span> pontos para liberar R$10 de cashback
        </p>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-pink-100 rounded-full overflow-hidden mt-4">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: '#d91d83'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PinkPointsWalletCard;
