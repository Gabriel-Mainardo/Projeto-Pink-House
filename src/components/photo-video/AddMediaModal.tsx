import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'photo' | 'video' | 'pinkflash' | 'verification';
  onUpload: (file: File, caption?: string) => void;
}

const AddMediaModal: React.FC<AddMediaModalProps> = ({
  isOpen,
  onClose,
  type,
  onUpload
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedFile) return;

    setIsGeneratingCaption(true);
    try {
      // Simulated AI caption generation
      // In production, this would call Gemini API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCaption('Linda foto! ✨ Disponível agora para atendimento. Entre em contato!');
    } catch (error) {
      console.error('Error generating caption:', error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, caption);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCaption('');
    setPreviewUrl('');
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'photo': return 'Adicionar Foto';
      case 'video': return 'Adicionar Vídeo';
      case 'pinkflash': return 'Trocar PinkFlash';
      case 'verification': return 'Vídeo de Verificação';
      default: return 'Adicionar Mídia';
    }
  };

  const acceptTypes = type === 'photo' ? 'image/*' : 'video/*';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg text-gray-900" style={{ }}>
            {getTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-700 mb-2" style={{ }}>
              {type === 'photo' ? 'Selecionar foto' : 'Selecionar vídeo'}
            </label>
            <div className="relative">
              <input
                type="file"
                accept={acceptTypes}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="w-full aspect-video rounded-xl border-2 border-dashed border-pink-200 bg-pink-50 hover:bg-pink-100 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Upload className="text-pink-500 mb-2" size={32} />
                    <p className="text-sm text-gray-700" style={{ }}>
                      Clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500 mt-1" style={{ }}>
                      {type === 'photo' ? 'JPG, PNG até 10MB' : 'MP4 até 50MB'}
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Caption (only for photos and videos) */}
          {(type === 'photo' || type === 'video') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700" style={{ }}>
                  Legenda (opcional)
                </label>
                {selectedFile && (
                  <button
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingCaption}
                    className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 transition-colors disabled:opacity-50"
                    style={{ }}
                  >
                    <Sparkles size={14} />
                    {isGeneratingCaption ? 'Gerando...' : 'Gerar com IA'}
                  </button>
                )}
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Adicione uma legenda atraente..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none resize-none text-sm"
                style={{ }}
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className="flex-1 py-3 px-4 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ }}
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMediaModal;
