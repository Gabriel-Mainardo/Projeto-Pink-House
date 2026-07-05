import React from 'react';
import { ArrowLeft, HelpCircle, Star, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  price: string;
  rositas: number;
  bonus?: string;
  pinkPoints: number;
  description: string;
  isRecommended?: boolean;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  isPositive: boolean;
  icon?: string;
}

const PLANS: Plan[] = [
  {
    id: '1',
    name: 'Start',
    price: 'R$ 29,90',
    rositas: 250,
    pinkPoints: 500,
    description: 'Ideal para começar a usar o sistema: subidas básicas e primeiras interações.',
    isRecommended: false
  },
  {
    id: '2',
    name: 'Essencial',
    price: 'R$ 59,90',
    rositas: 600,
    bonus: '+100 Rositas de bônus',
    pinkPoints: 1200,
    description: 'Destaque moderado: mais visibilidade e recursos para crescer no ranking.',
    isRecommended: true
  },
  {
    id: '3',
    name: 'Top',
    price: 'R$ 99,90',
    rositas: 1200,
    bonus: '+300 Rositas de bônus',
    pinkPoints: 2400,
    description: 'Pacote preferido: equilíbrio entre custo e exposição, com bônus generoso.',
    isRecommended: false
  },
  {
    id: '4',
    name: 'Premium',
    price: 'R$ 199,90',
    rositas: 3000,
    bonus: '+1.000 Rositas de bônus',
    pinkPoints: 6000,
    description: 'Máximo destaque: subidas frequentes, stories ilimitados e prioridade total.',
    isRecommended: false
  },
  {
    id: '5',
    name: 'Black',
    price: 'R$ 499,90',
    rositas: 10000,
    bonus: '+5.000 Rositas de bônus',
    pinkPoints: 20000,
    description: 'O topo é seu lugar: máximo destaque, visibilidade total e status de elite dentro da Faixa Rosa.',
    isRecommended: false
  }
];

const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    description: 'Compra de Rositas',
    amount: 250,
    date: '15 de julho, 2024',
    isPositive: true
  },
  {
    id: '2',
    description: 'Presente para Sofia',
    amount: 50,
    date: '14 de julho, 2024',
    isPositive: false,
    icon: '🍓'
  }
];

const MinhasRositas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <h1
            className="text-lg text-gray-800"
            style={{
              }}
          >
            Minhas Rositas
          </h1>

          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Hero Section */}
        <div className="bg-pink-50 rounded-lg p-8 mb-10 flex flex-col justify-center">
          <p
            className="text-gray-500 text-sm mb-1"
            style={{
              }}
          >
            Seu Saldo Atual
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl select-none" role="img" aria-label="rose">🌹</span>
            <span
              className="text-4xl md:text-5xl text-gray-900"
              style={{
                }}
            >
              1.250 Rositas
            </span>
          </div>
          <div className="flex items-center gap-1 mt-3 ml-12 md:ml-14">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span
              className="text-gray-500 text-sm"
              style={{
                }}
            >
              3.480 PinkPoints
            </span>
          </div>
        </div>

        {/* Pricing Section */}
        <section className="mb-12">
          <h2
            className="text-2xl text-gray-900 mb-6"
            style={{
              }}
          >
            Comprar mais Rositas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative flex flex-col p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200
                  ${plan.isRecommended ? 'border-2 border-[#d91d83] shadow-lg scale-[1.01]' : 'border border-transparent'}
                `}
              >
                {/* Recommended Badge */}
                {plan.isRecommended && (
                  <div
                    className="absolute -top-3.5 right-0 bg-[#d91d83] text-white text-xs px-3 py-1 rounded-l-lg rounded-tr-lg shadow-sm"
                    style={{
                      }}
                  >
                    Recomendado
                  </div>
                )}

                {/* Header */}
                <div className="mb-1">
                  <span
                    className="text-gray-500 text-xs tracking-wider uppercase"
                    style={{
                      }}
                  >
                    {plan.name} — {plan.price}
                  </span>
                </div>

                {/* Rositas Amount */}
                <h3
                  className="text-3xl text-[#d91d83] mb-1"
                  style={{
                    }}
                >
                  {plan.rositas} Rositas
                </h3>

                {/* Bonus (if exists) */}
                <div className="min-h-[24px]">
                  {plan.bonus && (
                    <span
                      className="text-green-600 text-sm block mb-1"
                      style={{
                        }}
                    >
                      {plan.bonus}
                    </span>
                  )}
                </div>

                {/* PinkPoints */}
                <div className="flex items-center gap-1 mb-4 mt-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span
                    className="text-gray-500 text-xs"
                    style={{
                      }}
                  >
                    Ganha {plan.pinkPoints} PinkPoints
                  </span>
                </div>

                {/* Description */}
                <p
                  className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow"
                  style={{
                    }}
                >
                  {plan.description}
                </p>

                {/* Button */}
                <button
                  className={`
                    w-full py-3 rounded-full text-sm transition-colors mt-auto
                    ${plan.isRecommended
                      ? 'bg-[#d91d83] text-white hover:bg-[#d91d83]'
                      : 'bg-slate-800 text-white hover:bg-slate-700'}
                  `}
                  style={{
                    }}
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>

          {/* Secure Payment Footer */}
          <div className="flex items-center justify-center gap-2 mt-8 text-gray-500 text-sm">
            <Lock className="w-4 h-4" />
            <span
              style={{
                }}
            >
              Pagamento Seguro
            </span>
          </div>
        </section>

        {/* Transaction History Section */}
        <section>
          <div className="space-y-4">
            <h2
              className="text-2xl text-gray-900 mb-6"
              style={{
                }}
            >
              Histórico de Transações
            </h2>

            <div className="flex flex-col gap-3">
              {TRANSACTIONS.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-1 text-gray-800">
                    <span
                      style={{
                        }}
                    >
                      {transaction.description}
                    </span>
                    {transaction.isPositive ? (
                      <span
                        className="text-green-600 ml-1"
                        style={{
                          }}
                      >
                        – +{transaction.amount}
                      </span>
                    ) : (
                      <span
                        className="text-red-500 ml-1"
                        style={{
                          }}
                      >
                        – -{transaction.amount} {transaction.icon}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm text-gray-500"
                    style={{
                      }}
                  >
                    {transaction.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MinhasRositas;
