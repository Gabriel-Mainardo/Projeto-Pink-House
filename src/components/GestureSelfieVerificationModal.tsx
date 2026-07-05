import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle, Hand, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from './UploadLoadingOverlay';

interface GestureSelfieVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (photoUrl: string) => Promise<void> | void;
}

async function uploadGestureSelfie(file: Blob): Promise<string> {
  const filename = `verification/gesture-selfie-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('images').upload(filename, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filename);
  return data.publicUrl;
}

export default function GestureSelfieVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: GestureSelfieVerificationModalProps) {
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
      document.body.style.overflow = 'hidden';
    }

    return () => {
      stopCamera();
      document.body.style.overflow = '';
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
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

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
    if (!photoBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      const photoUrl = await uploadGestureSelfie(photoBlob);
      await onVerified?.(photoUrl);
      onClose();
    } catch (reason) {
      console.error('Erro ao salvar selfie com gesto:', reason);
      setError('Erro ao salvar a selfie. Tente novamente.');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <UploadLoadingOverlay
      show={isUploading}
      message="Enviando selfie..."
      subMessage="Estamos fazendo upload da sua foto. Por favor, aguarde."
    />
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#F7F7F8] w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Hand className="w-5 h-5 text-[#d91d83]" />
            <h2 className="text-lg font-bold text-gray-900">Selfie com gesto</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </header>

        <div className="px-5 py-5">
          <p className="text-sm text-gray-500 text-center mb-4">
            Tire uma selfie segurando dois dedos em sinal de paz para confirmar que a foto foi feita agora.
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
                  <div className="w-44 h-52 border-4 border-white/70 rounded-[2rem] opacity-60" />
                </div>
              </>
            ) : (
              <img src={previewUrl || ''} alt="Selfie com gesto" className="w-full h-full object-cover" />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {!isCaptured ? (
            <button
              onClick={handleCapture}
              disabled={!stream}
              className="w-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Camera className="w-5 h-5" />
              Capturar selfie
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => void handleConfirm()}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 disabled:opacity-70 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </>
  );
}
