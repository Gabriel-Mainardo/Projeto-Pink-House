import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface AudioSectionProps {
  audioUrl: string;
}

export const AudioSection = ({ audioUrl }: AudioSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const waveHeights = [40, 60, 30, 80, 50, 90, 40, 70, 30, 50, 20, 60, 80, 40, 30, 70, 45, 85, 35, 65, 25, 75, 55, 90, 38, 68, 42, 78, 48, 88, 32, 72, 52, 82, 44, 74, 36, 66, 46, 86, 28, 58, 62, 92, 34, 64, 54, 84, 26, 56];

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!audioUrl) return null;

  return (
    <div className="mb-8 px-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-base" style={{ }}>
        Áudio de Apresentação
      </h3>
      <div className="rounded-2xl p-4 flex items-center space-x-3" style={{ backgroundColor: '#ffe5f0' }}>
        <button
          onClick={toggleAudio}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#fe4d8e' }}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
        <div className="flex-1 h-10 flex items-center justify-center">
          <div className="w-full h-full flex items-center space-x-[2px]">
            {waveHeights.map((height, i) => {
              const progress = duration > 0 ? currentTime / duration : 0;
              const isFilled = i < Math.floor(progress * waveHeights.length);
              return (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: `${height * 0.5}px`,
                    backgroundColor: isFilled ? '#fe4d8e' : '#fec5dd'
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
        preload="metadata"
      />
    </div>
  );
};
