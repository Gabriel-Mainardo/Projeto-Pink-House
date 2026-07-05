import { useState, useEffect, useRef } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, DollarSign, Home } from 'lucide-react';
import { type Acompanhante } from '../lib/supabase';
import MediaUpload from './MediaUpload';

interface EditAcompanhanteModalProps {
  acompanhante: Acompanhante;
  onClose: () => void;
  onSave: (updates: Partial<Acompanhante>) => Promise<void>;
}

export const EditAcompanhanteModal = ({ acompanhante, onClose, onSave }: EditAcompanhanteModalProps) => {
  const [formData, setFormData] = useState({
    real_name: acompanhante.real_name || '',
    display_name: acompanhante.display_name || acompanhante.name,
    email: acompanhante.email,
    phone: acompanhante.phone,
    age: acompanhante.age.toString(),
    location: acompanhante.location,
    height: acompanhante.height || '',
    description: acompanhante.description,
    priceperhour: acompanhante.pricePerHour || '',
    hasownlocation: acompanhante.hasOwnLocation || false,
    acceptsclientlocation: acompanhante.acceptsClientLocation || false,
    acceptsmotel: acompanhante.acceptsMotel || false,
    is_featured: acompanhante.is_featured || false,
    is_verified: acompanhante.is_verified || false,
    is_available: acompanhante.is_available || false,
    gallery: acompanhante.gallery || [] as string[],
    image: acompanhante.image || '',
    videos: acompanhante.videos || [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMediaUploaded = (media: Array<{url: string, type: 'image' | 'video'}>) => {
    const images = media.filter(m => m.type === 'image').map(m => m.url);
    const videos = media.filter(m => m.type === 'video').map(m => m.url);

    setFormData(prev => ({
      ...prev,
      gallery: images.length > 0 ? images : prev.gallery,
      image: images[0] || prev.image,
      videos: videos.length > 0 ? videos : prev.videos,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validações
      if (!formData.display_name.trim()) {
        throw new Error('Nome de exibição é obrigatório');
      }

      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      // Preparar dados para atualização
      const updates: Partial<Acompanhante> = {
        real_name: formData.real_name,
        display_name: formData.display_name,
        name: formData.display_name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        location: formData.location,
        height: formData.height,
        description: formData.description,
        pricePerHour: formData.priceperhour,
        hasOwnLocation: formData.hasownlocation,
        acceptsClientLocation: formData.acceptsclientlocation,
        acceptsMotel: formData.acceptsmotel,
        is_featured: formData.is_featured,
        is_verified: formData.is_verified,
        is_available: formData.is_available,
        gallery: formData.gallery,
        image: formData.image,
        videos: formData.videos,
      };

      await onSave(updates);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar acompanhante:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar acompanhante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6" ref={scrollRef} style={{ }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ }}>Editar Acompanhante</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Verdadeiro (Interno)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="real_name"
                  value={formData.real_name}
                  onChange={handleInputChange}
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Exibição
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idade
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="18"
                  max="99"
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura
              </label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300"
                placeholder="Ex: 1,70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor por Hora
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="priceperhour"
                  value={formData.priceperhour}
                  onChange={handleInputChange}
                  className="pl-10 w-full rounded-lg border border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300"
            />
          </div>

          {/* Opções de Atendimento */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ }}>Opções de Atendimento</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hasownlocation"
                  checked={formData.hasownlocation}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span>Local Próprio</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="acceptsclientlocation"
                  checked={formData.acceptsclientlocation}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span>Local do Cliente</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="acceptsmotel"
                  checked={formData.acceptsmotel}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span>Motel</span>
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ }}>Status</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span>Destaque</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span>Verificada</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span>Disponível</span>
              </label>
            </div>
          </div>

          {/* Mídia */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ }}>Mídia</h3>
            <MediaUpload
              onMediaUploaded={handleMediaUploaded}
              initialImages={acompanhante.gallery || []}
              initialVideos={acompanhante.videos || []}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-velvet-pink-600 rounded-lg hover:bg-velvet-pink-700 flex items-center"
              disabled={isLoading}
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 