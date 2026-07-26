import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Image as ImageIcon,
  Info,
  Loader2,
  Play,
  Star,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { acompanhantesService, supabase, type Acompanhante } from '../lib/supabase';
import UploadLoadingOverlay from './UploadLoadingOverlay';
import { useToast } from '../hooks/use-toast';

interface ProfileMediaManagerProps {
  companionId: string;
  profile: Acompanhante;
  onProfileChange?: (profile: Acompanhante) => void;
}

type PendingDelete = {
  type: 'image' | 'video';
  url: string;
};

const IMAGE_LIMIT_BYTES = 50 * 1024 * 1024;
const VIDEO_LIMIT_BYTES = 150 * 1024 * 1024;

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const uploadFile = async (
  file: File,
  bucket: 'images' | 'videos',
  folder: string
): Promise<string> => {
  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${sanitizeFilename(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
};

const deleteStoredFile = async (url: string, bucket: 'images' | 'videos') => {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const filePath = url.split(marker)[1];

  if (!filePath) return;

  const { error } = await supabase.storage.from(bucket).remove([decodeURIComponent(filePath)]);
  if (error) {
    console.warn('Nao foi possivel remover o arquivo antigo do storage:', error);
  }
};

const ProfileMediaManager: React.FC<ProfileMediaManagerProps> = ({
  companionId,
  profile,
  onProfileChange,
}) => {
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<string[]>(profile.gallery || []);
  const [mainImage, setMainImage] = useState(profile.image || profile.gallery?.[0] || '');
  const [videos, setVideos] = useState<string[]>(profile.videos || []);
  const [adVideo, setAdVideo] = useState<string | null>(
    profile.ad_video || profile.video_url || profile.videos?.[0] || null
  );
  const [uploadingType, setUploadingType] = useState<'image' | 'video' | null>(null);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    setGallery(profile.gallery || []);
    setMainImage(profile.image || profile.gallery?.[0] || '');
    setVideos(profile.videos || []);
    setAdVideo(profile.ad_video || profile.video_url || profile.videos?.[0] || null);
  }, [profile]);

  const persistChanges = async (updates: Partial<Acompanhante>) => {
    const updatedProfile = await acompanhantesService.update(companionId, updates);
    onProfileChange?.(updatedProfile);
    return updatedProfile;
  };

  const showError = (title: string, error: unknown) => {
    console.error(title, error);
    toast({
      title,
      description: 'Tente novamente em alguns instantes.',
      variant: 'destructive',
    });
  };

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files?.length) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: `${file.name} nao e uma imagem valida`,
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > IMAGE_LIMIT_BYTES) {
        toast({
          title: `${file.name} ultrapassa 50 MB`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setUploadingType('image');
    const uploadedUrls: string[] = [];

    try {
      for (const file of validFiles) {
        uploadedUrls.push(await uploadFile(file, 'images', 'gallery'));
      }

      const nextGallery = [...gallery, ...uploadedUrls];
      const nextMainImage = mainImage || nextGallery[0] || '';
      const updatedProfile = await persistChanges({
        gallery: nextGallery,
        image: nextMainImage,
      });

      setGallery(updatedProfile.gallery || nextGallery);
      setMainImage(updatedProfile.image || nextMainImage);
      toast({
        title: uploadedUrls.length === 1 ? 'Foto publicada' : 'Fotos publicadas',
        description: 'As alteracoes ja estao salvas no seu perfil.',
      });
    } catch (error) {
      await Promise.all(uploadedUrls.map((url) => deleteStoredFile(url, 'images')));
      showError('Nao foi possivel publicar as fotos', error);
    } finally {
      setUploadingType(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleAddVideo = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({ title: 'Selecione um arquivo de video valido', variant: 'destructive' });
      return;
    }

    if (file.size > VIDEO_LIMIT_BYTES) {
      toast({ title: 'O video deve ter no maximo 150 MB', variant: 'destructive' });
      return;
    }

    setUploadingType('video');
    let uploadedUrl = '';

    try {
      uploadedUrl = await uploadFile(file, 'videos', 'videos');
      const nextVideos = [...videos, uploadedUrl];
      const updates: Partial<Acompanhante> = { videos: nextVideos };

      if (!adVideo) updates.ad_video = uploadedUrl;

      const updatedProfile = await persistChanges(updates);
      setVideos(updatedProfile.videos || nextVideos);
      setAdVideo(updatedProfile.ad_video || adVideo || uploadedUrl);
      toast({
        title: 'Video publicado',
        description: adVideo
          ? 'O video foi adicionado a galeria.'
          : 'O video tambem foi definido como video do anuncio.',
      });
    } catch (error) {
      if (uploadedUrl) await deleteStoredFile(uploadedUrl, 'videos');
      showError('Nao foi possivel publicar o video', error);
    } finally {
      setUploadingType(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSetMainImage = async (url: string) => {
    if (url === mainImage || savingAction) return;

    setSavingAction(`main:${url}`);
    try {
      const updatedProfile = await persistChanges({ image: url });
      setMainImage(updatedProfile.image || url);
      toast({ title: 'Foto principal atualizada' });
    } catch (error) {
      showError('Nao foi possivel trocar a foto principal', error);
    } finally {
      setSavingAction(null);
    }
  };

  const handleSetAdVideo = async (url: string) => {
    if (url === adVideo || savingAction) return;

    setSavingAction(`ad:${url}`);
    try {
      const updatedProfile = await persistChanges({ ad_video: url });
      setAdVideo(updatedProfile.ad_video || url);
      toast({
        title: 'Video do anuncio atualizado',
        description: 'Este video sera priorizado no card e no perfil.',
      });
    } catch (error) {
      showError('Nao foi possivel trocar o video do anuncio', error);
    } finally {
      setSavingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || savingAction) return;

    const { type, url } = pendingDelete;
    setSavingAction(`delete:${url}`);

    try {
      if (type === 'image') {
        const nextGallery = gallery.filter((item) => item !== url);
        const nextMainImage = mainImage === url ? nextGallery[0] || '' : mainImage;
        const updatedProfile = await persistChanges({
          gallery: nextGallery,
          image: nextMainImage,
        });

        setGallery(updatedProfile.gallery || nextGallery);
        setMainImage(updatedProfile.image || nextMainImage);
        await deleteStoredFile(url, 'images');
      } else {
        const nextVideos = videos.filter((item) => item !== url);
        const removingAdVideo = adVideo === url;
        const updates: Partial<Acompanhante> = { videos: nextVideos };

        if (removingAdVideo) {
          updates.ad_video = null;
          if (profile.video_url === url) updates.video_url = null;
        }

        const updatedProfile = await persistChanges(updates);
        setVideos(updatedProfile.videos || nextVideos);
        setAdVideo(
          removingAdVideo
            ? updatedProfile.ad_video || updatedProfile.video_url || nextVideos[0] || null
            : updatedProfile.ad_video || adVideo
        );
        await deleteStoredFile(url, 'videos');
      }

      setPendingDelete(null);
      toast({ title: type === 'image' ? 'Foto removida' : 'Video removido' });
    } catch (error) {
      showError(type === 'image' ? 'Nao foi possivel remover a foto' : 'Nao foi possivel remover o video', error);
    } finally {
      setSavingAction(null);
    }
  };

  const isBusy = Boolean(uploadingType || savingAction);
  const mainImageForPreview = mainImage || gallery[0] || '';

  return (
    <section aria-labelledby="profile-media-title" className="border-y border-gray-200 bg-white py-6 sm:py-8">
      <UploadLoadingOverlay
        show={uploadingType === 'image'}
        message="Publicando fotos..."
        subMessage="As fotos serao salvas automaticamente no seu perfil."
      />
      <UploadLoadingOverlay
        show={uploadingType === 'video'}
        message="Publicando video..."
        subMessage="O envio pode levar alguns segundos. Nao feche esta tela."
      />

      <div className="mb-6 flex flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ImageIcon size={20} className="text-[#d91d83]" />
            <h2 id="profile-media-title" className="text-lg font-bold text-gray-900">
              Fotos e videos do perfil
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            Adicione, remova e escolha o que aparece primeiro. Cada alteracao e salva automaticamente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 text-[#d91d83]">
            <Camera size={13} />
            {gallery.length} {gallery.length === 1 ? 'foto' : 'fotos'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
            <Video size={13} />
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-green-700">
            <Check size={13} />
            Salvamento automatico
          </span>
        </div>
      </div>

      <div className="grid gap-8 px-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Foto principal</h3>
            <span className="text-[11px] font-medium text-gray-400">Capa do card</span>
          </div>
          <div className="relative aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-lg bg-gray-100">
            {mainImageForPreview ? (
              <img src={mainImageForPreview} alt="Foto principal do perfil" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                <Camera size={32} />
                <span className="text-xs font-medium">Adicione sua primeira foto</span>
              </div>
            )}
            {mainImageForPreview && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-[#d91d83] shadow">
                <Star size={11} className="fill-current" />
                Principal
              </span>
            )}
          </div>
          <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
            <Info size={14} className="mt-0.5 shrink-0 text-[#d91d83]" />
            Use o botao de estrela em qualquer foto para trocar a capa.
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Galeria de fotos</h3>
              <p className="mt-0.5 text-xs text-gray-500">JPG, PNG ou WEBP, ate 50 MB por arquivo.</p>
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isBusy}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#d91d83] px-3 text-xs font-bold text-white transition-colors hover:bg-[#bd116f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingType === 'image' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Adicionar fotos
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(event) => void handleAddPhotos(event.target.files)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {gallery.map((url, index) => (
              <article key={url} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <img src={url} alt={`Foto ${index + 1} do perfil`} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-2 pt-8">
                  <button
                    type="button"
                    onClick={() => void handleSetMainImage(url)}
                    disabled={isBusy || url === mainImage}
                    title={url === mainImage ? 'Foto principal' : 'Definir como principal'}
                    aria-label={url === mainImage ? 'Foto principal' : `Definir foto ${index + 1} como principal`}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      url === mainImage ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-700 hover:text-[#d91d83]'
                    } disabled:cursor-default`}
                  >
                    {savingAction === `main:${url}` ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Star size={15} className={url === mainImage ? 'fill-current' : ''} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ type: 'image', url })}
                    disabled={isBusy}
                    title="Remover foto"
                    aria-label={`Remover foto ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isBusy}
              className="flex aspect-[3/4] min-h-[150px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-500 transition-colors hover:border-[#d91d83] hover:text-[#d91d83] disabled:opacity-50"
            >
              <Camera size={24} />
              <span className="text-xs font-bold">Nova foto</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 px-4 pt-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Videos do perfil e do anuncio</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              O video marcado como anuncio e priorizado nos cards em destaque.
            </p>
          </div>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-3 text-xs font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadingType === 'video' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Adicionar video
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(event) => void handleAddVideo(event.target.files)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {videos.map((url, index) => {
            const isAdVideo = url === adVideo;
            return (
              <article key={url} className="group relative aspect-[9/14] overflow-hidden rounded-lg bg-gray-900">
                <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                  <Play size={28} className="fill-white text-white drop-shadow" />
                </div>
                {isAdVideo && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#d91d83] px-2 py-1 text-[9px] font-bold uppercase text-white">
                    Video do anuncio
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 grid grid-cols-[1fr_auto] gap-2 bg-gradient-to-t from-black/85 to-transparent p-2 pt-8">
                  <button
                    type="button"
                    onClick={() => void handleSetAdVideo(url)}
                    disabled={isBusy || isAdVideo}
                    className={`min-w-0 truncate rounded-lg px-2 py-2 text-[10px] font-bold transition-colors ${
                      isAdVideo ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-800 hover:text-[#d91d83]'
                    } disabled:cursor-default`}
                  >
                    {savingAction === `ad:${url}` ? 'Salvando...' : isAdVideo ? 'Em uso' : 'Usar no anuncio'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ type: 'video', url })}
                    disabled={isBusy}
                    title="Remover video"
                    aria-label={`Remover video ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isBusy}
            className="flex aspect-[9/14] min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900 disabled:opacity-50"
          >
            <Video size={24} />
            <span className="text-xs font-bold">Novo video</span>
            <span className="px-2 text-center text-[10px] text-gray-400">MP4, MOV ou WEBM</span>
          </button>
        </div>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Remover {pendingDelete.type === 'image' ? 'foto' : 'video'}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              O arquivo deixara de aparecer no perfil. Esta acao nao pode ser desfeita.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={Boolean(savingAction)}
                className="h-11 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={Boolean(savingAction)}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingAction ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileMediaManager;
