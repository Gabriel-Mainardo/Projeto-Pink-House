import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { ChevronRight, Check, ShieldCheck } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email') || 'seu email';

  const steps = [
    {
      title: "Crie sua conta inserindo seus dados básicos.",
      description: "",
      icon: "1"
    },
    {
      title: "Configure seu perfil e monte seu anúncio.",
      description: "Não é necessário exibir seu rosto, caso prefira manter a privacidade.",
      icon: "2"
    },
    {
      title: "Confirme sua identidade enviando sua Mídia de Comparação.",
      description: "Isso aumenta a confiança e melhora suas chances de contratação.",
      icon: "3"
    }
  ];

  const handleFinish = () => {
    // Redirecionar para seleção de privacidade
    navigate(`/privacy-selection?email=${encodeURIComponent(userEmail)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Título principal */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light mb-4">
              Boas-vindas ao <span className="text-velvet-pink-600">Faixa</span> <span className="text-black">Rosa</span>
            </h1>
          </div>

          {/* Wizard vertical de 3 etapas */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start mb-8 last:mb-0 group">
                  {/* Coluna do número/ícone */}
                  <div className="flex flex-col items-center mr-8 relative">
                    {/* Círculo da etapa */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-r from-velvet-pink-600 to-velvet-pink-500 text-white shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-200">
                      {step.icon}
                    </div>

                    {/* Linha conectora vertical pontilhada - se estende para baixo */}
                    {index < steps.length - 1 && (
                      <div className={`border-l-3 border-dotted border-velvet-pink-300 absolute top-12 left-1/2 transform -translate-x-1/2 ${
                        index === 1 ? 'h-20' : 'h-16'
                      }`}>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo da etapa */}
                  <div className="flex-1 pt-3">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 leading-tight">
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-gray-600 leading-relaxed text-base">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão final centralizado */}
          <div className="text-center mt-8">
            <button
              onClick={handleFinish}
              className="bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white px-8 py-3 rounded-lg hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors flex items-center justify-center space-x-2 mx-auto text-lg"
            >
              <span>Começar Agora</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-black text-sm mt-4 max-w-md mx-auto">
              <ShieldCheck className="w-6 h-6 text-green-600 inline mr-2" />
              Utilizamos tecnologia de ponta para sua segurança. <span className="text-green-600 font-medium">Seus dados estão protegidos conosco.</span>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;