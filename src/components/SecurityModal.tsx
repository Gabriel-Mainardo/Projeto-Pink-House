import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, FileSearch, Loader2, MapPin, Navigation, X } from 'lucide-react';
import { DURATION_OPTIONS, durationToLabel } from '../lib/security-steps';

interface SecurityModalProps {
  isOpen: boolean;
  mode: 'configure' | 'confirm';
  onClose: () => void;
  onConfigure?: (location: string, duration: string) => void | Promise<void>;
  onConfirmCheckin?: (payload: {
    latitude?: number | null;
    longitude?: number | null;
    note?: string;
  }) => void | Promise<void>;
  initialLocation?: string | null;
  initialDuration?: string | null;
}

const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  mode,
  onClose,
  onConfigure,
  onConfirmCheckin,
  initialLocation,
  initialDuration,
}) => {
  const [location, setLocation] = useState(initialLocation || '');
  const [duration, setDuration] = useState(initialDuration || '');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const durationLabel = useMemo(() => durationToLabel(initialDuration), [initialDuration]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLocation(initialLocation || '');
    setDuration(initialDuration || '');
    setNote('');
    setIsLoading(false);
    setIsDone(false);
    setError(null);
    setCoords(null);
  }, [initialDuration, initialLocation, isOpen, mode]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfigure = async () => {
    if (!location.trim() || !duration) {
      setError('Preencha local e duracao antes de continuar.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await onConfigure?.(location.trim(), duration);
      setIsDone(true);
    } catch (reason) {
      console.error(reason);
      setError('Nao foi possivel salvar a configuracao agora.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCheckin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const nextCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCoords(nextCoords);
      await onConfirmCheckin?.({
        ...nextCoords,
        note: note.trim(),
      });
      setIsDone(true);
    } catch (reason) {
      console.error(reason);
      setError('Nao foi possivel obter sua localizacao. Verifique a permissao do navegador.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div
        className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl relative"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'configure' ? 'Fluxo configurado' : 'Check-in confirmado'}
          </h2>
          <p className="text-gray-600 mb-6">
            {mode === 'configure'
              ? 'Local, duracao e monitoramento foram vinculados a conversa.'
              : 'Sua localizacao foi registrada e o tempo de monitoramento foi iniciado.'}
          </p>

          {coords && (
            <p className="text-xs text-gray-400 mb-6">
              {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-200"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center px-8 pt-8 pb-2">
          <div className="flex-1 text-center">
            <h3 className="text-lg font-bold text-gray-900">
              {mode === 'configure' ? 'Etapa de seguranca' : 'Confirmar check-in'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="absolute right-8 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-8 pb-10 flex flex-col items-center">
          <div className="my-6">
            <div className="relative">
              {mode === 'configure' ? (
                <FileSearch size={64} className="text-pink-500" strokeWidth={2} />
              ) : (
                <Navigation size={64} className="text-pink-500" strokeWidth={2} />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-gray-900 leading-tight mb-4">
            {mode === 'configure'
              ? 'Configurar check-in e monitoramento'
              : 'Registrar chegada no local'}
          </h1>

          <p className="text-center text-gray-500 text-sm mb-8 leading-relaxed px-2">
            {mode === 'configure'
              ? 'Defina o local combinado e a duracao esperada para acompanhar a conversa com mais contexto.'
              : 'Compartilhe sua localizacao atual para confirmar sua chegada no ponto combinado.'}
          </p>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600">
              {error}
            </div>
          )}

          {mode === 'configure' ? (
            <div className="w-full space-y-4 mb-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="text-pink-500" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Local combinado (hotel, motel, ap...)"
                  className="w-full bg-pink-50 text-gray-700 placeholder-gray-500 text-sm rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all border border-transparent focus:border-pink-300"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="text-pink-500" size={20} />
                </div>
                <select
                  className="w-full bg-pink-50 text-gray-700 text-sm rounded-xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all border border-transparent focus:border-pink-300 appearance-none cursor-pointer"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="">Selecione a duracao</option>
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="text-pink-500" size={20} />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 mb-6">
              <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-2">
                  Local esperado
                </p>
                <p className="text-sm text-gray-700">{initialLocation || 'Local nao informado'}</p>
              </div>

              <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-2">
                  Duracao prevista
                </p>
                <p className="text-sm text-gray-700">{durationLabel || 'Duracao nao informada'}</p>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Observacao opcional para o check-in"
                className="w-full bg-pink-50 text-gray-700 placeholder-gray-500 text-sm rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all border border-transparent focus:border-pink-300 resize-none"
              />
            </div>
          )}

          <button
            onClick={() => void (mode === 'configure' ? handleConfigure() : handleConfirmCheckin())}
            disabled={isLoading}
            className="w-full bg-[#FF4D8D] hover:bg-[#ff337a] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-200 mb-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : mode === 'configure' ? (
              'Salvar configuracao'
            ) : (
              'Confirmar chegada e compartilhar localizacao'
            )}
          </button>

          <button
            onClick={onClose}
            className="text-gray-600 font-medium text-sm hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
