import { useEffect, useMemo, useState } from 'react';
import { Camera, Mail, Phone, Save, User, X } from 'lucide-react';
import { imageService, supabase, type Client } from '../lib/supabase';

interface ClientProfileModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

const ClientProfileModal = ({ client, isOpen, onClose, onSaved }: ClientProfileModalProps) => {
  const initialState = useMemo(
    () => ({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
    }),
    [client.email, client.name, client.phone]
  );

  const [formData, setFormData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(client.avatar_url || '');

  useEffect(() => {
    setFormData(initialState);
    setError('');
    setAvatarUrl(client.avatar_url || '');
  }, [initialState]);

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploadingAvatar(true);

    try {
      const uploadedUrl = await imageService.uploadImage(file, 'client-avatars');
      setAvatarUrl(uploadedUrl);
    } catch (uploadError: any) {
      console.error('Erro ao enviar avatar do cliente:', uploadError);
      setError(uploadError.message || 'Não foi possível enviar a foto de perfil.');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Informe seu email.');
      return;
    }

    setIsSaving(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const updates: Partial<Client> = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        avatar_url: avatarUrl || undefined,
      };

      const metadataUpdates: Record<string, string> = {};

      if (avatarUrl) {
        metadataUpdates.avatar_url = avatarUrl;
      }

      if (normalizedEmail !== client.email.toLowerCase()) {
        const { error: authError } = await supabase.auth.updateUser({
          email: normalizedEmail,
          data: Object.keys(metadataUpdates).length > 0 ? metadataUpdates : undefined,
        });

        if (authError) {
          throw authError;
        }

        updates.email = normalizedEmail;
      } else if (Object.keys(metadataUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({
          data: metadataUpdates,
        });

        if (authError) {
          throw authError;
        }
      }

      const dbPayload = {
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      };

      let data: Client | null = null;
      let updateError: any = null;

      const updateWithAvatar = await supabase
        .from('clientes')
        .update(dbPayload)
        .eq('id', client.id)
        .select()
        .single();

      data = updateWithAvatar.data as Client | null;
      updateError = updateWithAvatar.error;

      if (updateError && String(updateError.message || '').includes('avatar_url')) {
        const fallbackUpdate = await supabase
          .from('clientes')
          .update({
            name: updates.name,
            phone: updates.phone,
            email: updates.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', client.id)
          .select()
          .single();

        data = fallbackUpdate.data as Client | null;
        updateError = fallbackUpdate.error;
      }

      if (updateError) {
        throw updateError;
      }

      onSaved({
        ...(data as Client),
        avatar_url: avatarUrl || data?.avatar_url || client.avatar_url,
      });
      onClose();
    } catch (saveError: any) {
      console.error('Erro ao salvar perfil do cliente:', saveError);
      setError(saveError.message || 'Não foi possível salvar seu perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Editar minha conta</h2>
            <p className="text-sm text-gray-500">Atualize seus dados e salve no perfil.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-gray-100 bg-[#faf7f9] px-4 py-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-[#d91d83] to-pink-400 text-white shadow-md">
                <User className="h-10 w-10" />
              </div>
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d91d83]/20 bg-white px-4 py-2 text-sm font-semibold text-[#d91d83] transition hover:bg-pink-50">
              <Camera className="h-4 w-4" />
              {isUploadingAvatar ? 'Enviando foto...' : 'Alterar foto de perfil'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-700">Nome</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#d91d83] focus:bg-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-700">Telefone</span>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#d91d83] focus:bg-white"
                />
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#d91d83] focus:bg-white"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Se alterar o email, o Supabase pode exigir confirmação no novo endereço.
            </p>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d91d83] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bf166f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfileModal;
