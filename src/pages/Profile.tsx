import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acompanhantesService, type Acompanhante } from '../lib/supabase';
import { Heart, BadgeCheck, Play, Smartphone, CreditCard, DollarSign, Gift, ArrowLeft, MapPin, Star, MessageSquare, Share2, ChevronLeft, ChevronRight, Phone, X, PhoneCall, Send } from 'lucide-react';
import { getReliabilityScore } from '../services/verificationService';
import Footer from '../components/Footer';
import VoicePlayer from '../components/VoicePlayer';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Acompanhante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [reliabilityScore, setReliabilityScore] = useState(0);
  const [liked, setLiked] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const getValidMediaUrl = (url: string | undefined): string => {
    const defaultImageUrl = '/default-profile.png';
    if (!url || url === 'foto/' || url === 'foto' || url.length < 10 || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return defaultImageUrl;
    }
    return url;
  };

  const getValidVideoUrl = (url: string | undefined): string => {
    if (!url || url.trim().length < 10) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) return '';
    if (url.includes('/storage/v1/object/public/videos/')) return url;

    const isVideoFile = ['.mp4', '.webm', '.mov', '.m4v', '.quicktime']
      .some((extension) => url.toLowerCase().includes(extension));

    if (isVideoFile || url.includes('/videos/')) {
      let normalizedUrl = url.replace('/storage/v1/object/public/images/', '/storage/v1/object/public/videos/');
      if (!normalizedUrl.includes('/storage/v1/object/public/videos/')) {
        normalizedUrl = normalizedUrl.replace('/storage/v1/object/public/', '/storage/v1/object/public/videos/');
      }
      return normalizedUrl;
    }

    return url;
  };

  const formatPhoneForWhatsApp = (phoneNumber: string) => {
    const numbersOnly = phoneNumber.replace(/\D/g, '');
    return numbersOnly.length <= 11 ? `55${numbersOnly}` : numbersOnly;
  };

  const formatLocation = (location: string) => {
    if (!location) return '';
    const parts = location.split(' - ').map(p => p.trim()).filter(p => p);
    if (parts.length >= 2) {
      const city = parts[parts.length - 2];
      const state = parts[parts.length - 1];
      const stateMap: Record<string, string> = {
        'Pernambuco': 'PE', 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG',
        'Bahia': 'BA', 'Ceará': 'CE', 'Paraíba': 'PB', 'Rio Grande do Norte': 'RN',
        'Alagoas': 'AL', 'Sergipe': 'SE', 'Piauí': 'PI', 'Maranhão': 'MA',
      };
      return `${city} - ${stateMap[state] || state}`;
    }
    return location;
  };

  const openWhatsApp = () => {
    if (profile?.phone) {
      const phone = formatPhoneForWhatsApp(profile.phone);
      window.open(`https://wa.me/${phone}?text=Olá ${profile.name}, vi seu perfil no Pink House e gostaria de conversar.`, '_blank');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) { navigate('/'); return; }
      try {
        setLoading(true);
        setError(null);
        const user = localStorage.getItem('user');
        let loggedCompanionId = null;
        if (user) {
          try { loggedCompanionId = JSON.parse(user)?.companionId; } catch {}
        }
        setIsOwnProfile(!!(loggedCompanionId && loggedCompanionId === id));
        const profileData = await acompanhantesService.getById(id);
        setProfile(profileData);
        if (loggedCompanionId === id && profileData) {
          let c = 20;
          if (profileData.image?.startsWith('http') && !profileData.image.includes('unsplash.com')) c += 15;
          if (profileData.description && !profileData.description.startsWith('Olá! Sou')) c += 15;
          if (profileData.gallery?.length > 0) c += 10;
          if (profileData.phone && profileData.phone !== 'Não informado') c += 10;
          if (profileData.tags?.length > 0) c += 10;
          if (profileData.priceperhour) c += 10;
          if (profileData.videos?.length > 0) c += 5;
          if (profileData.audio_url) c += 5;
          setProfileCompleteness(Math.min(c, 100));
        }
        const score = await getReliabilityScore(id);
        setReliabilityScore(score);
      } catch {
        setError('Perfil não encontrado');
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-[#d91d83] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-500 mb-6">O perfil que você está procurando não existe ou foi removido.</p>
          <button onClick={() => navigate('/')} className="bg-[#d91d83] text-white px-8 py-3 rounded-full">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const mockDescription = 'Olá! Sou uma acompanhante de luxo, discreta e elegante. Adoro conhecer pessoas interessantes e proporcionar momentos inesquecíveis.';
  const mockServices = ['Massagem', 'Jantar Romântico', 'Eventos', 'Viagens', 'Pernoite'];

  const photos = profile.gallery?.filter(u => u && u.trim() !== '').map((u, i) => ({ id: i + 1, url: getValidMediaUrl(u) })) || [];
  const videos = profile.videos
    ?.filter((u) => u && u.trim() !== '')
    .map((u, i) => ({ id: i + 1, url: getValidVideoUrl(u) }))
    .filter((video) => video.url) || [];
  const services = (profile.tags?.length > 0)
    ? profile.tags.map((t, i) => ({ id: i + 1, label: t }))
    : (isOwnProfile ? [] : mockServices.map((s, i) => ({ id: i + 1, label: s })));
  const isAutoDesc = profile.description?.startsWith('Olá! Sou');
  const description = (profile.description && !isAutoDesc)
    ? profile.description
    : (isOwnProfile ? '' : mockDescription);

  const galleryImages = [
    getValidMediaUrl(profile.image),
    ...photos.map((photo) => photo.url)
  ].filter((url, index, items) => items.indexOf(url) === index);

  const heroImage = galleryImages[currentSlide] || getValidMediaUrl(profile.image);

  const goToPreviousSlide = () => {
    setCurrentSlide((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  const reliabilityLabel =
    reliabilityScore >= 100 ? 'Confiança máxima' :
    reliabilityScore >= 70 ? 'Alta confiança' :
    reliabilityScore >= 40 ? 'Confiança moderada' : 'Verificação pendente';
  const normalizedReliabilityScore = Math.max(0, Math.min(100, Number(reliabilityScore) || 0));
  const reliabilityFillClass =
    normalizedReliabilityScore >= 80 ? 'bg-emerald-400' :
    normalizedReliabilityScore >= 50 ? 'bg-amber-400' :
    'bg-rose-400';
  const reliabilityTextClass =
    normalizedReliabilityScore >= 80 ? 'text-emerald-500' :
    normalizedReliabilityScore >= 50 ? 'text-amber-500' :
    'text-rose-500';

  return (
    <div className="min-h-screen bg-gray-50 pb-28 lg:pb-12">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .photo-lightbox { animation: fadeIn .15s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* ── HERO IMAGE (mobile/tablet only) ── */}
      <div className="lg:hidden relative w-full aspect-[4/5] md:aspect-[16/7] max-h-[560px] overflow-hidden">
        <img
          src={heroImage}
          alt={profile.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        {galleryImages.length > 1 && (
          <>
            <button type="button" onClick={goToPreviousSlide}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
              aria-label="Foto anterior">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={goToNextSlide}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
              aria-label="Proxima foto">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
              {galleryImages.map((imageUrl, index) => (
                <button key={`${imageUrl}-${index}`} type="button" onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${currentSlide === index ? 'w-6 bg-white' : 'w-2.5 bg-white/45'}`}
                  aria-label={`Ir para foto ${index + 1}`} />
              ))}
            </div>
          </>
        )}

        {/* top buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              onClick={() => navigator.share?.({ title: profile.name, url: window.location.href })}>
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => setLiked(!liked)}
              className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart className={`w-5 h-5 ${liked ? 'text-[#d91d83] fill-[#d91d83]' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* bottom info over image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
            <BadgeCheck className="w-6 h-6 text-[#d91d83] fill-[#d91d83]" />
            <div className={`w-2.5 h-2.5 rounded-full ${profile.is_available !== false ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span>{profile.age} anos</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{formatLocation(profile.location) || 'Brasil'}</span>
            </div>
            {profile.priceperhour && (
              <><span>·</span><span className="text-[#f472b6] font-semibold">R$ {profile.priceperhour}/h</span></>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative -mt-4 lg:mt-0 bg-gray-50 rounded-t-3xl lg:rounded-none px-4 lg:px-0 pt-6 lg:pt-0">
        <div className="max-w-6xl mx-auto lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:pt-8 lg:items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-5 lg:min-w-0">

              {/* ── DESKTOP PORTRAIT IMAGE ── */}
              <div className="hidden lg:block relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '720px' }}>
                <img
                  src={heroImage}
                  alt={profile.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

                {galleryImages.length > 1 && (
                  <>
                    <button type="button" onClick={goToPreviousSlide}
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
                      aria-label="Foto anterior">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={goToNextSlide}
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
                      aria-label="Proxima foto">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
                      {galleryImages.map((imageUrl, index) => (
                        <button key={`${imageUrl}-dot-${index}`} type="button" onClick={() => setCurrentSlide(index)}
                          className={`h-2.5 rounded-full transition-all ${currentSlide === index ? 'w-6 bg-white' : 'w-2.5 bg-white/45'}`}
                          aria-label={`Ir para foto ${index + 1}`} />
                      ))}
                    </div>
                  </>
                )}

                {/* top buttons */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <button onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                      onClick={() => navigator.share?.({ title: profile.name, url: window.location.href })}>
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setLiked(!liked)}
                      className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className={`w-5 h-5 ${liked ? 'text-[#d91d83] fill-[#d91d83]' : 'text-white'}`} />
                    </button>
                  </div>
                </div>

                {/* bottom info over image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                    <BadgeCheck className="w-6 h-6 text-[#d91d83] fill-[#d91d83]" />
                    <div className={`w-2.5 h-2.5 rounded-full ${profile.is_available !== false ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm">
                    <span>{profile.age} anos</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{formatLocation(profile.location) || 'Brasil'}</span>
                    </div>
                    {profile.priceperhour && (
                      <><span>·</span><span className="text-[#f472b6] font-semibold">R$ {profile.priceperhour}/h</span></>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery thumbnails */}
              {galleryImages.length > 1 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-gray-900">Galeria</h2>
                    <span className="text-xs text-[#d91d83] font-medium">{currentSlide + 1} de {galleryImages.length}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {galleryImages.map((imageUrl, index) => (
                      <button key={`${imageUrl}-thumb-${index}`} type="button" onClick={() => setCurrentSlide(index)}
                        className={`relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${currentSlide === index ? 'border-[#d91d83]' : 'border-transparent'}`}>
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                        {currentSlide === index && <div className="absolute inset-0 bg-[#d91d83]/10" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile: reliability + stats */}
              <div className="bg-white rounded-2xl p-4 shadow-sm lg:hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">{reliabilityLabel}</span>
                  <span className={`text-sm font-bold ${reliabilityTextClass}`}>{normalizedReliabilityScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${reliabilityFillClass}`}
                    style={{ width: `${normalizedReliabilityScore}%` }}
                  />
                </div>
                <div className="mb-4">
                  <VoicePlayer 
                    audioUrl={profile.audio_url || ''} 
                    companionName={profile.name} 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Cachê</p>
                    <p className="text-sm font-bold text-gray-800">{profile.priceperhour ? `R$ ${profile.priceperhour}` : '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Atende</p>
                    <p className="text-sm font-bold text-gray-800">A partir 1h</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                    <p className={`text-sm font-bold ${profile.is_available !== false ? 'text-green-500' : 'text-red-400'}`}>
                      {profile.is_available !== false ? 'Online' : 'Ocupada'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile: own profile banner */}
              {isOwnProfile && (
                <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 lg:hidden">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-800 text-sm">Complete seu perfil</p>
                    <span className="text-sm font-bold text-[#d91d83]">{profileCompleteness}%</span>
                  </div>
                  <div className="w-full bg-pink-100 rounded-full h-2 mb-3">
                    <div className="bg-[#d91d83] h-2 rounded-full" style={{ width: `${profileCompleteness}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Perfis completos têm até 5x mais visualizações</p>
                  <button onClick={() => navigate(`/editar-perfil/${id}`)}
                    className="w-full bg-[#d91d83] text-white py-2.5 rounded-full text-sm font-semibold">
                    Completar informações
                  </button>
                </div>
              )}

              {/* About */}
              {(description || isOwnProfile) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-2">Sobre mim</h2>
                  {description
                    ? <p className="text-gray-500 text-sm leading-relaxed italic">{description}</p>
                    : <p className="text-gray-400 text-sm italic">Nenhuma descrição adicionada</p>}
                </div>
              )}

              {/* Name, Age, Location card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                  {profile.age && <span className="text-gray-500 text-sm">{profile.age} anos</span>}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-[#d91d83]" />
                  <span>{formatLocation(profile.location) || 'Brasil'}</span>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3">Detalhes</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Localização', value: formatLocation(profile.location) || '—' },
                    { label: 'Físico', value: profile.height || profile.peso ? `${profile.height || '—'} · ${profile.peso || '—'}` : (isOwnProfile ? '—' : '1,65 · 55kg') },
                    { label: 'Atende', value: isOwnProfile ? '—' : 'Homens, Casais' },
                    { label: 'Preferências', value: isOwnProfile ? '—' : 'Não fumantes' },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos */}
              {(galleryImages.length > 0 || !isOwnProfile) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-gray-900">Fotos</h2>
                    {galleryImages.length > 6 && <span className="text-xs text-[#d91d83] font-medium">Mais fotos</span>}
                  </div>
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5">
                      {galleryImages.slice(0, 12).map((photoUrl, index) => (
                        <button type="button" key={`${photoUrl}-${index}`}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                          onClick={() => { setCurrentSlide(index); setActivePhoto(photoUrl); }}>
                          <img src={photoUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">Nenhuma foto adicionada</p>
                  )}
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-3">Vídeos</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {videos.map((video) => (
                      <button
                        type="button"
                        key={video.id}
                        onClick={() => setActiveVideo(video.url)}
                        className="relative rounded-xl overflow-hidden aspect-video bg-black cursor-pointer group text-left"
                      >
                        <video
                          src={video.url}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {(services.length > 0 || !isOwnProfile) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-3">Especialidades</h2>
                  {services.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <span key={s.id} className="bg-pink-50 text-[#d91d83] border border-pink-100 px-3 py-1.5 rounded-full text-xs font-medium">
                          {s.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">Nenhuma especialidade adicionada</p>
                  )}
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">Avaliações</h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-800">5.0</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm italic">Ainda não há avaliações</p>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR (desktop only) ── */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-4">

                {/* Profile card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    <BadgeCheck className="w-5 h-5 text-[#d91d83] fill-[#d91d83]" />
                    <div className={`w-2.5 h-2.5 rounded-full ${profile.is_available !== false ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm mb-5">
                    <span>{profile.age} anos</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{formatLocation(profile.location) || 'Brasil'}</span>
                    </div>
                    {profile.priceperhour && (
                      <><span>·</span><span className="text-[#d91d83] font-semibold">R$ {profile.priceperhour}/h</span></>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Cachê</p>
                      <p className="text-sm font-bold text-gray-800">{profile.priceperhour ? `R$ ${profile.priceperhour}` : '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Atende</p>
                      <p className="text-sm font-bold text-gray-800">A partir 1h</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Status</p>
                      <p className={`text-sm font-bold ${profile.is_available !== false ? 'text-green-500' : 'text-red-400'}`}>
                        {profile.is_available !== false ? 'Online' : 'Ocupada'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{reliabilityLabel}</span>
                      <span className={`text-sm font-bold ${reliabilityTextClass}`}>{normalizedReliabilityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${reliabilityFillClass}`}
                        style={{ width: `${normalizedReliabilityScore}%` }}
                      />
                    </div>
                    <div className="mt-4">
                      <VoicePlayer 
                        audioUrl={profile.audio_url || ''} 
                        companionName={profile.name} 
                      />
                    </div>
                  </div>
                </div>

                {/* Own profile banner - desktop */}
                {isOwnProfile && (
                  <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-800 text-sm">Complete seu perfil</p>
                      <span className="text-sm font-bold text-[#d91d83]">{profileCompleteness}%</span>
                    </div>
                    <div className="w-full bg-pink-100 rounded-full h-2 mb-3">
                      <div className="bg-[#d91d83] h-2 rounded-full" style={{ width: `${profileCompleteness}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Perfis completos têm até 5x mais visualizações</p>
                    <button onClick={() => navigate(`/editar-perfil/${id}`)}
                      className="w-full bg-[#d91d83] text-white py-2.5 rounded-full text-sm font-semibold">
                      Completar informações
                    </button>
                  </div>
                )}

                {/* Payment */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Formas de Pagamento</h3>
                  <div className="flex gap-4">
                    {[
                      { icon: Smartphone, label: 'Pix' },
                      { icon: DollarSign, label: 'Dinheiro' },
                      { icon: CreditCard, label: 'Cartão' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5">
                        <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                          <Icon size={18} />
                        </div>
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA button - desktop */}
                {!isOwnProfile && profile.is_available !== false && (
                  <div className="space-y-3">
                    <button onClick={() => setShowContactPopup(true)}
                      className="w-full bg-[#d91d83] text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:bg-[#c01872] transition-colors">
                      <Phone className="w-4 h-4" />
                      Contato
                    </button>
                    <p className="text-center text-xs text-gray-400">Inicie um atendimento personalizado agora mesmo.</p>
                  </div>
                )}
                {!isOwnProfile && profile.is_available === false && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500">Esta acompanhante esta offline</p>
                    <p className="text-xs text-gray-400 mt-1">Os contatos ficam disponiveis quando ela estiver online.</p>
                  </div>
                )}
                {isOwnProfile && (
                  <button onClick={() => navigate(`/editar-perfil/${id}`)}
                    className="w-full bg-[#d91d83] text-white py-3.5 rounded-full font-semibold">
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA (mobile only) ── */}
      {!isOwnProfile && profile?.is_available !== false && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
          <button onClick={() => setShowContactPopup(true)}
            className="w-full bg-[#d91d83] text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
            <Phone className="w-4 h-4" />
            Contato
          </button>
        </div>
      )}
      {!isOwnProfile && profile?.is_available === false && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
          <div className="bg-gray-50 rounded-full py-3.5 text-center">
            <p className="text-sm font-semibold text-gray-400">Offline — contatos indisponiveis</p>
          </div>
        </div>
      )}
      {isOwnProfile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
          <button onClick={() => navigate(`/editar-perfil/${id}`)}
            className="w-full bg-[#d91d83] text-white py-3.5 rounded-full font-semibold">
            Editar Perfil
          </button>
        </div>
      )}

      <Footer />

      {/* ── CONTACT POPUP ── */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          onClick={() => setShowContactPopup(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 text-center">
              <button onClick={() => setShowContactPopup(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-bold text-gray-900">Como prefere conversar?</h3>
              <p className="text-sm text-gray-500 mt-1">Inicie um atendimento personalizado agora mesmo.</p>
            </div>

            {/* Options */}
            <div className="px-5 pb-5 space-y-2.5">
              {/* Chat do site */}
              <button onClick={() => { setShowContactPopup(false); navigate(`/mensagens?companion_id=${id}`); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-pink-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-[#d91d83] flex items-center justify-center flex-shrink-0 shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-semibold text-gray-800 block">Chat do site</span>
                  <span className="text-[10px] font-bold text-[#d91d83] uppercase tracking-wider">Atendimento recomendado</span>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-300 group-hover:text-pink-500 transition-colors" />
              </button>

              {/* WhatsApp */}
              <button onClick={() => { setShowContactPopup(false); openWhatsApp(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-1 text-left">WhatsApp</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
              </button>

              {/* Telegram */}
              <button onClick={() => { setShowContactPopup(false); if (profile?.phone) window.open(`https://t.me/+${formatPhoneForWhatsApp(profile.phone)}`, '_blank'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2AABEE] to-[#229ED9] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-1 text-left">Telegram</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>

              {/* Chamada de Voz */}
              <button onClick={() => { setShowContactPopup(false); if (profile?.phone) window.location.href = `tel:${profile.phone}`; }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <PhoneCall className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-1 text-left">Chamada de Voz</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 py-3 text-center">
              <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em]">Faixa Rosa · Atendimento de Elite</p>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center photo-lightbox"
          onClick={() => setActivePhoto(null)}>
          <img src={activePhoto} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            onClick={() => setActivePhoto(null)}>✕</button>
        </div>
      )}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-[105] flex items-center justify-center p-4 photo-lightbox"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
              onClick={() => setActiveVideo(null)}
              aria-label="Fechar vídeo"
            >
              <X className="h-5 w-5" />
            </button>
            <video
              key={activeVideo}
              src={activeVideo}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="w-full max-h-[85vh] rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
