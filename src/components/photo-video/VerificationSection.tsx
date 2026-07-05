import React from 'react';
import { Video, Plus, Play } from 'lucide-react';

interface VerificationSectionProps {
  videoUrl?: string;
  onAdd: () => void;
  onView?: () => void;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({
  videoUrl,
  onAdd,
  onView
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-100">
      <div className="md:space-y-2 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-2 mb-1">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            <Video className="text-pink-600" size={20} />
          </div>
          <h2 className="text-lg md:text-xl text-gray-900" style={{ }}>
            Vídeo de Verificação
          </h2>
        </div>
        <p className="text-gray-500 text-xs md:text-sm md:mt-1 leading-relaxed" style={{ }}>
          Mostre sua autenticidade com um vídeo de verificação.
        </p>
      </div>

      <div className="flex items-center gap-6">
        {videoUrl ? (
          <div
            onClick={onView}
            className="w-full md:w-64 md:h-64 aspect-video md:aspect-square rounded-xl md:rounded-3xl bg-gray-300 relative group cursor-pointer overflow-hidden"
          >
            <img src={videoUrl} className="w-full h-full object-cover" alt="Verification Video" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="text-pink-600" size={24} fill="currentColor" />
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={onAdd}
            className="w-full md:w-64 md:h-64 aspect-video md:aspect-square rounded-xl md:rounded-3xl bg-pink-50 border-2 border-dashed border-pink-200 flex flex-col items-center justify-center text-center p-4 md:p-6 cursor-pointer hover:bg-pink-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-pink-400 flex items-center justify-center mb-3 md:mb-4 text-pink-500 group-hover:bg-pink-200 transition-colors">
              <Plus size={24} strokeWidth={3} />
            </div>
            <p className="text-gray-800 text-sm mb-1" style={{ }}>
              Adicionar vídeo de verificação
            </p>
            <p className="text-xs text-gray-500 mt-1 md:mt-2" style={{ }}>
              Clique aqui para fazer o upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationSection;
