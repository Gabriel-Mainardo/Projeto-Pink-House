import React from 'react';
import { Plus, Video } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  prompt?: string;
  size?: string;
}

interface MediaGridProps {
  items: MediaItem[];
  type: 'photo' | 'video';
  onAdd: () => void;
  onItemClick?: (item: MediaItem) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  type,
  onAdd,
  onItemClick
}) => {
  // Mobile: 3 cols for both photos and videos
  // Desktop: 4 cols for photos, 3 cols for videos
  const gridCols = type === 'photo' ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-3 md:grid-cols-3';
  const aspectRatio = 'aspect-[3/4]'; // Same aspect ratio for both
  const gap = 'gap-3 md:gap-6';

  return (
    <div className={`grid ${gridCols} ${gap}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`${aspectRatio} rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100 group relative cursor-pointer`}
          onClick={() => onItemClick?.(item)}
        >
          <img
            src={item.url}
            alt={item.prompt || 'Media'}
            className="w-full h-full object-cover"
          />

          {type === 'video' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Video className="text-pink-600" size={20} />
              </div>
            </div>
          )}

          {item.prompt && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-white text-xs truncate" style={{ }}>
                {item.size || item.prompt}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Add New Button */}
      <div
        onClick={onAdd}
        className={`${aspectRatio} rounded-xl bg-pink-50 border-2 border-dashed border-pink-200 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors group`}
      >
        <div className="w-10 h-10 rounded-full border-2 border-pink-400 flex items-center justify-center mb-2 text-pink-500 group-hover:bg-pink-200 transition-colors">
          <Plus size={20} strokeWidth={3} />
        </div>
        <p className="text-gray-800 text-xs px-2 text-center" style={{ }}>
          Adicionar {type === 'photo' ? 'foto' : 'vídeo'}
        </p>
      </div>
    </div>
  );
};

export default MediaGrid;
