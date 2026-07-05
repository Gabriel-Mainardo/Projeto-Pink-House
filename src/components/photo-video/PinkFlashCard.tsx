import React from 'react';
import { Play } from 'lucide-react';

interface PinkFlashCardProps {
  videoUrl?: string;
  onChangeVideo: () => void;
  onViewVideo: () => void;
}

const PinkFlashCard: React.FC<PinkFlashCardProps> = ({
  videoUrl = "https://picsum.photos/600/400?random=pinkhair",
  onChangeVideo,
  onViewVideo
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-row gap-3 md:gap-8 items-start">
      {/* Video Thumbnail - horizontal compact on mobile, larger on desktop */}
      <div className="relative w-32 h-32 md:w-80 md:h-52 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={videoUrl}
          alt="PinkFlash Thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-pink-600 text-white text-[9px] md:text-[10px] px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider" style={{ }}>
          PinkFlash
        </div>
      </div>

      {/* Info and Actions */}
      <div className="flex-1 flex flex-col justify-between w-full md:space-y-4">
        <div>
          <h2 className="text-lg md:text-3xl text-gray-900 mb-1 md:mb-3" style={{ }}>
            Seu PinkFlash
          </h2>
          <p className="text-[#6E6E6E] text-[14px] md:text-sm leading-relaxed" style={{ }}>
            Este é o vídeo curto que aparece em destaque no seu perfil,<br className="hidden md:block"/>
            sua primeira impressão.<br className="hidden md:block"/>
            Mantenha-o sempre atualizado.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-4 mt-3 md:pt-2">
          <button
            onClick={onChangeVideo}
            className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white py-2 md:py-3 px-3 md:px-6 rounded-lg md:rounded-xl text-xs md:text-sm transition-all shadow-sm md:shadow-md md:shadow-pink-200"
            style={{ }}
          >
            Trocar PinkFlash
          </button>
          <button
            onClick={onViewVideo}
            className="w-full md:w-auto bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 md:py-3 px-3 md:px-6 rounded-lg md:rounded-xl text-xs md:text-sm transition-all"
            style={{ }}
          >
            Visualizar PinkFlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinkFlashCard;
