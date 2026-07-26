import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileMediaManager from '../components/ProfileMediaManager';
import { acompanhantesService, type Acompanhante } from '../lib/supabase';

const PhotoVideoManager: React.FC = () => {
  const navigate = useNavigate();
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Acompanhante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const id = parsedUser.companionId || parsedUser.id;

        if (!id) {
          navigate('/login');
          return;
        }

        setCompanionId(id);
        setProfile(await acompanhantesService.getById(id));
      } catch (error) {
        console.error('Erro ao carregar gerenciador de midia:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#d91d83]" />
      </div>
    );
  }

  if (!profile || !companionId) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/companion-dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Voltar ao dashboard
          </button>
          <h1 className="mx-auto pr-20 text-base font-bold text-gray-900 sm:text-lg">
            Gerenciar fotos e videos
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl py-6 sm:px-6">
        <ProfileMediaManager
          companionId={companionId}
          profile={profile}
          onProfileChange={setProfile}
        />
      </main>
    </div>
  );
};

export default PhotoVideoManager;
