import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { Video, Upload, ArrowLeft, Play, X, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from '../components/UploadLoadingOverlay';

async function uploadAdVideo(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'mp4';
  const filename = `ads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('videos')
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('videos').getPublicUrl(filename);
  return data.publicUrl;
}

const AdVideoUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const selectedFileRef = useRef<File | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const companionId = searchParams.get('companionId') || '';
  const artisticName = searchParams.get('artisticName') || '';
  const age = searchParams.get('age') || '';
  const city = searchParams.get('city') || '';
  const neighborhood = searchParams.get('neighborhood') || '';
  const price = searchParams.get('price') || '';

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione apenas arquivos de vídeo');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('O vídeo deve ter no máximo 100MB');
      return;
    }

    selectedFileRef.current = file;
    const url = URL.createObjectURL(file);
    setPreviewVideoUrl(url);
    setError('');
  };

  const removeVideo = () => {
    if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
    setPreviewVideoUrl(null);
    selectedFileRef.current = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!selectedFileRef.current || !previewVideoUrl) {
        throw new Error('Por favor, adicione um vídeo do seu anúncio');
      }

      // Upload do vídeo ao Supabase Storage
      const videoPublicUrl = await uploadAdVideo(selectedFileRef.current);

      // Resolver o companionId
      const cId = companionId || (() => {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          return u.companionId || u.id || '';
        } catch { return ''; }
      })();

      if (cId) {
        const updatePayload: Record<string, unknown> = { ad_video: videoPublicUrl };
        if (description.trim()) updatePayload.description = description.trim();

        const { error: updateError } = await supabase
          .from('acompanhantes')
          .update(updatePayload)
          .eq('id', cId);

        if (updateError) {
          console.error('Erro ao salvar vídeo do anúncio:', updateError);
        }
      }

      navigate('/companion-dashboard?newRegistration=true');
    } catch (err: any) {
      console.error('Erro ao fazer upload do vídeo:', err);
      setError(err.message || 'Ocorreu um erro ao enviar o vídeo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/companion-dashboard?newRegistration=true');
  };

  // Formata preço para exibição
  const formattedPrice = price
    ? `R$ ${parseFloat(price).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    : 'R$ —';

  return (
    <div className="min-h-screen bg-gray-50">
      <UploadLoadingOverlay
        show={isLoading}
        message="Enviando vídeo do anúncio..."
        subMessage="O upload pode levar alguns segundos dependendo do tamanho. Não feche esta tela."
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">

            {/* Header */}
            <div className="flex items-center mb-2">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Vídeo do anúncio</h1>
            </div>

            {/* Progresso */}
            <div className="mb-6">
              <div className="flex gap-1.5 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-pink-500' : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">Etapa 4 de 4 — Quase lá!</p>
            </div>

            <p className="text-gray-600 mb-6">
              Grave ou faça upload de um vídeo curto apresentando você.
              Esse vídeo será exibido no seu card no catálogo.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Área de upload do vídeo */}
              <div className="space-y-4">
                {!previewVideoUrl ? (
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-pink-300 rounded-xl cursor-pointer bg-pink-50 hover:bg-pink-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-pink-500" />
                      </div>
                      <p className="mb-1 text-sm font-semibold text-pink-700">
                        Clique para selecionar o vídeo
                      </p>
                      <p className="text-xs text-gray-500">MP4, MOV, WEBM — até 100MB</p>
                      <p className="text-xs text-gray-400 mt-1">Recomendado: 15 a 60 segundos</p>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoSelect}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    <video
                      ref={videoPreviewRef}
                      src={previewVideoUrl}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Descrição do anúncio */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição do anúncio <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-pink-400 transition-colors resize-none italic placeholder:not-italic"
                  placeholder="Ex: Sou apaixonada por momentos únicos e cheios de cumplicidade..."
                />
                <p className="text-xs text-gray-400 text-right">{description.length}/200</p>
              </div>

              {/* Preview do card */}
              {(previewVideoUrl || description) && (
                <div className="border-2 border-pink-200 rounded-xl p-4 bg-pink-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-semibold text-gray-800">Preview do perfil</span>
                  </div>

                  <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-xs mx-auto">
                    {/* Vídeo / placeholder */}
                    <div className="relative aspect-video bg-gray-900">
                      {previewVideoUrl ? (
                        <video
                          src={previewVideoUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-10 h-10 text-white opacity-40" />
                        </div>
                      )}
                      {/* Overlay de preço */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2">
                        <span className="text-white font-bold text-base">{formattedPrice}/h</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-bold text-gray-900">{artisticName || 'Seu nome'}</p>
                      <p className="text-xs text-gray-500 mb-1">
                        {age ? `${age} anos` : 'Idade'} · {neighborhood || city || 'Localização'}
                      </p>
                      {description && (
                        <p className="text-xs text-gray-600 italic line-clamp-2">{description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <button
                type="submit"
                disabled={isLoading || !previewVideoUrl}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold transition-all hover:from-pink-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enviando vídeo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publicar anúncio
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-gray-500 hover:text-gray-700 text-sm underline py-1 transition-colors"
              >
                Pular por agora (adicionar depois no painel)
              </button>

            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdVideoUpload;
