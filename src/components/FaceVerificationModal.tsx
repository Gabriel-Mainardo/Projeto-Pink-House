import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle, ScanFace, X } from 'lucide-react';
import { securityStepsService } from '../services/securityStepsService';

interface FaceVerificationModalProps {
  isOpen: boolean;
  conversationId: string;
  onClose: () => void;
  onVerified: (photoUrl: string) => void;
}

const FaceVerificationModal: React.FC<FaceVerificationModalProps> = ({
  isOpen,
  conversationId,
  onClose,
  onVerified,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      void startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play();
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsCaptured(false);
      setPhotoBlob(null);
      setPreviewUrl(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      setStream(mediaStream);
    } catch {
      setError('Nao foi possivel acessar a camera. Verifique a permissao do navegador.');
    }
  };

  const stopCamera = () => {
    setStream((previous) => {
      if (previous) {
        previous.getTracks().forEach((track) => track.stop());
      }

      return null;
    });
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        setPhotoBlob(blob);
        setPreviewUrl(canvas.toDataURL('image/jpeg'));
        setIsCaptured(true);
        stopCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setPhotoBlob(null);
    setPreviewUrl(null);
    void startCamera();
  };

  const handleConfirm = async () => {
    if (!photoBlob) {
      return;
    }

    setIsUploading(true);

    try {
      const photoUrl = await securityStepsService.uploadFacePhoto(photoBlob, conversationId);
      const saved = await securityStepsService.saveFaceVerification(conversationId, photoUrl);

      if (!saved) {
        throw new Error('Falha ao registrar selfie de verificacao');
      }

      onVerified(photoUrl);
    } catch (reason) {
      console.error('Erro ao salvar selfie de verificacao:', reason);
      setError('Erro ao salvar a selfie. Tente novamente.');
      setIsUploading(false);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-bold text-gray-900">Selfie de Verificacao</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          <p className="text-sm text-gray-500 mb-4 text-center">
            Tire uma selfie para registrar sua verificacao nesta conversa.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '4 / 3' }}>
            {!isCaptured ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-44 h-52 border-4 border-white/70 rounded-full opacity-60" />
                </div>
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm">Conectando camera...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img src={previewUrl || ''} alt="Selfie capturada" className="w-full h-full object-cover" />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {!isCaptured ? (
            <button
              onClick={handleCapture}
              disabled={!stream}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Camera className="w-5 h-5" />
              Capturar selfie
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => void handleConfirm()}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 disabled:opacity-70 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isUploading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmar selfie
                  </>
                )}
              </button>

              <button
                onClick={handleRetake}
                disabled={isUploading}
                className="w-full py-3 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
              >
                Tirar outra foto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationModal;
