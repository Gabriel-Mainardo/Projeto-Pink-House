import { X } from 'lucide-react';
import { type CadastroPendente } from '../lib/supabase';

interface CadastroPendenteDetailsModalProps {
  cadastro: CadastroPendente;
  onClose: () => void;
}

export const CadastroPendenteDetailsModal = ({ cadastro, onClose }: CadastroPendenteDetailsModalProps) => {
  // Função para validar e corrigir URLs de imagem
  const getValidImageUrl = (imageUrl: string | undefined, fallbackUrl?: string): string => {
    const defaultImageUrl = "/default-profile.png";
    
    if (!imageUrl || imageUrl.length < 10 || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      return fallbackUrl || defaultImageUrl;
    }
    
    return imageUrl;
  };

  // Função para verificar se é vídeo
  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6" style={{ }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ }}>Detalhes do Cadastro Pendente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ }}>Informações Básicas</h3>
            <div className="space-y-2">
              <p><strong>Nome Real:</strong> {cadastro.real_name || 'Não informado'}</p>
              <p><strong>Nome de Exibição:</strong> {cadastro.name}</p>
              <p><strong>Email:</strong> {cadastro.email}</p>
              <p><strong>Telefone:</strong> {cadastro.phone}</p>
              <p><strong>Idade:</strong> {cadastro.age} anos</p>
              <p><strong>Altura:</strong> {cadastro.height || 'Não informada'}</p>
              <p><strong>Localização:</strong> {cadastro.location}</p>
              <p><strong>Data de Envio:</strong> {new Date(cadastro.submitted_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Detalhes do Serviço */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Detalhes do Serviço</h3>
            <div className="space-y-2">
              <p><strong>Valor por Hora:</strong> {cadastro.pricePerHour ? `R$ ${cadastro.pricePerHour}` : 'Não informado'}</p>
              <p><strong>Local Próprio:</strong> {cadastro.hasOwnLocation ? 'Sim' : 'Não'}</p>
              <p><strong>Atende em Local do Cliente:</strong> {cadastro.acceptsClientLocation ? 'Sim' : 'Não'}</p>
              <p><strong>Atende em Motel:</strong> {cadastro.acceptsMotel ? 'Sim' : 'Não'}</p>
              <p><strong>Cidades Atendidas:</strong> {cadastro.cities_served && cadastro.cities_served.length > 0 ? cadastro.cities_served.join(', ') : 'Não informadas'}</p>
              <p><strong>Serviços:</strong> {cadastro.services && cadastro.services.length > 0 ? cadastro.services.join(', ') : 'Não informados'}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Descrição</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{cadastro.description}</p>
        </div>

        {/* Mídia */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Mídia</h3>
          
          {/* Galeria de Imagens */}
          {cadastro.gallery && cadastro.gallery.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">Galeria de Imagens</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cadastro.gallery.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    {isVideo(url) ? (
                      <video 
                        src={url}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img 
                        src={getValidImageUrl(url)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vídeos */}
          {cadastro.videos && cadastro.videos.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">Vídeos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cadastro.videos.map((url, index) => (
                  <div key={index} className="relative">
                    <video 
                      src={url}
                      className="w-full rounded-lg"
                      controls
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Áudio */}
          {cadastro.audio_url && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">Áudio de Apresentação</h4>
              <audio 
                src={cadastro.audio_url}
                controls
                className="w-full"
              />
            </div>
          )}

          {(!cadastro.gallery || cadastro.gallery.length === 0) && 
           (!cadastro.videos || cadastro.videos.length === 0) && 
           !cadastro.audio_url && (
            <p className="text-gray-500 italic">Nenhuma mídia enviada</p>
          )}
        </div>
      </div>
    </div>
  );
}; 