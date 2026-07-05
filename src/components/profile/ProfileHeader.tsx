import { ArrowLeft, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileHeaderProps {
  name: string;
  age?: number;
  location: string;
  imageUrl: string;
  coverImageUrl?: string;
  onBack: () => void;
}

export const ProfileHeader = ({ name, age, location, imageUrl, coverImageUrl, onBack }: ProfileHeaderProps) => {
  return (
    <>
      {/* Cover Photo */}
      <div className="relative w-full h-48" style={{ background: 'linear-gradient(to bottom right, #fec5dd, #fe4d8e)' }}>
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(to bottom right, #fec5dd, #fe4d8e, #fc3d7e)' }}></div>
        )}

        {/* Sticky Header - Over Cover Photo */}
        <div className="absolute top-0 left-0 right-0 px-4 flex items-start justify-between z-40">
          <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full bg-white/80 backdrop-blur-sm mt-3">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-black/10 rounded-full bg-white/80 backdrop-blur-sm mt-20">
            <Heart className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Profile Info Container */}
      <div className="px-4 pt-4 pb-4 -mt-12 relative">
        {/* Profile Photo */}
        <div className="mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-[4px] border-white shadow-lg bg-white" style={{ borderColor: 'white' }}>
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name with Verification */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-semibold text-foreground" style={{ }}>
            {name}
          </h1>
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center p-1">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-2 font-normal" style={{ }}>
          {age} anos, {location}
        </p>

        {/* Status de Disponibilidade */}
        <div className="flex items-center mb-4">
          <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
          <span className="text-xs font-bold uppercase tracking-wide text-green-600" style={{ }}>
            Disponível
          </span>
        </div>

        {/* Trust Progress */}
        <div className="mb-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-900" style={{ }}>
              Confiabilidade
            </span>
            <span className="text-sm font-bold" style={{ }}>
              95%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-1.5 rounded-full w-[95%]" style={{ backgroundColor: '#fe4d8e' }}></div>
          </div>
        </div>

        {/* Verification Text */}
        <p className="text-xs text-center text-muted-foreground mt-2 mb-4 font-normal" style={{ }}>
          Esse perfil cumpriu todas etapas de verificação
        </p>
      </div>
    </>
  );
};
