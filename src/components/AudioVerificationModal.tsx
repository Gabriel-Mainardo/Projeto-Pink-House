import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Play, Square, Pause, CheckCircle2, Upload, X, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AudioVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionId: string | null;
  onSaved: (audioUrl: string) => void;
}

type RecordState = 'idle' | 'recording' | 'recorded' | 'playing' | 'uploading' | 'done';

const MAX_SECONDS = 30;

export default function AudioVerificationModal({
  isOpen,
  onClose,
  companionId,
  onSaved,
}: AudioVerificationModalProps) {
  const [state, setState] = useState<RecordState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [playback, setPlayback] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      stopStream();
    };
  }, []);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const reset = () => {
    clearTimers();
    stopStream();
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setElapsed(0);
    setPlayback(0);
    setError(null);
    setState('idle');
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState('recorded');
        stopStream();
      };

      recorder.start(100);
      setState('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      setState('idle');
    }
  };

  const stopRecording = useCallback(() => {
    clearTimers();
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const playAudio = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setState('recorded');
        setPlayback(0);
        if (playTimerRef.current) clearInterval(playTimerRef.current);
      };
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setState('playing');
    setPlayback(0);

    playTimerRef.current = setInterval(() => {
      setPlayback(prev => {
        if (prev + 1 >= elapsed) {
          if (playTimerRef.current) clearInterval(playTimerRef.current);
          return elapsed;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setState('recorded');
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  };

  const uploadAudio = async () => {
    if (!audioBlob || !companionId) return;
    setError(null);
    setState('uploading');

    try {
      const ext = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
      const fileName = `${companionId}/voice-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Save audio_url to companion record
      const { error: updateError } = await supabase
        .from('acompanhantes')
        .update({ audio_url: publicUrl })
        .eq('id', companionId);

      if (updateError) throw updateError;

      setState('done');
      onSaved(publicUrl);
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar o áudio. Tente novamente.');
      setState('recorded');
    }
  };

  if (!isOpen) return null;

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const progressPercent = elapsed > 0 ? Math.round((elapsed / MAX_SECONDS) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[420px] rounded-[28px] p-7 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Áudio de Voz</h2>
            <p className="text-sm text-gray-500 mt-0.5">Grave até {MAX_SECONDS}s para que os clientes ouçam sua voz</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Mic visual + timer */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            state === 'recording'
              ? 'bg-red-100 shadow-[0_0_0_12px_rgba(239,68,68,0.12)] animate-pulse'
              : state === 'done'
              ? 'bg-green-100'
              : 'bg-pink-50'
          }`}>
            {state === 'done' ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : state === 'recording' ? (
              <Mic className="w-12 h-12 text-red-500" />
            ) : (
              <Mic className="w-12 h-12 text-[#da0b7d]" />
            )}
          </div>

          {/* Timer */}
          <div className="text-center">
            <span className="text-3xl font-mono font-bold text-gray-800 tabular-nums">
              {state === 'playing' ? formatTime(playback) : formatTime(elapsed)}
            </span>
            <span className="text-gray-400 text-sm"> / {formatTime(MAX_SECONDS)}</span>
          </div>

          {/* Progress bar */}
          {(state === 'recording' || state === 'recorded' || state === 'playing') && (
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  state === 'playing' ? 'bg-[#da0b7d]' : 'bg-red-400'
                }`}
                style={{ width: `${state === 'playing' ? Math.round((playback / elapsed) * 100) : progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Done message */}
        {state === 'done' && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold text-sm">✓ Áudio salvo com sucesso!</p>
            <p className="text-green-600 text-xs mt-1">Os clientes poderão ouvir sua voz no seu perfil.</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {state === 'idle' && (
            <button
              onClick={startRecording}
              className="w-full h-13 bg-[#da0b7d] hover:bg-[#b00965] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md py-3.5"
            >
              <Mic className="w-5 h-5" />
              Iniciar Gravação
            </button>
          )}

          {state === 'recording' && (
            <button
              onClick={stopRecording}
              className="w-full h-13 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors py-3.5"
            >
              <Square className="w-5 h-5 fill-white" />
              Parar Gravação
            </button>
          )}

          {(state === 'recorded' || state === 'playing') && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {state === 'playing' ? (
                  <button
                    onClick={pauseAudio}
                    className="h-11 rounded-xl border border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Pause className="w-4 h-4" /> Pausar
                  </button>
                ) : (
                  <button
                    onClick={playAudio}
                    className="h-11 rounded-xl border border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-gray-700" /> Ouvir
                  </button>
                )}
                <button
                  onClick={reset}
                  className="h-11 rounded-xl border border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Regravar
                </button>
              </div>
              <button
                onClick={uploadAudio}
                className="w-full h-12 bg-[#da0b7d] hover:bg-[#b00965] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Upload className="w-4 h-4" />
                Salvar Áudio no Perfil
              </button>
            </>
          )}

          {state === 'uploading' && (
            <div className="w-full h-12 bg-pink-100 rounded-xl flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#da0b7d] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#da0b7d] font-semibold text-sm">Enviando áudio...</span>
            </div>
          )}

          {state === 'done' && (
            <button
              onClick={onClose}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
            >
              Fechar
            </button>
          )}

          {state !== 'done' && (
            <p className="text-center text-xs text-gray-400">
              {state === 'idle' ? 'Opcional — você pode pular esta etapa' : 'Grave sua apresentação em até 30 segundos'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
