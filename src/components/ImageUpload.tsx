import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { imageService } from '../lib/supabase';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  maxImages = 6,
  existingImages = [],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      setError(`Você pode adicionar no máximo ${remainingSlots} imagem(ns) a mais.`);
      return;
    }

    // Validar tipos de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, WebP, GIF).');
      return;
    }

    // Validar tamanho dos arquivos (máximo 50MB cada)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError('Algumas imagens são muito grandes. Tamanho máximo: 50MB por imagem.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload das imagens
      const uploadedUrls = await imageService.uploadMultipleImages(fileArray, 'gallery');
      const newImages = [...images, ...uploadedUrls];
      
      setImages(newImages);
      onImagesUploaded(newImages);
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload das imagens. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeImage = useCallback(async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    
    try {
      // Remover do storage se não era uma imagem existente
      if (!existingImages.includes(imageToRemove)) {
        await imageService.deleteImage(imageToRemove);
      }
      
      const newImages = images.filter((_, index) => index !== indexToRemove);
      setImages(newImages);
      onImagesUploaded(newImages);
    } catch (err) {
      console.error('Erro ao remover imagem:', err);
      // Mesmo com erro, remove da lista local
      const newImages = images.filter((_, index) => index !== indexToRemove);
      setImages(newImages);
      onImagesUploaded(newImages);
    }
  }, [images, existingImages, onImagesUploaded]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-velvet-pink-500 bg-velvet-pink-50'
            : 'border-gray-300 hover:border-velvet-pink-400'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-velvet-pink-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-velvet-pink-600">Clique para selecionar</span> ou arraste as imagens aqui
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP, GIF até 50MB cada • Máximo {maxImages} imagens
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            Galeria de Imagens ({images.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-profile.png";
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remover imagem"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            * A primeira imagem será usada como foto principal do perfil
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 