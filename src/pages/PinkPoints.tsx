import React from 'react';
import { ArrowLeft, CreditCard, MessageSquare, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HISTORY_DATA } from '../constants/pinkpoints';
import { HistoryItem } from '../types/pinkpoints';

const PinkPoints = () => {
  const navigate = useNavigate();
  const rosaCarteira = "#d91d83";

  const currentPoints = 3480;
  const goalPoints = 4000;
  const missingPoints = 520;
  const progressPercentage = (currentPoints / goalPoints) * 100;

  const getIcon = (type: HistoryItem['type']) => {
    const iconColor = rosaCarteira;
    switch (type) {
      case 'recharge':
        return <CreditCard className="w-5 h-5" style={{ color: iconColor }} />;
      case 'chat':
        return <MessageSquare className="w-5 h-5" style={{ color: iconColor }} />;
      case 'gift':
        return <Gift className="w-5 h-5" style={{ color: iconColor }} />;
      default:
        return <CreditCard className="w-5 h-5" style={{ color: iconColor }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1
              className="text-3xl text-gray-900"
              style={{
                }}
            >
              Carteira
            </h1>
          </div>
          <p
            className="text-gray-500 ml-14"
            style={{
              }}
          >
            PinkPoints - programa de recompensas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Balance Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="space-y-4">
            <p
              className="text-sm text-gray-500"
              style={{
                }}
            >
              Saldo PinkPoints
            </p>

            <div className="flex items-baseline gap-2">
              <h2
                className="text-4xl sm:text-5xl"
                style={{
                  color: rosaCarteira,
                  }}
              >
                {currentPoints.toLocaleString('pt-BR')}
              </h2>
              <span
                className="text-2xl sm:text-3xl text-gray-800"
                style={{
                  }}
              >
                PinkPoints
              </span>
            </div>

            <p
              className="text-sm text-gray-500"
              style={{
                }}
            >
              Faltam <span className="font-semibold text-gray-700">{missingPoints}</span> pontos para liberar R$10 de cashback
            </p>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-pink-100 rounded-full overflow-hidden mt-4">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: rosaCarteira
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => navigate('/converter-pinkpoints')}
            className="h-14 text-white rounded-lg shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center text-base"
            style={{
              backgroundColor: rosaCarteira,
              }}
          >
            Converter PinkPoints em Rositas
          </button>

          <button
            onClick={() => navigate('/ganhar-pinkpoints')}
            className="h-14 bg-white rounded-lg border-2 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center text-base"
            style={{
              borderColor: rosaCarteira,
              color: rosaCarteira,
              }}
          >
            Ganhar mais PinkPoints
          </button>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <h3
            className="text-xl text-gray-800 mb-6"
            style={{
              }}
          >
            Histórico de Pontos
          </h3>

          <div className="space-y-4">
            {HISTORY_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    {getIcon(item.type)}
                  </div>

                  {/* Text Info */}
                  <div>
                    <p
                      className="text-gray-800 text-sm sm:text-base"
                      style={{
                        }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-gray-500 text-sm"
                      style={{
                        }}
                    >
                      +{item.points} PinkPoints
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div
                  className="text-gray-400 text-xs sm:text-sm"
                  style={{
                    }}
                >
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p
            className="text-gray-500 text-sm"
            style={{
              }}
          >
            © 2024 Faixa Rosa. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-500 hover:text-[#d91d83] text-sm transition-colors"
              style={{
                }}
            >
              Termos de Serviço
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#d91d83] text-sm transition-colors"
              style={{
                }}
            >
              Política de Privacidade
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-[#d91d83] text-sm transition-colors"
              style={{
                }}
            >
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PinkPoints;
