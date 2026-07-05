interface PhotosSectionProps {
  photos: string[];
  getValidMediaUrl: (url: string) => string;
}

export const PhotosSection = ({ photos, getValidMediaUrl }: PhotosSectionProps) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold mb-3 text-foreground" style={{ }}>
        Fotos
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="aspect-square rounded-2xl overflow-hidden shadow-md bg-gray-100">
            <img
              src={getValidMediaUrl(photo)}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
