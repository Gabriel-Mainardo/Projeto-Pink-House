import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdPreviewModal from '../components/AdPreviewModal';
import { acompanhantesService, type Acompanhante } from '../services/acompanhantesService';
import { getReliabilityScore } from '../services/verificationService';

const ProfilePreviewRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Acompanhante | null>(null);
  const [reliabilityScore, setReliabilityScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        navigate('/', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [profileData, score] = await Promise.all([
          acompanhantesService.getById(id),
          getReliabilityScore(id).catch(() => 0),
        ]);

        setProfile(profileData);
        setReliabilityScore(score);
      } catch {
        setError('Perfil nao encontrado');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate]);

  const closePreview = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/', { replace: true });
  };

  const openContact = () => {
    if (!profile) return;
    navigate(`/mensagens?companion_id=${profile.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-[#da0b7d]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Perfil nao encontrado</h1>
          <p className="mb-6 text-sm text-gray-500">Esse anuncio nao esta disponivel no momento.</p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="rounded-full bg-[#da0b7d] px-8 py-3 text-sm font-bold text-white"
          >
            Voltar ao inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdPreviewModal
        profile={{
          ...profile,
          audioUrl: profile.audioUrl || profile.audio_url,
          adVideo: profile.adVideo || profile.video_url,
          isAvailable: profile.is_available,
          isVerified: profile.is_verified,
          reliabilityScore,
        }}
        onClose={closePreview}
        onContact={openContact}
      />
    </div>
  );
};

export default ProfilePreviewRoute;
