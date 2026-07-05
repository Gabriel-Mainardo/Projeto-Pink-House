import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Check,
  Info,
  Loader2,
  Plus,
  Save,
  Smartphone,
  Star,
  Trash2,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { acompanhantesService, supabase, type Acompanhante } from '../lib/supabase';
import UploadLoadingOverlay from '../components/UploadLoadingOverlay';

// ── helpers ──────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadFile(file: File, bucket: 'images' | 'videos', folder: string): Promise<string> {
  const filename = `${folder}_${Date.now()}_${sanitizeFilename(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

async function deleteFile(url: string, bucket: 'images' | 'videos') {
  try {
    const parts = url.split(`/${bucket}/`);
    if (parts.length < 2) return;
    await supabase.storage.from(bucket).remove([parts[1]]);
  } catch {
    // best-effort
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 ${className || ''}`}>
    {children}
  </div>
);

interface MediaThumbProps {
  url: string;
  type: 'image' | 'video';
  isMain?: boolean;
  onDelete: () => void;
  onSetMain?: () => void;
}

const MediaThumb: React.FC<MediaThumbProps> = ({ url, type, isMain, onDelete, onSetMain }) => (
  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group bg-gray-100">
    {type === 'image' ? (
      <img src={url} alt="" className="w-full h-full object-cover" />
    ) : (
      <video src={url} className="w-full h-full object-cover" muted playsInline />
    )}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onDelete}
        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        title="Remover"
      >
        <Trash2 size={14} />
      </button>
      {onSetMain && !isMain && (
        <button
          onClick={onSetMain}
          className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          title="Definir como principal"
        >
          <Star size={14} />
        </button>
      )}
    </div>
    {isMain && (
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-pink-100">
        <Star size={10} className="text-[#d91d83] fill-[#d91d83]" />
        <span className="text-[9px] font-bold text-[#d91d83] uppercase tracking-wider">Principal</span>
      </div>
    )}
  </div>
);

interface AddButtonProps {
  type: 'image' | 'video';
  uploading: boolean;
  onFiles: (files: FileList) => void;
}

const AddButton: React.FC<AddButtonProps> = ({ type, uploading, onFiles }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={type === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/quicktime,video/webm'}
        multiple={type === 'image'}
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 group hover:border-pink-300 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={24} className="text-pink-400 animate-spin" />
        ) : (
          <>
            <div className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:text-pink-400 transition-colors">
              {type === 'image' ? <Camera size={22} /> : <Video size={22} />}
            </div>
            <span className="text-xs font-semibold text-gray-400 group-hover:text-pink-400">Adicionar</span>
          </>
        )}
      </button>
    </>
  );
};

// ── page ──────────────────────────────────────────────────────────────────────

