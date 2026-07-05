import React from 'react';
import { X, ShoppingCart, Flower2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegistrationModalProps {
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleClientRegister = () => {
    navigate('/client-login');
    onClose();
  };

  const handleCompanionRegister = () => {
    navigate('/auth-register', { state: { userType: 'companion' } });
    onClose();
  };

  const handleLogin = () => {
    navigate('/client-login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-xl p-8 md:p-10" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
            Crie sua conta gratuita
          </h1>
          <p className="text-gray-600 text-sm font-normal">
            Escolha o tipo de conta que deseja criar
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Cliente Option */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:border-pink-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                <ShoppingCart size={20} className="text-pink-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sou cliente</h2>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed font-normal">
              Encontre as melhores acompanhantes da sua região e tenha acesso a perfis verificados.
            </p>

            <button
              onClick={handleClientRegister}
              className="w-full py-3.5 px-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-full transition-colors text-sm md:text-base"
            >
              Entrar / Cadastrar como Cliente
            </button>
          </div>

          {/* Acompanhante Option */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:border-pink-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                <Flower2 size={20} className="text-pink-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sou acompanhante</h2>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed font-normal">
              Divulgue seu perfil e alcance milhares de clientes prontos para conhecer você.
            </p>

            <button
              onClick={handleCompanionRegister}
              className="w-full py-3.5 px-4 bg-[#FF4D8D] hover:bg-[#e63b78] text-white font-semibold rounded-full transition-colors text-sm md:text-base"
            >
              Cadastro Acompanhante
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-normal">
            Já tem uma conta?{' '}
            <button
              onClick={handleLogin}
              className="text-pink-500 font-medium hover:underline decoration-2"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
