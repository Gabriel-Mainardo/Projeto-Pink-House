import CompanionCard from '../components/CompanionCard';

const CardPreview = () => {
  // Dados mockados para cada tipo de plano
  const mockCards = [
    {
      id: '1',
      name: 'Julia',
      location: 'São Paulo - SP',
      age: 23,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      gallery: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400'
      ],
      rating: 4.8,
      tags: ['Loira', 'Alta'],
      phone: '11999999999',
      description: 'Olá, sou a Julia, uma acompanhante profissional e discreta.',
      pricePerHour: 'R$ 300',
      plan: 'free' as const,
      isAvailable: true,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: '2',
      name: 'Marcela',
      location: 'Rio de Janeiro - RJ',
      age: 25,
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      gallery: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400'
      ],
      rating: 4.9,
      tags: ['Morena', 'Sensual'],
      phone: '21999999999',
      description: 'Sou uma acompanhante carinhosa e atenciosa, pronta para te fazer feliz.',
      pricePerHour: 'R$ 400',
      plan: 'rosa' as const,
      isAvailable: true,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: '3',
      name: 'Fernanda',
      location: 'Brasília - DF',
      age: 27,
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      gallery: [
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
      ],
      rating: 5.0,
      tags: ['Elegante', 'Sofisticada'],
      phone: '61999999999',
      description: 'Acompanhante de luxo para momentos inesquecíveis e especiais.',
      pricePerHour: 'R$ 500',
      plan: 'gold' as const,
      isAvailable: true,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      id: '4',
      name: 'Amanda',
      location: 'Recife - PE',
      age: 22,
      image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
      gallery: [
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
      ],
      rating: 5.0,
      tags: ['Premium', 'Exclusiva'],
      phone: '81999999999',
      description: 'sou uma acompanhante de luxo vim para proporcionar momentos de relaxamento',
      pricePerHour: 'R$ 800',
      plan: 'black' as const,
      isAvailable: false,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Preview dos Cards por Plano</h1>
          <p className="text-gray-600">Visualize e compare os diferentes designs de cards de cada plano</p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {mockCards.map((card) => (
            <div key={card.id} className="space-y-2">
              {/* Label do Plano - Não mostrar para BLACK */}
              {card.plan !== 'black' && (
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-lg font-bold text-sm uppercase ${
                    card.plan === 'free'
                      ? 'bg-gray-200 text-gray-800'
                      : card.plan === 'rosa'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : card.plan === 'gold'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
                      : 'bg-black text-white'
                  }`}>
                    Plano {card.plan.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Card */}
              <CompanionCard
                id={card.id}
                name={card.name}
                location={card.location}
                image={card.image}
                gallery={card.gallery}
                rating={card.rating}
                tags={card.tags}
                phone={card.phone}
                age={card.age}
                description={card.description}
                pricePerHour={card.pricePerHour}
                plan={card.plan}
                isAvailable={card.isAvailable}
                audioUrl={card.audioUrl}
              />
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Características de Cada Plano</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FREE */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">FREE</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Card básico branco</li>
                <li>• Sem ribbon</li>
                <li>• Sem verificação</li>
                <li>• Sem badge especial</li>
              </ul>
            </div>

            {/* ROSA PRO */}
            <div className="border border-purple-300 rounded-lg p-4 bg-purple-50">
              <h3 className="font-bold text-purple-800 mb-2">ROSA PRO</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Ribbon roxo/rosa</li>
                <li>• Borda colorida</li>
                <li>• Badge verificada</li>
                <li>• Player de áudio roxo</li>
              </ul>
            </div>

            {/* GOLD */}
            <div className="border border-yellow-400 rounded-lg p-4 bg-yellow-50">
              <h3 className="font-bold text-yellow-800 mb-2">GOLD</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Ribbon dourado</li>
                <li>• Fundo amarelado</li>
                <li>• Badge verificada</li>
                <li>• Player dourado</li>
              </ul>
            </div>

            {/* BLACK */}
            <div className="border border-gray-800 rounded-lg p-4 bg-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">BLACK</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ribbon preto</li>
                <li>• Badge "Embaixadora" 👑</li>
                <li>• Barra de verificação RGB</li>
                <li>• Box de descrição</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botão para voltar */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
