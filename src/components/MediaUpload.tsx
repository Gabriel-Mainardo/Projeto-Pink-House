import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle, Play } from 'lucide-react';
import { imageService, supabase } from '../lib/supabase';

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

interface MediaUploadProps {
  onMediaUploaded: (media: MediaFile[]) => void;
  maxItems?: number;
  existingMedia?: MediaFile[];
  className?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUploaded,
  maxItems = 8,
  existingMedia = [],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>(existingMedia);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxItems - media.length;
    
    if (fileArray.length > remainingSlots) {
      setError(`Você pode adicionar no máximo ${remainingSlots} arquivo(s) a mais.`);
      return;
    }

    // Validar tipos de arquivo
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm', 'video/ogg'];
    const validTypes = [...validImageTypes, ...validVideoTypes];
    
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      console.log('❌ Tipos de arquivo inválidos:', invalidFiles.map(f => f.type));
      setError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, WebP) ou vídeo (MP4, MOV, M4V).');
      return;
    }

    // Validar tamanho dos arquivos
    const maxImageSize = 50 * 1024 * 1024; // 50MB para imagens
    const maxVideoSize = 150 * 1024 * 1024; // 150MB para vídeos
    
    const oversizedFiles = fileArray.filter(file => {
      const isVideoFile = validVideoTypes.includes(file.type);
      const maxSize = isVideoFile ? maxVideoSize : maxImageSize;
      const isTooLarge = file.size > maxSize;
      
      if (isTooLarge) {
        console.log(`❌ Arquivo muito grande: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
      
      return isTooLarge;
    });
    
    if (oversizedFiles.length > 0) {
      setError('Alguns arquivos são muito grandes. Máximo: 50MB para imagens, 150MB para vídeos.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedMedia: MediaFile[] = [];

      for (const file of fileArray) {
        const isVideo = validVideoTypes.includes(file.type);
        const folder = isVideo ? 'videos' : 'gallery';
        
        // Log detalhado do arquivo
        console.log(`📁 Processando arquivo:`, {
          nome: file.name,
          tipo: file.type,
          tamanho: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          isVideo
        });
        
        // Sanitizar nome do arquivo (remover caracteres especiais e espaços)
        const sanitizedName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_') // Substituir caracteres especiais por underscore
          .replace(/\s+/g, '_') // Substituir espaços por underscore
          .replace(/_{2,}/g, '_') // Substituir múltiplos underscores por um só
          .toLowerCase(); // Converter para minúsculas
        
        const fileName = `${folder}_${Date.now()}_${sanitizedName}`;
        const filePath = `${folder}/${fileName}`;

        // Validação adicional para vídeos
        if (isVideo) {
          // Verificar se o formato é realmente suportado
          const isSupportedFormat = file.type.includes('mp4') || 
                                  file.type.includes('quicktime') || 
                                  file.type.includes('x-m4v') || 
                                  file.type.includes('webm') || 
                                  file.type.includes('ogg');
                                  
          if (!isSupportedFormat) {
            console.log(`❌ Formato de vídeo não suportado: ${file.type}`);
            throw new Error(`Formato de vídeo não suportado: ${file.type}. Use MP4, MOV ou M4V.`);
          }
          
          console.log(`📹 Upload de vídeo: ${sanitizedName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }

        // Upload para o bucket correto (videos ou images)
        const { data, error } = await supabase.storage
          .from(isVideo ? 'videos' : 'images')
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type // Definir explicitamente o tipo de conteúdo
          });

        if (error) {
          console.error('❌ Erro no upload:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(isVideo ? 'videos' : 'images')
          .getPublicUrl(filePath);

        uploadedMedia.push({
          url: publicUrl,
          type: isVideo ? 'video' : 'image',
          name: sanitizedName
        });
        
        console.log(`✅ Upload concluído: ${publicUrl}`);
      }

      const newMedia = [...media, ...uploadedMedia];
      setMedia(newMedia);
      onMediaUploaded(newMedia);
    } catch (err: any) {
      console.error('❌ Erro no upload:', err);
      setError(err.message || 'Erro ao fazer upload dos arquivos. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [media, maxItems, onMediaUploaded]);

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

  const removeMedia = useCallback(async (indexToRemove: number) => {
    const mediaToRemove = media[indexToRemove];
    
    try {
      // Remover do storage se não era um arquivo existente
      const wasExisting = existingMedia.some(existing => existing.url === mediaToRemove.url);
      if (!wasExisting) {
        // Extrair o caminho do arquivo da URL para deletar
        const urlParts = mediaToRemove.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const folder = mediaToRemove.type === 'video' ? 'videos' : 'gallery';
        
        await supabase.storage
          .from(mediaToRemove.type === 'video' ? 'videos' : 'images')
          .remove([`${folder}/${fileName}`]);
      }
      
      const newMedia = media.filter((_, index) => index !== indexToRemove);
      setMedia(newMedia);
      onMediaUploaded(newMedia);
    } catch (err) {
      console.error('Erro ao remover arquivo:', err);
      // Mesmo com erro, remove da lista local
      const newMedia = media.filter((_, index) => index !== indexToRemove);
      setMedia(newMedia);
      onMediaUploaded(newMedia);
    }
  }, [media, existingMedia, onMediaUploaded]);

  const imageCount = media.filter(m => m.type === 'image').length;
  const videoCount = media.filter(m => m.type === 'video').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-velvet-pink-500 bg-velvet-pink-50'
            : 'border-gray-300 hover:border-velvet-pink-400'
        } ${media.length >= maxItems ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || media.length >= maxItems}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-velvet-pink-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-6 h-6 text-gray-400" />
                <Video className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-velvet-pink-600">Clique para selecionar</span> ou arraste imagens e vídeos aqui
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Imagens: PNG, JPG, WebP até 50MB • Vídeos: MP4, MOV, M4V até 150MB
                </p>
                <p className="text-xs text-gray-500">
                  Máximo {maxItems} arquivos no total
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

      {/* Preview dos Arquivos */}
      {media.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            Galeria ({imageCount} imagens, {videoCount} vídeos) - {media.length}/{maxItems}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((mediaFile, index) => (
              <div key={index} className="relative group">
                {mediaFile.type === 'image' ? (
                  <img
                    src={mediaFile.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/default-profile.png";
                    }}
                  />
                ) : (
                  <div className="relative w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <video
                      src={mediaFile.url}
                      className="w-full h-full object-cover rounded-lg"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remover arquivo"
                >
                  <X className="w-3 h-3" />
                </button>
                
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {mediaFile.type === 'video' ? 'Vídeo' : (index === 0 ? 'Principal' : 'Foto')}
                </div>
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

export default MediaUpload; 