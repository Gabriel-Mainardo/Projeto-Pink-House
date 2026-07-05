import { AlertTriangle, Check, ExternalLink } from 'lucide-react';

// Define o tipo das props
interface AgeVerificationModalProps {
  onAccept?: () => void;
}

const AgeVerificationModal = ({ onAccept }: AgeVerificationModalProps = {}) => {
  // Função para aceitar e continuar
  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
  };

  // Função para rejeitar e sair do site
  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80">
      {/* Container do modal */}
      <div className="relative w-full max-w-md bg-white rounded-lg overflow-hidden shadow-2xl" style={{ }}>
        {/* Cabeçalho com faixa rosa */}
        <div className="bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 py-4 px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Verificação de Idade</h2>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Conteúdo do modal */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold text-gray-800">
              Este site contém conteúdo adulto
            </p>
            <p className="text-gray-600">
              Para acessar este site, você deve ter pelo menos <span className="font-bold text-velvet-pink-600">18 anos de idade</span> ou a maioridade legal em seu país.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-start">
              <Check className="w-4 h-4 text-velvet-pink-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>O conteúdo deste site é destinado a um público adulto.</span>
            </p>
            <p className="flex items-start">
              <Check className="w-4 h-4 text-velvet-pink-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Ao entrar, você confirma que tem idade legal para visualizar material adulto.</span>
            </p>
            <p className="flex items-start">
              <Check className="w-4 h-4 text-velvet-pink-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Você concorda com nossos termos de uso e política de privacidade.</span>
            </p>
          </div>

          {/* Aviso Legal */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 text-center font-medium">
              <strong>IMPORTANTE:</strong> Somos apenas um site de anúncios. Não agenciamos, intermediamos nem garantimos qualquer encontro entre partes.
            </p>
          </div>

          {/* Botões de ação */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleAccept}
              className="w-full py-3 px-4 bg-velvet-pink-600 text-white font-medium rounded-md hover:bg-velvet-pink-700 transition-colors"
            >
              Tenho 18 anos ou mais
            </button>
            
            <button
              onClick={handleReject}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              Sair do site
            </button>
          </div>

          {/* Nota de rodapé */}
          <div className="text-xs text-center text-gray-500 pt-2">
            <p>
              Ao entrar, você confirma que leu e concorda com nossa{' '}
              <a href="/terms-of-use" className="text-velvet-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Política de Privacidade
              </a>{' '}
              e{' '}
              <a href="/terms-of-use" className="text-velvet-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Termos de Uso
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal; 