const PhotoVideoManager: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Acompanhante | null>(null);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // local copies of media lists (editing state)
  const [gallery, setGallery] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [videos, setVideos] = useState<string[]>([]);

  // ── load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    try {
      const userData = JSON.parse(stored);
      const id = userData.companionId || userData.id;
      if (!id) { navigate('/login'); return; }
      setCompanionId(id);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!companionId) return;
    acompanhantesService.getById(companionId)
      .then((data) => {
        setProfile(data);
        setGallery(data.gallery || []);
        setMainImage(data.image || '');
        setVideos(data.videos || []);
      })
      .catch(() => showToast('Erro ao carregar perfil', 'error'))
      .finally(() => setLoading(false));
  }, [companionId]);

  // ── toast ────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── photo handlers ────────────────────────────────────────────────────────
  const handleAddPhotos = async (files: FileList) => {
    setUploadingPhoto(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) { showToast('Foto muito grande (máx 50 MB)', 'error'); continue; }
        const url = await uploadFile(file, 'images', 'gallery');
        urls.push(url);
      }
      if (urls.length === 0) return;
      setGallery((prev) => {
        const next = [...prev, ...urls];
        if (!mainImage) setMainImage(next[0]);
        return next;
      });
      showToast(`${urls.length} foto(s) adicionada(s)`, 'success');
    } catch {
      showToast('Erro ao fazer upload da foto', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (url: string) => {
    setGallery((prev) => prev.filter((u) => u !== url));
    if (mainImage === url) setMainImage(gallery.find((u) => u !== url) || '');
    await deleteFile(url, 'images');
  };

  const handleSetMainImage = (url: string) => setMainImage(url);

  // ── video handlers ────────────────────────────────────────────────────────
  const handleAddVideo = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) { showToast('Vídeo muito grande (máx 150 MB)', 'error'); return; }
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, 'videos', 'videos');
      setVideos((prev) => [...prev, url]);
      showToast('Vídeo adicionado', 'success');
    } catch {
      showToast('Erro ao fazer upload do vídeo', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (url: string) => {
    setVideos((prev) => prev.filter((u) => u !== url));
    await deleteFile(url, 'videos');
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!companionId) return;
    setSaving(true);
    try {
      await acompanhantesService.update(companionId, {
        gallery,
        image: mainImage,
        videos,
      });
      showToast('Salvo com sucesso!', 'success');
    } catch {
      showToast('Erro ao salvar. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="text-[#d91d83] animate-spin" />
      </div>
    );
  }

  const mainImageForPreview = mainImage || gallery[0] || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UploadLoadingOverlay
        show={uploadingPhoto}
        message="Enviando fotos..."
        subMessage="Estamos publicando suas fotos. Aguarde um instante."
      />
      <UploadLoadingOverlay
        show={uploadingVideo}
        message="Enviando vídeo..."
        subMessage="O upload pode levar alguns segundos dependendo do tamanho."
      />
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-50 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
          Gerenciar Mídias
        </h1>
        <div className="w-20" />
      </header>

      {/* Body */}
      <main className="flex-1 p-5 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 pb-24">

        {/* ── LEFT: foto principal ── */}
        <div className="lg:col-span-4 space-y-5">
          <Card>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Star size={18} className="text-[#d91d83] fill-[#d91d83]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Mídia Principal</h2>
                <p className="text-xs text-gray-500 mt-0.5">Foto de capa exibida no card do catálogo.</p>
              </div>
            </div>

            {/* Preview */}
            <div className="relative rounded-[20px] overflow-hidden mb-4 aspect-[3/4] bg-gray-100">
              {mainImageForPreview ? (
                <img src={mainImageForPreview} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                  <Camera size={36} />
                  <span className="text-xs text-gray-400">Nenhuma foto</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-white px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-pink-100">
                <Star size={11} className="text-[#d91d83] fill-[#d91d83]" />
                <span className="text-[10px] font-bold text-[#d91d83] uppercase tracking-wider">Capa do Perfil</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2">
              <Info size={14} className="text-pink-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Para trocar a foto principal, clique no ícone <Star size={10} className="inline text-[#d91d83]" /> em qualquer foto da galeria.
              </p>
            </div>
          </Card>

          {/* Dicas */}
          <Card className="bg-gray-50/50 border-none shadow-none">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-[#d91d83] fill-[#d91d83]" />
              <h2 className="text-base font-bold text-gray-900">Dicas de Qualidade</h2>
            </div>
            <ul className="space-y-2.5">
              {['Luz natural', 'Formato vertical', 'Sem filtros pesados', 'Rosto com clareza'].map((tip) => (
                <li key={tip} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  {tip}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <X size={16} className="text-red-500 flex-shrink-0" />
                Evitar óculos escuros
              </li>
            </ul>
          </Card>
        </div>

        {/* ── RIGHT: galeria + vídeos ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Galeria */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Camera size={18} className="text-[#d91d83]" />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  Galeria de Fotos
                  <span className="ml-2 text-xs font-normal text-gray-400">({gallery.length})</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gallery.map((url) => (
                <MediaThumb
                  key={url}
                  url={url}
                  type="image"
                  isMain={url === mainImage}
                  onDelete={() => handleDeletePhoto(url)}
                  onSetMain={() => handleSetMainImage(url)}
                />
              ))}
              <AddButton type="image" uploading={uploadingPhoto} onFiles={handleAddPhotos} />
            </div>
          </Card>

          {/* Vídeos */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Video size={18} className="text-[#d91d83]" />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  Galeria de Vídeos
                  <span className="ml-2 text-xs font-normal text-gray-400">({videos.length})</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {videos.map((url) => (
                <MediaThumb
                  key={url}
                  url={url}
                  type="video"
                  onDelete={() => handleDeleteVideo(url)}
                />
              ))}
              <AddButton type="video" uploading={uploadingVideo} onFiles={handleAddVideo} />
            </div>
          </Card>

          {/* Vídeo de Comparação (informativo) */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Smartphone size={18} className="text-gray-700" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Vídeo de Comparação</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-gray-200 shadow-sm border border-gray-100">
                <Video size={28} />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[240px]">
                Grave um vídeo de frente pra câmera e dê um giro em 360°. Sem filtros, ângulos extremos ou edições.
              </p>
            </div>
            <div className="mt-4">
              <AddButton type="video" uploading={uploadingVideo} onFiles={handleAddVideo} />
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex justify-center lg:justify-end lg:px-12">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full lg:w-52 py-3.5 rounded-full bg-[#d91d83] text-white font-semibold text-base shadow-lg shadow-pink-200 hover:bg-[#c01870] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </footer>
    </div>
  );
};

export default PhotoVideoManager;
