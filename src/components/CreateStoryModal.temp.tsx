import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, Mic, Type, Upload, ArrowLeft, Check, Link, User } from 'lucide-react';
import { storiesService } from '../services/storiesService';

type PlanType = 'destaque' | 'premium' | 'basic';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionId: string;
}

type StoryType = 'camera' | 'video' | 'audio' | 'text' | 'upload' | 'link';
type ModalStep = 'plans' | 'create' | 'preview' | 'info' | 'success';

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose, companionId }): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('create');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('destaque');
  const [storyType, setStoryType] = useState<StoryType>('camera');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#d91d83');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [companionName, setCompanionName] = useState('');
  const [companionWhatsapp, setCompanionWhatsapp] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [storyLinkUrl, setStoryLinkUrl] = useState('');
  const [storyLinkText, setStoryLinkText] = useState('');
  const [linkType, setLinkType] = useState<'whatsapp' | 'custom'>('whatsapp');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ... rest of the code ...

  // Função para aceitar o vídeo gravado
  const handleAcceptVideo = () => {
    console.log('✅ Vídeo aceito, indo para informações...');
    stopCamera(); // Agora sim parar a câmera
    setCurrentStep('info');
  };

  // Função para rejeitar e gravar novamente
  const handleRetakeVideo = () => {
    console.log('🔄 Gravando vídeo novamente...');
    setFile(null);
    setPreview(null);
    setRecordingTime(0);
    // Voltar para tela de criação para gravar novamente
    setCurrentStep('create');
  };

  // Função para continuar para o sucesso após adicionar o link
  const handleContinueToSuccess = () => {
    console.log('🎉 Mudando para tela de sucesso...');
    setUploadSuccess(true);
    setCurrentStep('success');
  };

  // Função para capturar foto
  const capturePhoto = () => {
    if (!cameraVideoRef.current || !canvasRef.current) return;

    const video = cameraVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Configurar canvas com dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame atual do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob e criar arquivo
    canvas.toBlob((blob) => {
      if (blob) {
        const photoFile = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        setFile(photoFile);
        setPreview(URL.createObjectURL(blob));
        stopCamera(); // Parar câmera após capturar
        setCurrentStep('info'); // Ir para tela de informações
      }
    }, 'image/jpeg', 0.9);
  };

  // ... rest of the code ...

  // Renderizar modal de informações
  if (currentStep === 'info') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="relative w-full h-full max-w-md mx-auto bg-gradient-to-br from-velvet-pink-500 to-velvet-pink-600 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 text-white">
            <button onClick={() => setCurrentStep('create')} className="hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Informações do Story</h2>
            <button onClick={onClose} className="hover:text-gray-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Seção de Informações Pessoais */}
            <div className="mb-8">
              <div className="text-center text-white mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Suas Informações 📝
                </h3>
                <p className="text-white/80 text-sm">
                  Preencha seus dados para identificação do story
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Seu Nome:
                  </label>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Seu WhatsApp:
                  </label>
                  <input
                    type="tel"
                    value={companionWhatsapp}
                    onChange={(e) => setCompanionWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Link */}
            <div className="mb-8">
              <div className="text-center text-white mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Adicionar Link (Opcional) 🔗
                </h3>
                <p className="text-white/80 text-sm">
                  Adicione um link para direcionar os visualizadores
                </p>
              </div>

              {/* Seleção do tipo de link */}
              <div className="mb-6">
                <div className="space-y-3">
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      linkType === 'whatsapp' 
                        ? 'border-green-400 bg-green-500/20' 
                        : 'border-white/30 bg-white/10'
                    }`}
                    onClick={() => setLinkType('whatsapp')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">📱</span>
                      </div>
                      <div className="text-white">
                        <p className="font-bold">WhatsApp</p>
                        <p className="text-sm text-white/80">Link direto para seu WhatsApp</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      linkType === 'custom' 
                        ? 'border-blue-400 bg-blue-500/20' 
                        : 'border-white/30 bg-white/10'
                    }`}
                    onClick={() => setLinkType('custom')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🔗</span>
                      </div>
                      <div className="text-white">
                        <p className="font-bold">Link Personalizado</p>
                        <p className="text-sm text-white/80">Link do seu perfil ou site</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos do link baseado no tipo selecionado */}
              <div className="space-y-4">
                {linkType === 'whatsapp' ? (
                  <>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Número do WhatsApp:
                      </label>
                      <input
                        type="tel"
                        value={storyLinkUrl}
                        onChange={(e) => setStoryLinkUrl(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Texto do botão (opcional):
                      </label>
                      <input
                        type="text"
                        value={storyLinkText}
                        onChange={(e) => setStoryLinkText(e.target.value)}
                        placeholder="Ex: Chamar no WhatsApp"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        URL do Link:
                      </label>
                      <input
                        type="url"
                        value={storyLinkUrl}
                        onChange={(e) => setStoryLinkUrl(e.target.value)}
                        placeholder="https://meusite.com/perfil"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Texto do botão:
                      </label>
                      <input
                        type="text"
                        value={storyLinkText}
                        onChange={(e) => setStoryLinkText(e.target.value)}
                        placeholder="Ex: Ver meu perfil"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-white focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Preview do link */}
              {(storyLinkText || storyLinkUrl) && (
                <div className="mt-6">
                  <h4 className="font-bold text-white mb-3">Preview do link no story:</h4>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/30">
                    <div className="flex items-center justify-center">
                      <div className="bg-velvet-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                        {storyLinkText || (linkType === 'whatsapp' ? 'Chamar no WhatsApp' : 'Acessar Link')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="p-6">
            <button
              onClick={handleUpload}
              disabled={!companionName || !companionWhatsapp}
              className={`w-full py-4 bg-white text-velvet-pink-600 rounded-xl font-bold text-lg transition-all ${
                !companionName || !companionWhatsapp
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              ✨ Finalizar e Enviar
            </button>
            
            {(!companionName || !companionWhatsapp) && (
              <p className="mt-2 text-center text-white/80 text-sm">
                Preencha seu nome e WhatsApp para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ... rest of the code ...
}; 