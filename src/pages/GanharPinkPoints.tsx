import React from 'react';
import {
  User,
  Heart,
  DollarSign,
  CheckCircle2,
  Circle,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GanharPinkPoints = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Back Button */}
          <div className="mb-3 md:mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Title Section */}
          <div className="text-left md:text-center mb-4 md:mb-6">
            <h1
              className="text-2xl md:text-4xl text-gray-900 mb-1 md:mb-2 tracking-tight"
              style={{
                }}
            >
              Como Ganhar PinkPoints
            </h1>
            <p
              className="text-gray-500 text-sm md:text-base max-w-[600px] md:mx-auto leading-relaxed"
              style={{
                }}
            >
              Complete tarefas, interaja na plataforma e acumule pontos para trocar por recompensas.
            </p>
          </div>

          {/* Cards Grid - Mobile: 1 column, Desktop: 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">

            {/* Card 1: Complete Profile */}
            <div className="bg-white p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-lg text-gray-900 mb-1"
                    style={{
                      }}
                  >
                    Complete seu Perfil
                  </h3>
                  <p
                    className="text-gray-500 text-xs leading-relaxed max-w-[280px]"
                    style={{
                      }}
                  >
                    Quanto mais completo, mais pontos você ganha.
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded-full shadow-sm" style={{ color: '#d91d83' }}>
                  <User size={22} strokeWidth={2} />
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-grow">
                <div
                  className="flex items-center space-x-2 text-gray-700 text-xs"
                  style={{
                    }}
                >
                  <CheckCircle2 style={{ color: '#4CAF50' }} size={16} />
                  <span>Verificar e-mail</span>
                </div>
                <div
                  className="flex items-center space-x-2 text-gray-700 text-xs"
                  style={{
                    }}
                >
                  <CheckCircle2 style={{ color: '#4CAF50' }} size={16} />
                  <span>Adicionar foto de perfil</span>
                </div>
                <div
                  className="flex items-center space-x-2 text-gray-400 text-xs"
                  style={{
                    }}
                >
                  <Circle className="text-gray-400" size={16} />
                  <span>Preencher biografia</span>
                </div>
              </div>

              <div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full w-2/3" style={{ backgroundColor: '#d91d83' }}></div>
                </div>
                <div
                  className="text-right text-xs"
                  style={{
                    color: '#d91d83',
                    }}
                >
                  +50 PinkPoints
                </div>
              </div>
            </div>

            {/* Card 2: Invite Friends */}
            <div className="bg-white p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-lg text-gray-900 mb-1"
                    style={{
                      }}
                  >
                    Convide Amigos
                  </h3>
                  <p
                    className="text-gray-500 text-xs leading-relaxed max-w-[280px]"
                    style={{
                      }}
                  >
                    Ganha pontos para cada amigo que se cadastrar.
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded-full shadow-sm" style={{ color: '#d91d83' }}>
                  <Share2 size={22} strokeWidth={2} />
                </div>
              </div>

              <div className="rounded-2xl p-4 text-center mb-3 border" style={{ backgroundColor: '#FFF0F7', borderColor: 'rgba(230, 0, 126, 0.2)' }}>
                <p
                  className="text-gray-800 text-xs mb-1"
                  style={{
                    }}
                >
                  Por cada amigo que se cadastrar
                </p>
                <h4
                  className="text-2xl mb-1"
                  style={{
                    color: '#d91d83',
                    }}
                >
                  +100 PinkPoints
                </h4>
                <p
                  className="text-gray-500 text-[10px]"
                  style={{
                    }}
                >
                  Mais amigos = Mais pontos!
                </p>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => navigate('/indique-ganhe')}
                  className="w-full text-white py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center space-x-2 text-sm"
                  style={{
                    backgroundColor: '#d91d83',
                    boxShadow: '0 10px 25px -5px rgba(230, 0, 126, 0.3)',
                    }}
                >
                  <Share2 size={16} />
                  <span>Compartilhar Link</span>
                </button>
              </div>

              <div
                className="text-right text-xs mt-2"
                style={{
                  color: '#d91d83',
                  }}
              >
                +100 PinkPoints por amigo
              </div>
            </div>

            {/* Card 3: Interaction */}
            <div className="bg-white p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-lg text-gray-900 mb-1"
                    style={{
                      }}
                  >
                    Interaja com o Conteúdo
                  </h3>
                  <p
                    className="text-gray-500 text-xs leading-relaxed max-w-[280px]"
                    style={{
                      }}
                  >
                    Sua atividade na plataforma vira recompensa.
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded-full shadow-sm" style={{ color: '#d91d83' }}>
                  <Heart size={22} strokeWidth={2} />
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center text-xs">
                  <span
                    className="text-gray-700"
                    style={{
                      }}
                  >
                    Assistir PinkFlash
                  </span>
                  <span
                    style={{
                      color: '#d91d83',
                      }}
                  >
                    +10 PinkPoints
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span
                    className="text-gray-700"
                    style={{
                      }}
                  >
                    Enviar mensagens
                  </span>
                  <span
                    style={{
                      color: '#d91d83',
                      }}
                  >
                    +5 PinkPoints
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span
                    className="text-gray-700"
                    style={{
                      }}
                  >
                    Enviar um presente
                  </span>
                  <span
                    style={{
                      color: '#d91d83',
                      }}
                  >
                    +25 PinkPoints
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Recharges */}
            <div className="bg-white p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-lg text-gray-900 mb-1"
                    style={{
                      }}
                  >
                    Realize Recargas
                  </h3>
                  <p
                    className="text-gray-500 text-xs leading-relaxed max-w-[280px]"
                    style={{
                      }}
                  >
                    Compre Rositas e ganhe PinkPoints extras.
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded-full shadow-sm" style={{ color: '#d91d83' }}>
                  <DollarSign size={22} strokeWidth={2} />
                </div>
              </div>

              <div className="rounded-2xl p-4 text-center mb-4 border" style={{ backgroundColor: '#FFF0F7', borderColor: 'rgba(230, 0, 126, 0.2)' }}>
                <p
                  className="text-gray-800 text-xs mb-1"
                  style={{
                    }}
                >
                  A cada <span style={{ fontWeight: 700 }}>R$1,00</span> em Rositas
                </p>
                <h4
                  className="text-xl mb-1"
                  style={{
                    color: '#d91d83',
                    }}
                >
                  Ganhe 10 PinkPoints
                </h4>
                <p
                  className="text-gray-500 text-[10px]"
                  style={{
                    }}
                >
                  Quanto maior a recarga, mais pontos você acumula!
                </p>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => navigate('/wallet')}
                  className="w-full text-white py-2.5 rounded-xl hover:opacity-90 transition-all text-sm"
                  style={{
                    backgroundColor: '#d91d83',
                    boxShadow: '0 10px 25px -5px rgba(230, 0, 126, 0.3)',
                    }}
                >
                  Recarregar Agora
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] pt-8 pb-6 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            {/* Brand Column */}
            <div className="md:col-span-1">
              <div
                className="text-2xl tracking-tight mb-4"
                style={{
                  color: '#d91d83',
                  }}
              >
                Faixa Rosa
              </div>
              <p
                className="text-gray-500 text-sm leading-relaxed"
                style={{
                  }}
              >
                Conectando pessoas com segurança e discrição.
              </p>
            </div>

            {/* Links Column 1 */}
            <div>
              <h5
                className="text-gray-900 mb-4"
                style={{
                  }}
              >
                Plataforma
              </h5>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#d91d83] transition-colors"
                    style={{
                      }}
                  >
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-of-use"
                    className="hover:text-[#d91d83] transition-colors"
                    style={{
                      }}
                  >
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#d91d83] transition-colors"
                    style={{
                      }}
                  >
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h5
                className="text-gray-900 mb-4"
                style={{
                  }}
              >
                Suporte
              </h5>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#d91d83] transition-colors"
                    style={{
                      }}
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#d91d83] transition-colors"
                    style={{
                      }}
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#d91d83] transition-colors"
                    style={{
                      }}
                  >
                    Segurança
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Column */}
            <div>
              <h5
                className="text-gray-900 mb-4"
                style={{
                  }}
              >
                Siga-nos
              </h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#d91d83] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#d91d83] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#d91d83] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-gray-200 text-center">
            <p
              className="text-gray-400 text-xs"
              style={{
                }}
            >
              © 2024 Faixa Rosa. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GanharPinkPoints;
