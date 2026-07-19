import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import VirtualAssistantChat from '../components/VirtualAssistantChat';
import { User, Phone, Settings, LogOut, Heart, Clock, Eye, EyeOff, ChevronRight, MapPin } from 'lucide-react';
import { useLocation as useLocationContext } from '../contexts/LocationContext';

const ClientArea = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCity } = useLocationContext();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  const [userBalance] = useState(1250.00); // Saldo fictício

  // Lista de nomes brasileiros comuns
  const nomesBrasileiros = [
    'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Ferreira',
    'Lucas Pereira', 'Juliana Lima', 'Rafael Souza', 'Fernanda Alves', 'Diego Martins',
    'Camila Rodrigues', 'Bruno Nascimento', 'Gabriela Carvalho', 'Thiago Barbosa', 'Amanda Ribeiro',
    'Gustavo Araújo', 'Isabella Gomes', 'Mateus Dias', 'Larissa Cardoso', 'Felipe Monteiro',
    'Mariana Castro', 'André Moreira', 'Sophia Ramos', 'Leonardo Torres', 'Bianca Azevedo'
  ];

  useEffect(() => {
    // Gerar nome aleatório
    const nomeAleatorio = nomesBrasileiros[Math.floor(Math.random() * nomesBrasileiros.length)];
    setUserName(nomeAleatorio);

    // Pegar telefone dos parâmetros se disponível
    const phone = searchParams.get('phone');
    if (phone) {
      setUserPhone(phone);
    } else {
      setUserPhone('(11) 99999-9999'); // Telefone padrão para demo
    }
  }, [searchParams]);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header da área do cliente */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-black mb-1">Seja bem-vindo</p>
                  <h1 className="text-3xl font-bold text-blue-600">
                    {userName}
                  </h1>
                  <button
                    onClick={() => {
                      // TODO: Configurar ação ao clicar na localização
                      console.log('Localização clicada - configurar ação');
                    }}
                    className="text-black hover:text-blue-600 flex items-center mt-1 transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="underline">{selectedCity.fullName}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                {/* Botão Ver Perfil */}
                <button
                  onClick={() => navigate('/client-dashboard')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Ver Perfil
                </button>

                {/* Área do saldo */}
                <div className="border-2 border-black bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1 text-center">Seu saldo</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold text-black">
                      {showBalance ? `R$ ${userBalance.toFixed(2)}` : 'R$ •••••'}
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    {/* Botão setinha */}
                    <button
                      onClick={() => {
                        // TODO: Configurar para onde vai levar
                        console.log('Botão setinha clicado - configurar destino');
                      }}
                      className="text-black hover:text-blue-600 transition-colors ml-1"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Explorar catálogo */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                 onClick={() => navigate('/catalog')}>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Explorar Catálogo</h3>
              <p className="text-gray-600 text-sm">
                Navegue pelo nosso catálogo completo de acompanhantes verificadas
              </p>
            </div>

            {/* Histórico */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Histórico</h3>
              <p className="text-gray-600 text-sm">
                Veja seus contatos anteriores e perfis visualizados
              </p>
            </div>

            {/* Configurações */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Configurações</h3>
              <p className="text-gray-600 text-sm">
                Gerencie suas preferências e dados da conta
              </p>
            </div>
          </div>

          {/* Seção de boas-vindas */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 mt-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Faixa Rosa!</h2>
            <p className="text-blue-100 mb-6">
              Sua conta foi criada com sucesso. Agora você pode explorar nosso catálogo
              completo de acompanhantes verificadas em sua região.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-100">Perfis Verificados</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-blue-100">Suporte Disponível</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-blue-100">Seguro e Discreto</div>
              </div>
            </div>
          </div>

          {/* Dicas para novos usuários */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Primeiros Passos</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Explore o catálogo</p>
                  <p className="text-gray-600 text-sm">Navegue pelos perfis e encontre acompanhantes na sua região</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Entre em contato</p>
                  <p className="text-gray-600 text-sm">Use as informações de contato fornecidas nos perfis</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Mantenha a discrição</p>
                  <p className="text-gray-600 text-sm">Respeite a privacidade e siga nossas diretrizes de conduta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Chat de Assistente Virtual */}
      <VirtualAssistantChat />
    </div>
  );
};

export default ClientArea;
