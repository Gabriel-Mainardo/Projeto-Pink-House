import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CreditCard, Car, Plane, Camera, ImagePlus, Info, Lock, ArrowRight, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from './UploadLoadingOverlay';

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (documentType: string, frontUrl: string, backUrl: string) => Promise<void> | void;
}

type DocumentType = 'rg' | 'cnh' | 'passport';

async function uploadDocumentFile(file: File, side: 'front' | 'back'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `documents/${side}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(filename, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filename);
  return data.publicUrl;
}

export default function DocumentVerificationModal({ isOpen, onClose, onVerified }: DocumentVerificationModalProps) {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('rg');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);   // preview (base64)
  const [backPhoto, setBackPhoto] = useState<string | null>(null);     // preview (base64)
  const [frontFile, setFrontFile] = useState<File | null>(null);       // real file for upload
  const [backFile, setBackFile] = useState<File | null>(null);         // real file for upload
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleFrontPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFrontFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFrontPhoto(event.target.result as string);
        setTimeout(() => {
          backSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setBackPhoto(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!frontFile || !backFile) return;
    setIsLoading(true);
    setUploadError(null);
    try {
      const [frontUrl, backUrl] = await Promise.all([
        uploadDocumentFile(frontFile, 'front'),
        uploadDocumentFile(backFile, 'back'),
      ]);
      await onVerified?.(selectedDocType, frontUrl, backUrl);
      onClose();
    } catch (err: any) {
      console.error('Erro ao enviar documento:', err);
      setUploadError(err?.message || 'Erro ao enviar arquivos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const documentTypes = [
    { id: 'rg' as DocumentType, label: 'RG', icon: CreditCard },
    { id: 'cnh' as DocumentType, label: 'CNH', icon: Car },
    { id: 'passport' as DocumentType, label: 'Passaporte', icon: Plane },
  ];

  if (!isOpen) return null;

  return (
    <>
    <UploadLoadingOverlay
      show={isLoading}
      message="Enviando documento..."
      subMessage="Estamos fazendo upload das imagens. Por favor, aguarde."
    />
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-full min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#F7F7F8]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center bg-[#F7F7F8]/95 backdrop-blur-sm p-4 pb-2 justify-between">
          <button
            onClick={onClose}
            className="text-gray-800 flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10" style={{ }}>
            Verificar Documento
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-[#d91d83]" style={{ }}>Passo 2 de 4</span>
            <span className="text-xs text-gray-500" style={{ }}>50%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-[#d91d83] to-[#9C27B0]"></div>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 pt-4 pb-32 flex flex-col gap-6">

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900" style={{ }}>
              Verifique seu documento de identidade
            </h2>
            <p className="text-sm text-gray-500 mt-1" style={{ }}>
              Tenha seu RG, CNH ou Passaporte em mãos. Garanta boa iluminação e evite reflexos.
            </p>
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="text-sm font-bold mb-2 block text-gray-900" style={{ }}>
              Tipo de documento
            </label>
            <div className="grid grid-cols-3 gap-3">
              {documentTypes.map((doc) => {
                const IconComponent = doc.icon;
                const isSelected = selectedDocType === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocType(doc.id)}
                    className={`h-28 rounded-2xl bg-white border-2 shadow-sm flex flex-col items-center justify-center gap-2 transition-all ${
                      isSelected ? 'border-[#d91d83] bg-pink-50' : 'border-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900" style={{ }}>
                      {doc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="flex flex-col gap-4">

            {/* Front Photo */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-gray-900" style={{ }}>
                  Frente do Documento
                </span>
                <span className="text-xs text-[#d91d83] flex items-center gap-1" style={{ }}>
                  <Info className="w-4 h-4" /> Dicas
                </span>
              </div>

              {frontPhoto ? (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden">
                  <img src={frontPhoto} alt="Frente do documento" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFrontPhoto(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => frontInputRef.current?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-[#d91d83]/40 bg-white hover:bg-[#d91d83]/5 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#d91d83]/10 flex items-center justify-center text-[#d91d83]">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-[#d91d83]" style={{ }}>
                    Tirar foto da frente
                  </span>
                </button>
              )}
            </div>

            {/* Back Photo */}
            <div ref={backSectionRef}>
              <span className="text-sm font-bold block mb-1 text-gray-900" style={{ }}>
                Verso do Documento
              </span>

              {backPhoto ? (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden">
                  <img src={backPhoto} alt="Verso do documento" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setBackPhoto(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => backInputRef.current?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500" style={{ }}>
                    Tirar foto do verso
                  </span>
                </button>
              )}
            </div>

          </div>

          {/* Security Notice */}
          <div className="flex justify-center items-center gap-2 opacity-70">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500" style={{ }}>
              Seus dados estão protegidos e criptografados.
            </span>
          </div>

        </div>

        {/* Hidden File Inputs */}
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFrontPhotoSelect}
          className="hidden"
        />
        <input
          ref={backInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleBackPhotoSelect}
          className="hidden"
        />

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none flex flex-col gap-3">
          <div className="pointer-events-auto w-full">
            {uploadError && (
              <p className="text-red-500 text-sm text-center mb-3">{uploadError}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !frontFile || !backFile}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white font-bold text-base shadow-lg shadow-[#d91d83]/30 hover:shadow-[#d91d83]/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Enviar Documento</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button className="w-full mt-4 flex items-center justify-center gap-1.5 text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors" style={{ }}>
              <HelpCircle className="w-4 h-4" />
              Preciso de Ajuda
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
