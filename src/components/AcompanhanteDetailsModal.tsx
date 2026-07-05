import { X } from 'lucide-react';
import { type Acompanhante } from '../lib/supabase';

interface AcompanhanteDetailsModalProps {
  acompanhante: Acompanhante;
  onClose: () => void;
}

export const AcompanhanteDetailsModal = ({ acompanhante, onClose }: AcompanhanteDetailsModalProps) => {
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
          <h2 className="text-2xl font-bold" style={{ }}>Detalhes da Acompanhante</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ }}>Informações Básicas</h3>
            <div className="space-y-2">
              <p><strong>Nome Real:</strong> {acompanhante.real_name || 'Não informado'}</p>
              <p><strong>Nome de Exibição:</strong> {acompanhante.name}</p>
              <p><strong>Email:</strong> {acompanhante.email}</p>
              <p><strong>Telefone:</strong> {acompanhante.phone}</p>
              <p><strong>Idade:</strong> {acompanhante.age} anos</p>
              <p><strong>Altura:</strong> {acompanhante.height || 'Não informada'}</p>
              <p><strong>Localização:</strong> {acompanhante.location}</p>
            </div>
          </div>

          {/* Detalhes do Serviço */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ }}>Detalhes do Serviço</h3>
            <div className="space-y-2">
              <p><strong>Valor por Hora:</strong> {acompanhante.pricePerHour || 'Não informado'}</p>
              <p><strong>Local Próprio:</strong> {acompanhante.hasOwnLocation ? 'Sim' : 'Não'}</p>
              <p><strong>Atende em Local do Cliente:</strong> {acompanhante.acceptsClientLocation ? 'Sim' : 'Não'}</p>
              <p><strong>Atende em Motel:</strong> {acompanhante.acceptsMotel ? 'Sim' : 'Não'}</p>
              <p><strong>Status:</strong> {acompanhante.is_available ? 'Disponível' : 'Indisponível'}</p>
              <p><strong>Verificada:</strong> {acompanhante.is_verified ? 'Sim' : 'Não'}</p>
              <p><strong>Destaque:</strong> {acompanhante.is_featured ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2" style={{ }}>Descrição</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{acompanhante.description}</p>
        </div>

        {/* Mídia */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ }}>Mídia</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {acompanhante.gallery?.map((url, index) => (
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
      </div>
    </div>
  );
}; 