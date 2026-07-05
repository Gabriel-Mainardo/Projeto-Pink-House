import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { UserPlus, Star, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStartRegistration = () => {
    navigate('/cadastro-modelo');
  };

  return (
    <div className="min-h-screen bg-white">
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Card Principal */}
          <div className="bg-white border-2 border-gray-200 p-8 md:p-12 rounded-2xl shadow-lg mb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-velvet-pink-100 rounded-full flex items-center justify-center mb-6">
                <UserPlus className="w-10 h-10 text-velvet-pink-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
                Torne-se uma Acompanhante Verificada
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Preencha nosso formulário de cadastro e aguarde a aprovação da nossa equipe. 
                Após aprovado, seu perfil ficará ativo na plataforma.
              </p>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Perfil Verificado</h3>
                <p className="text-gray-600 text-sm">
                  Selo de verificação que aumenta a confiança dos clientes
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Destaque na Plataforma</h3>
                <p className="text-gray-600 text-sm">
                  Possibilidade de ter seu perfil em destaque para mais visibilidade
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Segurança e Privacidade</h3>
                <p className="text-gray-600 text-sm">
                  Controle total sobre suas informações e contatos
                </p>
              </div>
            </div>


            {/* Botão CTA */}
            <div className="text-center">
              <button
                onClick={handleStartRegistration}
                className="bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 hover:from-velvet-pink-800 hover:to-velvet-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto text-lg"
              >
                <span>Iniciar Cadastro</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-gray-500 text-sm mt-3">
                Processo rápido e seguro • Aprovação em até 24h
              </p>
            </div>
          </div>

          {/* Footer de Login */}
          <div className="text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-velvet-pink-600 hover:text-velvet-pink-500 font-medium">
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register; 