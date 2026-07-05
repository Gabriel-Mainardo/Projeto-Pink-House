import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, X, ShieldCheck, Plus, Camera, Info, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from './UploadLoadingOverlay';

interface PhotoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (photoUrls: string[]) => Promise<void> | void;
}

async function uploadVerificationPhoto(file: File, index: number): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `verification/${Date.now()}_${index}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(filename, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filename);
  return data.publicUrl;
}

export default function PhotoVerificationModal({ isOpen, onClose, onVerified }: PhotoVerificationModalProps) {
  const [photos, setPhotos] = useState<string[]>([]);         // base64 previews
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);   // real files for upload
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxPhotos = 5;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      setPhotoFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = () => {
    if (photos.length < maxPhotos && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (photoFiles.length === 0) return;
    setIsLoading(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(
        photoFiles.map((file, i) => uploadVerificationPhoto(file, i))
      );
      await onVerified?.(urls);
      onClose();
    } catch (err: any) {
      console.error('Erro ao enviar fotos:', err);
      setUploadError(err?.message || 'Erro ao enviar fotos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const emptySlots = Math.max(0, Math.min(2, maxPhotos - photos.length));

  return (
    <>
    <UploadLoadingOverlay
      show={isLoading}
      message="Enviando fotos..."
      subMessage="Estamos fazendo upload das suas fotos. Por favor, aguarde."
    />
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative flex h-full min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#F7F7F8] md:min-h-0 md:h-[90vh] md:max-h-[90vh] md:rounded-[28px] md:shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center bg-[#F7F7F8]/95 backdrop-blur-sm p-4 pb-2 justify-between">
          <button
            onClick={onClose}
            className="text-gray-800 flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10" style={{ }}>
            Enviar Fotos Reais
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-40 md:pb-36">

          {/* Hero Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#d91d83]/10 mb-4 mx-auto">
              <ShieldCheck className="w-7 h-7 text-[#d91d83]" />
            </div>
            <h2 className="text-gray-900 tracking-tight text-[22px] font-bold leading-tight text-center mb-3" style={{ }}>
              Mostre sua autenticidade
            </h2>
            <p className="text-gray-500 text-sm font-normal leading-relaxed text-center" style={{ }}>
              Envie fotos recentes e nítidas para aumentar a confiabilidade do seu perfil e ganhar mais visibilidade e interações.
            </p>
          </div>

          {/* Upload Grid */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-gray-900 tracking-tight text-lg font-bold leading-tight" style={{ }}>
                Suas fotos
              </h3>
              <span className="text-[#d91d83] font-semibold text-sm" style={{ }}>
                {photos.length}/{maxPhotos}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Uploaded Photos */}
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <button
                  key={`empty-${index}`}
                  onClick={handleAddPhoto}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-[#d91d83]/50 hover:bg-[#d91d83]/5 transition-colors group"
                >
                  {index === 0 ? (
                    <Camera className="w-6 h-6 text-gray-300 group-hover:text-[#d91d83]" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-300 group-hover:text-[#d91d83]" />
                  )}
                </button>
              ))}
            </div>

            {/* Info Tip */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600 leading-tight" style={{ }}>
                Dica: Fotos de rosto com boa iluminação recebem 3x mais interações.
              </p>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none flex flex-col gap-3">
          <div className="pointer-events-auto w-full">
            {uploadError && (
              <p className="text-red-500 text-sm text-center mb-3">{uploadError}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading || photoFiles.length === 0}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white font-bold text-base shadow-lg shadow-[#d91d83]/30 hover:shadow-[#d91d83]/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Enviar Fotos</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button className="w-full mt-4 flex items-center justify-center gap-1.5 text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors" style={{ }}>
              <BookOpen className="w-4 h-4" />
              Regras de Fotos
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
