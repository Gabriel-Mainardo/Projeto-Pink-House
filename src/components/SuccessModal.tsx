import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  name: string;
}

const SuccessModal = ({ isOpen, name }: SuccessModalProps) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl" style={{ }}>
        {/* Ícone de sucesso animado */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Check className="w-10 h-10 text-white animate-bounce" />
        </div>
        
        {/* Título principal */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4" style={{ }}>
          🎉 Cadastro Concluído com Sucesso!
        </h2>
        
        {/* Mensagem */}
        <p className="text-center text-gray-600 mb-2">
          Olá, <span className="font-semibold text-velvet-pink-600">{name}</span>!
        </p>
        <p className="text-center text-gray-600 mb-6">
          Sua conta foi criada com sucesso!
          <br />
          Você já pode fazer login e gerenciar seu perfil.
        </p>

        {/* Botão de redirecionamento */}
        <button
          onClick={() => navigate('/login?type=companion')}
          className="w-full py-3 px-4 bg-velvet-pink-600 hover:bg-velvet-pink-700 text-white font-medium rounded-lg transition-colors"
        >
          Fazer Login
        </button>
      </div>
    </div>
  );
};

export default SuccessModal; 