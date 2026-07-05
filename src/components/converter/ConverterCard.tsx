import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import InfoCard from './InfoCard';
import { useNavigate } from 'react-router-dom';

const ConverterCard: React.FC = () => {
  const navigate = useNavigate();
  const [balance] = useState(15000);
  const [conversionRate] = useState(100);
  const [inputValue, setInputValue] = useState<number>(5000);

  // Calculate maximum potential Rositas from total balance
  const totalRositasAvailable = Math.floor(balance / conversionRate);

  // Calculate resulting Rositas based on current input
  const rositasResult = Math.floor(inputValue / conversionRate);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val > balance) val = balance;
    if (val < 0) val = 0;
    setInputValue(val);
  };

  // Calculate percentage for slider background gradient
  const progressPercent = (inputValue / balance) * 100;

  return (
    <div className="bg-gray-100 md:bg-white md:rounded-[2.5rem] md:shadow-xl w-full md:max-w-[600px] md:mx-auto min-h-screen md:min-h-0 flex flex-col font-sans relative">

      {/* Mobile Header - só aparece no mobile */}
      <header className="md:hidden px-4 py-4 flex items-center justify-between sticky top-0 bg-gray-100 z-10 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1
          className="text-lg text-gray-800 absolute left-1/2 transform -translate-x-1/2"
          style={{
            }}
        >
          Converter
        </h1>
        <div className="w-6" />
      </header>

      {/* Content */}
      <div className="flex-1 p-5 md:p-8 flex flex-col gap-4 md:gap-6">

      {/* Title */}
      <h2
        className="text-2xl md:text-2xl text-left md:text-center text-gray-800 md:text-gray-900 leading-tight"
        style={{
          }}
      >
        Converter PinkPoints em Rositas
      </h2>

      {/* Info Cards */}
      <div className="flex flex-col gap-4">
        <InfoCard label="Saldo Atual de PinkPoints" value={balance.toLocaleString('pt-BR')} />
        <InfoCard label="Rositas Disponíveis para Conversão" value={totalRositasAvailable.toString()} />
      </div>

      {/* Input Section */}
      <div>
        <label
          className="block text-gray-700 mb-3 text-sm"
          style={{
            }}
        >
          Quantos PinkPoints você quer converter?
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full border border-pink-200 md:border-gray-300 rounded-xl md:rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-lg"
          style={{
            }}
          placeholder="0"
        />
      </div>

      {/* Slider Section */}
      <div>
        <div className="relative w-full h-8 flex items-center mb-1">
          <input
            type="range"
            min="0"
            max={balance}
            value={inputValue}
            onChange={handleSliderChange}
            className="w-full appearance-none h-1.5 md:h-2 rounded-full focus:outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ff4081 0%, #ff4081 ${progressPercent}%, #e5e7eb ${progressPercent}%, #e5e7eb 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-gray-500 text-xs md:text-sm">
          <span
            style={{
              }}
          >
            0
          </span>
          <span
            style={{
              }}
          >
            {balance.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Result Pill */}
      <div className="bg-pink-50 rounded-full md:rounded-2xl py-4 px-6 text-center border border-pink-100 md:border-none">
        <span
          className="text-pink-600 text-base md:text-lg"
          style={{
            }}
        >
          Número de Rositas a Receber: <span className="text-pink-700 md:text-xl">{rositasResult}</span>
        </span>
      </div>

      {/* Action Button - Mobile: só botão confirmar, Desktop: cancelar e confirmar */}
      <div className="md:flex md:items-center md:justify-between md:gap-4">
        <button
          onClick={() => navigate(-1)}
          className="hidden md:block text-pink-700 text-base px-6 py-3 rounded-full hover:bg-pink-50 transition-colors"
          style={{
            }}
        >
          Cancelar
        </button>
        <button
          className="w-full md:flex-1 bg-[#ff4081] hover:bg-[#d91d83] text-white text-base px-6 py-4 rounded-2xl md:rounded-full shadow-lg shadow-pink-200 md:shadow-xl transition-all active:scale-[0.98] md:hover:-translate-y-0.5 duration-200"
          style={{
            }}
        >
          Confirmar Conversão em Rositas
        </button>
      </div>

      {/* Footer Note */}
      <p
        className="text-center text-gray-400 text-xs leading-relaxed max-w-sm mx-auto"
        style={{
          }}
      >
        A taxa de conversão é de {conversionRate} PinkPoints para 1 Rosita. As Rositas serão creditadas instantaneamente em sua carteira.
      </p>
      </div>
    </div>
  );
};

export default ConverterCard;
