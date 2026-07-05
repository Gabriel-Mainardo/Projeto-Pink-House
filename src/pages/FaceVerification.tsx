import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { Camera, Shield, UserCheck, Play, ChevronRight, X, CheckCircle } from 'lucide-react';

const FaceVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email') || '';
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartVerification = async () => {
    try {
      setError(null);

      // Solicitar permissão da câmera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('Stream obtido:', mediaStream);
      setStream(mediaStream);
      setShowCamera(true);

    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Verifique se você permitiu o acesso.');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setCountdown(5);

    // Countdown de 5 segundos
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishVerification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishVerification = () => {
    setIsRecording(false);

    // Parar stream da câmera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCamera(false);

    // Mostrar modal de sucesso
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 1000);
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCamera(false);
    setIsRecording(false);
    setCountdown(0);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    navigate(`/service-type?email=${encodeURIComponent(userEmail)}`);
  };

  useEffect(() => {
    // Cleanup ao desmontar componente
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Effect para conectar stream ao video
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Erro ao reproduzir vídeo:', err);
      });
    }
  }, [stream]);

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {!showCamera ? (
            <>
              {/* Título principal */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-light text-gray-800 mb-4">
                  Sua <span className="text-velvet-pink-600">segurança</span> em primeiro lugar
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Para garantir que apenas você tenha acesso ao seu perfil, precisamos confirmar sua identidade através de uma verificação facial rápida.
                </p>
              </div>

              {/* Informações em grid horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <UserCheck className="w-8 h-8 text-velvet-pink-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-800 mb-2">Proteção Total</h3>
                  <p className="text-gray-600 text-sm">Somente você poderá acessar e modificar seu anúncio. Ninguém mais terá permissão.</p>
                </div>

                <div className="text-center">
                  <Camera className="w-8 h-8 text-velvet-pink-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-800 mb-2">Processo Simples</h3>
                  <p className="text-gray-600 text-sm">Basta gravar um vídeo rápido do seu rosto. O processo leva menos de 30 segundos.</p>
                </div>

                <div className="text-center">
                  <Shield className="w-8 h-8 text-velvet-pink-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-800 mb-2">Dados Seguros</h3>
                  <p className="text-gray-600 text-sm">Sua verificação facial é criptografada e armazenada com segurança máxima.</p>
                </div>
              </div>

              {/* Erro se houver */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Botão de ação */}
              <div className="text-center mb-8">
                <button
                  onClick={handleStartVerification}
                  className="bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white px-8 py-4 rounded-lg hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors flex items-center justify-center space-x-3 mx-auto text-lg font-medium"
                >
                  <Camera className="w-6 h-6" />
                  <span>Iniciar Verificação Facial</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Nota de segurança */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  🔒 Seus dados biométricos são processados localmente e protegidos por criptografia de ponta a ponta
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Interface da câmera */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-gray-800 mb-4">
                  Verificação Facial
                </h2>
                <p className="text-gray-600">
                  Posicione seu rosto no centro da câmera e clique em "Gravar"
                </p>
              </div>

              {/* Visualização da câmera */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-96 object-cover"
                  onLoadedMetadata={() => {
                    console.log('Video metadata carregado');
                  }}
                  onCanPlay={() => {
                    console.log('Video pode ser reproduzido');
                  }}
                />

                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p>Conectando à câmera...</p>
                    </div>
                  </div>
                )}

                {/* Overlay com círculo guia */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-white rounded-full opacity-50"></div>
                </div>

                {/* Botão fechar */}
                <button
                  onClick={handleCloseCamera}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Countdown */}
                {isRecording && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-bold text-white bg-black bg-opacity-50 w-24 h-24 rounded-full flex items-center justify-center">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>

              {/* Controles */}
              <div className="text-center">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white px-8 py-4 rounded-lg hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors flex items-center justify-center space-x-3 mx-auto text-lg font-medium"
                  >
                    <Camera className="w-6 h-6" />
                    <span>Gravar Verificação</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-velvet-pink-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg text-gray-700">Gravando...</p>
                    <p className="text-sm text-gray-500">Olhe diretamente para a câmera</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl">
            <div className="text-center">
              {/* Ícone de sucesso */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Autenticação Facial Aprovada!
              </h2>

              {/* Descrição */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                A etapa de autenticação facial foi concluída com sucesso. Continue cadastrando seus documentos para ter seu anúncio ativo no <span className="text-velvet-pink-600 font-medium">Faixa Rosa</span>!
              </p>

              {/* Botão */}
              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white px-6 py-3 rounded-lg hover:from-velvet-pink-800 hover:to-velvet-pink-700 transition-colors font-medium"
              >
                Continuar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceVerification;