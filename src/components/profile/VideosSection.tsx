import { Play } from "lucide-react";

interface VideosSectionProps {
  videos: string[];
}

export const VideosSection = ({ videos }: VideosSectionProps) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold mb-3 text-foreground" style={{ }}>
        Vídeos
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {videos.map((video, index) => (
          <div key={index} className="aspect-video rounded-2xl overflow-hidden shadow-md relative bg-black">
            <video src={video} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
