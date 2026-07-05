import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { Camera, Upload, ArrowLeft, Eye } from 'lucide-react';
import { registrationService } from '../services/registrationService';
import { supabase } from '../lib/supabase';
import UploadLoadingOverlay from '../components/UploadLoadingOverlay';

async function uploadProfilePhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `profile/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('images').getPublicUrl(filename);
  return data.publicUrl;
}

const PhotoUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const selectedFileRef = useRef<File | null>(null);

  const companionId = searchParams.get('companionId') || '';
  const userEmail = searchParams.get('email') || '';
  const artisticName = searchParams.get('artisticName') || '';
  const phoneNumber = searchParams.get('phoneNumber') || '';
  const age = searchParams.get('age') || '';
  const city = searchParams.get('city') || '';
  const neighborhood = searchParams.get('neighborhood') || '';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    selectedFileRef.current = file;

    // Base64 apenas para preview na UI
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!selectedFileRef.current || !previewImage) {
        throw new Error('Por favor, adicione uma foto');
      }

      // Upload real ao Supabase Storage
      const publicUrl = await uploadProfilePhoto(selectedFileRef.current);

      // Salvar URL pública no registration data (backup)
      registrationService.saveData({
        profilePhoto: publicUrl
      });

      // PERSISTIR a foto no banco de dados (tabela acompanhantes)
      const cId = companionId || (() => {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          return u.companionId || u.id || '';
        } catch { return ''; }
      })();

      if (cId) {
        const { error: updateError } = await supabase
          .from('acompanhantes')
          .update({
            image: publicUrl,
            gallery: [publicUrl],
          })
          .eq('id', cId);

        if (updateError) {
          console.error('Erro ao atualizar foto no perfil:', updateError);
        }

        // Atualizar localStorage do user com a foto
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.image = publicUrl;
          localStorage.setItem('user', JSON.stringify(storedUser));
        } catch { /* noop */ }
      }

      const params = new URLSearchParams({
        companionId: cId || companionId,
        email: userEmail,
        artisticName: artisticName,
        phoneNumber: phoneNumber,
        age: age,
        city: city,
        neighborhood: neighborhood
      });

      navigate(`/pricing?${params.toString()}`);

    } catch (err: any) {
      console.error('Erro ao fazer upload da foto:', err);
      setError(err.message || 'Ocorreu um erro ao enviar a foto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UploadLoadingOverlay
        show={isLoading}
        message="Enviando sua foto..."
        subMessage="Estamos publicando sua foto de perfil. Aguarde só um instante."
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">

            {/* Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Adicione uma foto</h1>
            </div>

            <p className="text-gray-600 mb-6">
              Veja como ficará seu anúncio com sua foto de perfil
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Área de upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center rounded-lg">
                          <Camera className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG ou JPEG (MAX. 5MB)</p>
                      </div>
                    )}
                    <input
                      id="photo-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {previewImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      selectedFileRef.current = null;
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Remover foto
                  </button>
                )}
              </div>

              {/* Preview do anúncio */}
              {previewImage && (
                <div className="border-2 border-pink-200 rounded-lg p-6 bg-pink-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Eye className="w-5 h-5 text-pink-600" />
                    <h3 className="font-semibold text-gray-800">Preview do perfil</h3>
                  </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Preview do anúncio"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        Novo
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 text-lg mb-1">
                        {artisticName || 'Seu nome'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {age ? `${age} anos` : 'Idade'} • {city || 'Cidade'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded">
                          Verificada
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !previewImage}
                className="w-full bg-gradient-to-r from-velvet-pink-700 to-velvet-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-colors hover:from-velvet-pink-800 hover:to-velvet-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-velvet-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando foto...</span>
                  </div>
                ) : (
                  'Continuar'
                )}
              </button>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PhotoUpload;
