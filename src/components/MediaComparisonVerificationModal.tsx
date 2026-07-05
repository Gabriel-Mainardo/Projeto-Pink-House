import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, HelpCircle, Loader2, RefreshCw, RotateCw, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from './UploadLoadingOverlay';

interface MediaComparisonVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (videoUrl: string) => Promise<void> | void;
}

async function uploadMediaComparisonVideo(blob: Blob): Promise<string> {
  const filename = `media-comparison/video_360_${Date.now()}.webm`;
  const { error } = await supabase.storage.from('videos').upload(filename, blob, {
    contentType: 'video/webm',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('videos').getPublicUrl(filename);
  return data.publicUrl;
}

export default function MediaComparisonVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: MediaComparisonVerificationModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      stopCamera();
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
    };
  }, [isOpen, recordedVideo]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 720 },
        height: { ideal: 1280 },
      },
      audio: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    return stream;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setUploadError(null);
      const stream = await startCamera();
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        if (recordedVideo) {
          URL.revokeObjectURL(recordedVideo);
        }
        setRecordedBlob(blob);
        setRecordedVideo(URL.createObjectURL(blob));
        stopCamera();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      stopTimeoutRef.current = window.setTimeout(() => stopRecording(), 20000);
    } catch (error) {
      console.error('Erro ao iniciar gravacao da comparacao de midia:', error);
      setUploadError('Nao foi possivel acessar a camera. Verifique a permissao do navegador.');
      stopCamera();
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  };

  const handleRetake = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    setRecordedVideo(null);
    setRecordedBlob(null);
    setUploadError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Selecione um arquivo de vídeo válido.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError('O vídeo deve ter no máximo 100MB.');
      return;
    }

    if (recordedVideo) URL.revokeObjectURL(recordedVideo);
    setRecordedBlob(file);
    setRecordedVideo(URL.createObjectURL(file));
    setUploadError(null);
    // Reset input so the same file can be reselected if needed
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!recordedBlob) {
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      const videoUrl = await uploadMediaComparisonVideo(recordedBlob);
      await onVerified?.(videoUrl);
      onClose();
    } catch (error: any) {
      console.error('Erro ao enviar video de comparacao de midia:', error);
      const msg =
        error?.message ||
        error?.error_description ||
        (typeof error === 'string' ? error : null) ||
        'Erro ao enviar o video. Tente novamente.';
      setUploadError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <UploadLoadingOverlay
      show={isLoading}
      message="Enviando vídeo de verificação..."
      subMessage="Isso pode levar alguns segundos dependendo da sua conexão."
    />
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#F7F7F8] text-[#181015] md:min-h-0 md:h-[90vh] md:max-h-[90vh] md:rounded-[28px] md:shadow-2xl">
        <header className="sticky top-0 z-20 flex items-center border-b border-gray-100 bg-white p-4 shadow-sm">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#181015] transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="flex-1 pr-10 text-center text-lg font-bold tracking-[-0.015em]">
            Video de Autenticidade
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
          <section className="mb-6 text-center">
            <h1 className="mb-2 text-[24px] font-bold leading-tight tracking-tight">
              Mostre sua autenticidade em video 360
            </h1>
            <p className="mx-auto max-w-md text-[15px] leading-relaxed text-gray-500">
              Grave um video de frente para a camera, dando um giro de 360 graus no corpo. Esse
              envio sera comparado manualmente com suas midias existentes para validar a
              autenticidade e aumentar a confiabilidade do seu perfil.
            </p>
          </section>

          <section className="my-4 flex items-center justify-center">
            <div className="relative aspect-[9/16] w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-[#FF2D8D]/20 bg-gray-900 p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
              {recordedVideo ? (
                <video
                  src={recordedVideo}
                  className="absolute inset-0 h-full w-full object-cover"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted={!isRecording}
                    playsInline
                    className={`absolute inset-0 h-full w-full object-cover ${isRecording ? 'block' : 'hidden'}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!isRecording && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-3 rounded-full bg-white/10 p-4 backdrop-blur-sm">
                        <RotateCw className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-xs font-medium leading-tight text-white/90">
                        Faca um giro de 360 graus
                      </p>
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-[10px] font-mono tracking-[0.25em] text-white">
                        GRAVAR
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="my-6 flex flex-col gap-3">
            <div className="flex items-start gap-4 rounded-2xl border border-gray-50 bg-white p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FF2D8D]/20 bg-[#FF2D8D]/10 text-sm font-bold text-[#FF2D8D]">
                1
              </div>
              <div>
                <h4 className="mb-1 text-sm font-bold leading-tight">Posicione-se de frente</h4>
                <p className="text-xs leading-normal text-gray-500">
                  Fique de frente para a camera antes de iniciar a gravacao.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-gray-50 bg-white p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FF2D8D]/20 bg-[#FF2D8D]/10 text-sm font-bold text-[#FF2D8D]">
                2
              </div>
              <div>
                <h4 className="mb-1 text-sm font-bold leading-tight">Grave e gire 360 graus</h4>
                <p className="text-xs leading-normal text-gray-500">
                  Pressione para gravar e de um giro lento mostrando o corpo inteiro.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-gray-50 bg-white p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FF2D8D]/20 bg-[#FF2D8D]/10 text-sm font-bold text-[#FF2D8D]">
                3
              </div>
              <div>
                <h4 className="mb-1 text-sm font-bold leading-tight">Envie para analise</h4>
                <p className="text-xs leading-normal text-gray-500">
                  Nossa equipe fara a comparacao manual com suas midias existentes.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-auto px-5 pb-6 pt-2">
          {uploadError && <p className="mb-3 text-center text-sm text-red-500">{uploadError}</p>}

          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {recordedVideo ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FF2D8D_0%,#9B4FFF_100%)] text-[16px] font-bold text-white shadow-lg shadow-[#FF2D8D]/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando video
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    Enviar para Comparacao
                  </>
                )}
              </button>

              <button
                onClick={handleRetake}
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Gravar novamente
              </button>
            </div>
          ) : isRecording ? (
            <button
              onClick={handleRecordClick}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-500 text-[16px] font-bold text-white shadow-lg shadow-red-500/25 transition-all active:scale-[0.98]"
            >
              <Video className="h-5 w-5" />
              Parar gravacao
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRecordClick}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FF2D8D_0%,#9B4FFF_100%)] text-[16px] font-bold text-white shadow-lg shadow-[#FF2D8D]/25 transition-all active:scale-[0.98]"
              >
                <Video className="h-5 w-5" />
                Gravar agora
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#FF2D8D]/30 text-sm font-semibold text-[#FF2D8D] transition-all hover:bg-[#FF2D8D]/5 active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Enviar da galeria / arquivo
              </button>
            </div>
          )}

          <button className="mt-4 flex h-10 w-full items-center justify-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-[#FF2D8D]">
            <span>Preciso de Ajuda</span>
            <HelpCircle className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
    </>
  );
}
