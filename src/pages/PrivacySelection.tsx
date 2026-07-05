import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { ChevronRight, Eye, EyeOff, Users, Crown } from 'lucide-react';

const PrivacySelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email') || '';
  const [selectedPrivacy, setSelectedPrivacy] = useState<'public' | 'private' | null>(null);

  const handleContinue = () => {
    if (!selectedPrivacy) return;

    navigate(`/cadastro-modelo?email=${encodeURIComponent(userEmail)}&privacy=${selectedPrivacy}`);
  };

  const privacyOptions = [
    {
      type: 'public' as const,
      title: 'Perfil Público',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      description: 'Seu perfil será visível para todos os usuários',
      benefits: [
        'Maior visibilidade',
        'Mais oportunidades de contratação',
        'Acesso completo a todos os recursos'
      ],
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      selectedBorderColor: 'border-blue-500'
    },
    {
      type: 'private' as const,
      title: 'Perfil Privado',
      icon: <Crown className="w-8 h-8 text-amber-600" />,
      description: 'Apenas usuários assinantes premium poderão ver seu perfil',
      benefits: [
        'Maior privacidade',
        'Clientes mais qualificados',
        'Controle total sobre quem vê seu perfil'
      ],
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      selectedBorderColor: 'border-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light mb-4">
              Defina o nível de <span className="text-velvet-pink-600">privacidade</span> do seu perfil
            </h1>
            <p className="text-gray-600 text-lg">
              Escolha como você deseja que seu perfil seja exibido na plataforma
            </p>
          </div>

          {/* Opções de privacidade */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {privacyOptions.map((option) => (
              <div
                key={option.type}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPrivacy === option.type
                    ? `${option.selectedBorderColor} ${option.bgColor}`
                    : `${option.borderColor} bg-white hover:${option.bgColor}`
                }`}
                onClick={() => setSelectedPrivacy(option.type)}
              >
                <div className="text-center mb-4">
                  {option.icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {option.title}
                </h3>

                <p className="text-gray-600 mb-4 text-center">
                  {option.description}
                </p>

                <ul className="space-y-2">
                  {option.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-velvet-pink-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {selectedPrivacy === option.type && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-velvet-pink-100 text-velvet-pink-700 text-sm font-medium">
                      Selecionado
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botão de continuar */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedPrivacy}
              className={`px-8 py-3 rounded-lg text-white text-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 mx-auto ${
                selectedPrivacy
                  ? 'bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 hover:from-velvet-pink-800 hover:to-velvet-pink-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continuar</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {!selectedPrivacy && (
              <p className="text-gray-500 text-sm mt-3">
                Selecione uma opção para continuar
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacySelection;