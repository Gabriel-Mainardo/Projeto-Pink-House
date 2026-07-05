import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, X, Video, User, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from './UploadLoadingOverlay';

interface VideoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (videoUrl: string) => Promise<void> | void;
}

async function uploadVerificationVideo(blob: Blob): Promise<string> {
  const filename = `verification/video_${Date.now()}.webm`;
  const { error } = await supabase.storage.from('videos').upload(filename, blob, {
    contentType: 'video/webm',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('videos').getPublicUrl(filename);
  return data.publicUrl;
}

export default function VideoVerificationModal({ isOpen, onClose, onVerified }: VideoVerificationModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);  // object URL for preview
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);     // real blob for upload
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    await startCamera();

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordedVideo(URL.createObjectURL(blob));
        stopCamera();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Auto-stop após 15 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 15000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlob) return;
    setIsLoading(true);
    setUploadError(null);
    try {
      const videoUrl = await uploadVerificationVideo(recordedBlob);
      await onVerified?.(videoUrl);
      onClose();
    } catch (err: any) {
      console.error('Erro ao enviar vídeo:', err);
      setUploadError(err?.message || 'Erro ao enviar vídeo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setRecordedVideo(null);
    setRecordedBlob(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <>
    <UploadLoadingOverlay
      show={isLoading}
      message="Enviando vídeo..."
      subMessage="O upload pode levar alguns segundos. Não feche esta tela."
    />
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#F7F7F8]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center bg-[#F7F7F8]/95 backdrop-blur-sm p-4 pb-2 justify-between">
          <button
            onClick={onClose}
            className="text-gray-800 flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10" style={{ }}>
            Gravar Vídeo de Verificação
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#d91d83]/10 mb-4 mx-auto">
              <Video className="w-7 h-7 text-[#d91d83]" />
            </div>
            <h2 className="text-gray-900 tracking-tight text-[22px] font-bold leading-tight text-center mb-3" style={{ }}>
              Verifique sua identidade com um vídeo
            </h2>
            <p className="text-gray-500 text-sm font-normal leading-relaxed text-center" style={{ }}>
              Grave um vídeo curto seguindo as instruções para confirmar sua identidade e aumentar a segurança do seu perfil.
              Seu vídeo será revisado pela nossa equipe.
            </p>
          </div>

          {/* Video Preview */}
          <div className="bg-gray-900 aspect-[9/16] rounded-xl flex flex-col items-center justify-center text-center p-6 border-4 border-white shadow-sm overflow-hidden relative">
            {recordedVideo ? (
              <video
                src={recordedVideo}
                className="absolute inset-0 w-full h-full object-cover"
                controls
                autoPlay
                loop
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover ${isRecording ? 'block' : 'hidden'}`}
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!isRecording && (
                  <>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#d91d83]/80 mb-4 border-2 border-white">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white font-semibold" style={{ }}>Posicione seu rosto aqui</p>
                    <p className="text-gray-300 text-sm mt-1" style={{ }}>Pressione o botão abaixo para gravar</p>
                  </>
                )}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold" style={{ }}>Gravando...</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9C27B0]/10 text-[#9C27B0] font-bold text-lg" style={{ }}>1</div>
              <p className="text-gray-700 font-medium" style={{ }}>Olhe para a câmera</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9C27B0]/10 text-[#9C27B0] font-bold text-lg" style={{ }}>2</div>
              <p className="text-gray-700 font-medium" style={{ }}>Diga seu nome completo</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9C27B0]/10 text-[#9C27B0] font-bold text-lg" style={{ }}>3</div>
              <p className="text-gray-700 font-medium" style={{ }}>Gire a cabeça lentamente</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none flex flex-col gap-3">
          <div className="pointer-events-auto w-full">
            {uploadError && (
              <p className="text-red-500 text-sm text-center mb-3">{uploadError}</p>
            )}
            {recordedVideo ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-14 rounded-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white font-bold text-base shadow-lg shadow-[#d91d83]/30 hover:shadow-[#d91d83]/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Enviar Vídeo</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRetake}
                  className="w-full mt-3 h-12 rounded-full bg-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                  style={{ }}
                >
                  Gravar Novamente
                </button>
              </>
            ) : (
              <button
                onClick={handleRecordClick}
                className={`w-full h-14 rounded-full ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-[#d91d83] to-[#9C27B0]'
                } text-white font-bold text-base shadow-lg shadow-[#d91d83]/30 hover:shadow-[#d91d83]/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2`}
                style={{ }}
              >
                {isRecording ? (
                  <>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                    <span>Parar Gravação</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    <span>Gravar Vídeo</span>
                  </>
                )}
              </button>
            )}

            <button className="w-full mt-4 flex items-center justify-center gap-1.5 text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors" style={{ }}>
              <HelpCircle className="w-4 h-4" />
              Preciso de Ajuda
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
