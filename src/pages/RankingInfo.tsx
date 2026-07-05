import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// --- Stats Bar Component ---
const StatsBar: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between max-w-[96%] mx-auto">
      <div className="flex flex-col mb-4 md:mb-0">
        <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">PinkUps atuais</span>
        <span className="text-4xl font-black text-gray-900 leading-none">1.380</span>
      </div>

      <button className="bg-[#d91d83] hover:bg-[#d91d83] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center">
        Ver ranking da cidade
      </button>
    </div>
  );
};

// --- Ranking Banner Component ---
const RankingBanner: React.FC = () => {
  return (
    <div className="bg-[#fce4ec] rounded-2xl p-8 md:p-12 border border-pink-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-pink-600 p-1.5 rounded-lg text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.293 3.293a1 1 0 01-1.414 0l-3.293-3.293a1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm0 5a1 1 0 000 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-[#1a1a1a] font-bold text-lg">Ranking da Cidade</span>
      </div>

      <h2 className="text-3xl md:text-5xl font-black text-[#d91d83] mb-4 tracking-tight">
        Parabéns — você é Nº 3 de São Paulo!
      </h2>

      <p className="text-gray-700 text-lg mb-8 font-medium">
        Você acumulou 1.380 PinkUps. Continue ativa para manter e aumentar sua posição.
      </p>

      <div className="max-w-md">
        <p className="text-sm font-bold text-gray-800 mb-2">Faltam 220 PinkUps para alcançar o próximo nível.</p>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-pink-100">
          <div className="bg-pink-600 h-full" style={{ width: '86%' }}></div>
        </div>
      </div>
    </div>
  );
};

// --- Info Card Component ---
interface CardProps {
  title: string;
  items: string[];
}

const Card: React.FC<CardProps> = ({ title, items }) => (
  <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
    <h3 className="text-xl font-bold mb-6 text-gray-900">{title}</h3>
    <ul className="space-y-4 flex-grow">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start">
          <span className="text-pink-500 mr-3 text-lg">•</span>
          <span className="text-gray-600 text-[15px] leading-relaxed font-medium">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// --- Info Grid Component ---
const InfoGrid: React.FC = () => {
  const sections = [
    {
      title: "Atividade diária",
      items: [
        "Logar todos os dias",
        "Atualizar fotos e descrição",
        "Atualizar a mídia de comparação todo mês"
      ]
    },
    {
      title: "Conteúdo e presença",
      items: [
        "Postar stories diariamente",
        "Atualizar o vídeo promocional regularmente"
      ]
    },
    {
      title: "Verificação e confiança",
      items: [
        "Completar etapas de verificação do perfil",
        "Indicar novas acompanhantes verificadas"
      ]
    },
    {
      title: "Interações dos clientes",
      items: [
        "Receber avaliações positivas",
        "Receber favoritos",
        "Ganhar presentes (Rositas)",
        "Receber comentários relevantes"
      ]
    },
    {
      title: "Comportamento seguro",
      items: [
        "Não receber denúncias",
        "Manter atendimentos confirmados sem cancelamentos"
      ]
    },
    {
      title: "PinkGame & Missões",
      items: [
        "Girar o PinkGame",
        "Cumprir missões semanais e desafios do mês"
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sections.map((section, idx) => (
        <Card key={idx} title={section.title} items={section.items} />
      ))}
    </div>
  );
};

// --- Penalty Section Component ---
const PenaltySection: React.FC = () => {
  const penalties = [
    "Inatividade",
    "Mudar o número diversas vezes",
    "Denúncias confirmadas",
    "Falta de resposta no chat"
  ];

  return (
    <div className="bg-[#fff3f3] rounded-2xl p-8 border border-red-50">
      <ul className="space-y-4">
        {penalties.map((item, idx) => (
          <li key={idx} className="flex items-center">
            <span className="text-red-500 mr-3 text-xl font-bold">•</span>
            <span className="text-[#c62828] font-semibold text-lg">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Main Page Component ---
const RankingInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20">
            <div className="flex items-center gap-6 md:gap-12">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-pink-600 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Logo */}
              <div className="flex items-center">
                <span className="text-xl md:text-2xl font-extrabold text-[#d91d83] tracking-tight">PinkUp</span>
                <span className="ml-1 text-xl md:text-2xl">🌸</span>
              </div>

              {/* Nav Links - Desktop only */}
              <div className="hidden lg:flex items-center space-x-8">
                <a href="#" className="text-gray-500 hover:text-pink-600 font-medium transition-colors">Home</a>
                <a href="#" className="text-[#d91d83] font-bold border-b-2 border-[#d91d83] h-20 flex items-center mt-[2px]">Ranking</a>
                <a href="#" className="text-gray-500 hover:text-pink-600 font-medium transition-colors">Perfil</a>
                <a href="#" className="text-gray-500 hover:text-pink-600 font-medium transition-colors">Mensagens</a>
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
                <img src="https://picsum.photos/id/64/100/100" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
        {/* Back Link - Mobile only */}
        <button
          onClick={() => navigate(-1)}
          className="flex md:hidden items-center text-gray-600 hover:text-pink-600 transition-colors mb-6 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>

        {/* Intro Text */}
        <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-black">
          Veja como seu perfil está performando e o que fazer para subir no ranking da sua cidade.
        </h1>

        <div className="relative">
          <RankingBanner />

          {/* Stats Bar (Floating element) */}
          <div className="relative -mt-8 mb-12 px-2">
            <StatsBar />
          </div>
        </div>

        {/* How to win section */}
        <section className="mt-12 md:mt-16">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Como ganhar PinkUps</h2>
          <InfoGrid />
        </section>

        {/* Penalty Section */}
        <section className="mt-12 md:mt-16">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">O que pode diminuir seus PinkUps</h2>
          <PenaltySection />
        </section>
      </main>

    </div>
  );
};

export default RankingInfo;
