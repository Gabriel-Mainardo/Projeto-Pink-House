import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

interface VoicePlayerProps {
  audioUrl: string;
  companionName?: string;
  isDemo?: boolean;
}

export default function VoicePlayer({ audioUrl, companionName, isDemo = false }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Initialize audio and event listeners
  useEffect(() => {
    if (!audioUrl) {
      setIsLoading(false);
      setError(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    setIsLoading(true);
    setError(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    // Support browsers where loadedmetadata might fire immediately or is already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Also trigger load just in case
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioUrl || !audioRef.current || isLoading || error) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Handle play promise rejection (e.g. user interaction required, though they just clicked)
      });
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioUrl || !audioRef.current || !progressRef.current || duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = Math.max(0, Math.min(1, clickX / width));
    
    const newTime = clickRatio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Generate 24 pseudo-soundwave bars
  const waveBarsCount = 24;
  const progressRatio = duration > 0 ? currentTime / duration : 0;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-red-400 flex-shrink-0" />
        <span className="text-xs text-red-700 font-medium">Erro ao carregar a mensagem de voz.</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-pink-50/50 to-pink-50 border border-pink-100 rounded-2xl p-4 shadow-sm select-none">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading || !audioUrl}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none ${
            !audioUrl
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
              : isLoading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isPlaying
              ? 'bg-pink-600 hover:bg-pink-700 text-white hover:scale-105 active:scale-95'
              : 'bg-[#d91d83] hover:bg-[#b00965] text-white hover:scale-105 active:scale-95'
          }`}
          aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Info & Waveform */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold truncate ${!audioUrl ? 'text-gray-400' : 'text-gray-700'}`}>
              {!audioUrl ? 'Nenhuma mensagem de voz cadastrada' : isDemo ? 'Mensagem de Voz' : companionName ? `Voz de ${companionName}` : 'Mensagem de Voz'}
            </span>
            <span className="text-[10px] font-mono text-gray-500 tabular-nums ml-auto">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Soundwave Progress Container */}
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex items-center gap-0.5 h-6 cursor-pointer group"
          >
            {Array.from({ length: waveBarsCount }).map((_, idx) => {
              // Generate pseudo random heights for a nice wave shape
              const heights = [
                25, 40, 60, 35, 50, 75, 45, 80, 
                90, 60, 45, 70, 85, 55, 30, 45, 
                60, 75, 50, 65, 40, 55, 30, 20
              ];
              const barHeightPercent = heights[idx % heights.length];
              const barProgressThreshold = idx / waveBarsCount;
              const isFilled = progressRatio >= barProgressThreshold;

              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    !audioUrl
                      ? 'bg-gray-200'
                      : isFilled 
                      ? 'bg-[#d91d83] scale-y-110' 
                      : 'bg-pink-200 group-hover:bg-pink-300'
                  }`}
                  style={{
                    height: `${barHeightPercent}%`,
                    minWidth: '2px',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
