import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acompanhantesService, type Acompanhante } from '../lib/supabase';
import { Heart, BadgeCheck, Play, Smartphone, CreditCard, DollarSign, Gift } from 'lucide-react';

const PerfilTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Acompanhante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getValidMediaUrl = (url: string | undefined): string => {
    const defaultImageUrl = "/default-profile.png";
    if (!url || url === 'foto/' || url === 'foto' || url.length < 10 || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return defaultImageUrl;
    }
    return url;
  };

  const formatPhoneForWhatsApp = (phoneNumber: string) => {
    const numbersOnly = phoneNumber.replace(/\D/g, '');
    if (numbersOnly.length <= 11) {
      return `55${numbersOnly}`;
    }
    return numbersOnly;
  };

  const formatLocation = (location: string) => {
    if (!location) return '';
    const parts = location.split(' - ').map(p => p.trim()).filter(p => p);
    if (parts.length >= 2) {
      const city = parts[parts.length - 2];
      const state = parts[parts.length - 1];
      const stateMap: { [key: string]: string } = {
        'Pernambuco': 'PE', 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG',
        'Bahia': 'BA', 'Ceará': 'CE', 'Paraíba': 'PB', 'Rio Grande do Norte': 'RN',
        'Alagoas': 'AL', 'Sergipe': 'SE', 'Piauí': 'PI', 'Maranhão': 'MA'
      };
      return `${city} - ${stateMap[state] || state}`;
    }
    return location;
  };

  const openWhatsApp = () => {
    if (profile && profile.phone) {
      const formattedPhone = formatPhoneForWhatsApp(profile.phone);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=Olá ${profile.name}, vi seu perfil no Faixa Rosa e gostaria de conversar.`;
      window.open(whatsappUrl, '_blank');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await acompanhantesService.getById(id);
        setProfile(profileData);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
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
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600 mb-4">O perfil que você está procurando não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const mockDescription = 'Olá! Sou uma acompanhante de luxo, discreta e elegante. Adoro conhecer pessoas interessantes e proporcionar momentos inesquecíveis. Sou carinhosa, atenciosa e sempre busco superar as expectativas.';
  const mockServices = ['Massagem', 'Jantar Romântico', 'Acompanhante de Eventos', 'Viagens', 'Pernoite', 'Final de Semana'];

  const photos = profile.gallery?.filter(url => url && url.trim() !== '').map((url, index) => ({
    id: index + 1,
    url: getValidMediaUrl(url)
  })) || [];

  const videos = profile.videos?.filter(url => url && url.trim() !== '').map((url, index) => ({
    id: index + 1,
    url,
    thumbnail: undefined,
    tag: undefined
  })) || [];

  const services = (profile.tags && profile.tags.length > 0)
    ? profile.tags.map((tag, index) => ({ id: index + 1, label: tag }))
    : mockServices.map((service, index) => ({ id: index + 1, label: service }));

  const stories = photos.slice(0, 5).map((photo, index) => ({
    id: index + 1,
    image: photo.url,
    viewed: false
  }));

  const description = profile.description && profile.description.trim() !== '' ? profile.description : mockDescription;

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-white font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Sidebar) */}
        <aside className="lg:col-span-1">
          <div className="flex flex-col gap-6">
            {/* Profile Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm bg-white group max-h-96">
              <img
                src={getValidMediaUrl(profile.image)}
                alt={profile.name}
                className="w-full h-96 object-cover"
              />
              <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-pink-600 hover:scale-110 transition-transform">
                <Heart size={20} fill="currentColor" />
              </button>
            </div>

            {/* Details List */}
            <div className="bg-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg mb-4 text-gray-900" style={{ }}>Detalhes</h3>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Localização</p>
                  <p className="text-gray-900" style={{ }}>{formatLocation(profile.location)}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Detalhes Físicos</p>
                  <p className="text-gray-900" style={{ }}>{profile.altura || '1,65'}, {profile.peso || '55kg'}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Cachê mínimo</p>
                  <p className="text-gray-900" style={{ }}>R$ {profile.priceperhour || 300}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Tempo de atendimento</p>
                  <p className="text-gray-900" style={{ }}>A partir de 1h</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Atende</p>
                  <p className="text-gray-900" style={{ }}>Homens, Casais</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide" style={{ }}>Preferências</p>
                  <p className="text-gray-900" style={{ }}>Não fumantes</p>
                </div>
              </div>
            </div>

            {/* Price / Action Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500" style={{ }}>A partir de</span>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="text-3xl text-gray-900" style={{ }}>R$ {profile.priceperhour || 300}</span>
              </div>
              <button
                onClick={openWhatsApp}
                className="w-full bg-pink-600 text-white py-3 px-6 rounded-full hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
                style={{ }}
              >
                Enviar mensagem
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column (Main Content) */}
        <section className="lg:col-span-2">
          <div className="flex flex-col gap-8">

            {/* Header Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl text-gray-900" style={{ }}>{profile.name}</h1>
                <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>
                <BadgeCheck className="w-8 h-8 text-pink-600" fill="currentColor" />
              </div>
              <p className="text-gray-500 text-sm" style={{ }}>{profile.age || 25} anos, {formatLocation(profile.location)}</p>
            </div>

            {/* Trust Bar & Gift Button */}
            <div className="bg-gray-100 rounded-3xl p-6 shadow-sm -mt-4">
              <div className="mb-2">
                <span className="text-gray-900" style={{ }}>Confiança máxima</span>
              </div>
              <div className="w-full bg-white rounded-full h-2.5 mb-2">
                <div className="bg-pink-600 h-2.5 rounded-full w-full shadow-[0_0_10px_rgba(230,0,126,0.5)]"></div>
              </div>
              <p className="text-xs text-gray-500 mb-4" style={{ }}>Esse perfil cumpriu todas etapas de verificação</p>

              <button className="w-full bg-pink-600 text-white py-3 px-6 rounded-full hover:bg-pink-700 transition-colors flex items-center justify-center gap-2" style={{ }}>
                <Gift size={18} />
                Enviar Presente
              </button>
            </div>

            {/* Stories */}
            {stories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl text-gray-900" style={{ }}>Stories</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {stories.map((story) => (
                    <div key={story.id} className="flex-shrink-0 cursor-pointer">
                      <div className={`p-[2px] rounded-full border-2 border-pink-600`}>
                        <img
                          src={story.image}
                          alt="Story"
                          className="w-16 h-16 rounded-full object-cover border-2 border-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div className="space-y-3">
              <h3 className="text-xl text-gray-900" style={{ }}>Sobre mim</h3>
              <div className="bg-transparent text-gray-600 leading-relaxed text-sm md:text-base" style={{ }}>
                {description} <span className="text-pink-600 cursor-pointer hover:underline" style={{ }}>Ver mais</span>
              </div>
            </div>

            {/* Photos Grid */}
            {photos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl text-gray-900" style={{ }}>Fotos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                      <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl text-gray-900" style={{ }}>Vídeos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video, index) => (
                    <div key={video.id} className={`relative rounded-2xl overflow-hidden bg-black group cursor-pointer ${index === 0 ? 'md:col-span-2 aspect-video' : 'aspect-video'}`}>
                      <img
                        src={video.thumbnail || video.url}
                        alt="Video"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      {video.tag && (
                        <span className="absolute top-4 left-4 bg-pink-600 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wider" style={{ }}>
                          {video.tag}
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${index === 0 ? 'w-16 h-16' : 'w-12 h-12'} bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform`}>
                          <Play fill="white" className="text-white" size={index === 0 ? 32 : 24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl text-gray-900" style={{ }}>Serviços Oferecidos</h3>
                <div className="flex flex-wrap gap-3">
                  {services.map((service) => (
                    <span
                      key={service.id}
                      className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm hover:bg-pink-200 transition-colors cursor-default"
                      style={{ }}
                    >
                      {service.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-xl text-gray-900" style={{ }}>Formas de Pagamento</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-600">
                    <Smartphone size={20} />
                  </div>
                  <span className="text-xs text-gray-500" style={{ }}>Pix</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-600">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-xs text-gray-500" style={{ }}>Dinheiro</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-600">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-xs text-gray-500" style={{ }}>Cartão</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default PerfilTest;
