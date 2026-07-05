interface StoriesSectionProps {
  photos: string[];
  getValidMediaUrl: (url: string) => string;
}

export const StoriesSection = ({ photos, getValidMediaUrl }: StoriesSectionProps) => {
  if (!photos || photos.length === 0) return null;

  const storiesToShow = photos.slice(0, 4);

  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold mb-3 text-foreground" style={{ }}>
        Stories
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {storiesToShow.map((photo, index) => (
          <div key={index} className="flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-[2px] border-2" style={{ borderColor: '#fe4d8e' }}>
              <img
                src={getValidMediaUrl(photo)}
                className="w-full h-full rounded-full object-cover"
                alt={`Story ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
