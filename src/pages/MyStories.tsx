import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Video,
  Upload,
  Image,
  Eye,
  MessageSquare,
  TrendingUp,
  MapPin,
  Check,
  Info
} from 'lucide-react';

// Types
interface ActiveStory {
  id: string;
  image: string;
  views: number;
  timeLeft: string;
}

interface Highlight {
  id: string;
  title: string;
  image: string;
}

interface DurationOption {
  id: string;
  label: string;
  description: string;
}

// Toggle Component
interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-pink-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const MyStories: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState('24h');
  const [privacySettings, setPrivacySettings] = useState({
    loggedInOnly: true,
    replies: true,
    publicStories: false,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeStories: ActiveStory[] = [
    { id: '1', image: 'https://picsum.photos/seed/person1/100/100', views: 245, timeLeft: '23h' },
    { id: '2', image: 'https://picsum.photos/seed/person2/100/100', views: 120, timeLeft: '12h' },
    { id: '3', image: 'https://picsum.photos/seed/person3/100/100', views: 98, timeLeft: '2h' },
  ];

  const highlights: Highlight[] = [
    { id: '1', title: 'Viagens', image: 'https://picsum.photos/seed/travel/100/100' },
    { id: '2', title: 'Lifestyle', image: 'https://picsum.photos/seed/life/100/100' },
  ];

  const durationOptions: DurationOption[] = [
    { id: '7h', label: '7 horas', description: 'Urgência' },
    { id: '24h', label: '24 horas', description: 'Padrão' },
    { id: '48h', label: '48 horas', description: 'Mais exposição' },
    { id: '7d', label: '7 dias ★', description: 'Fixo no perfil' },
  ];

  return (
    <>
      <div className="min-h-screen pb-20 max-w-6xl mx-auto px-4 md:px-8 bg-gray-50">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate('/companion-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Meus Stories</h1>
          <div className="w-8"></div>
        </header>

        {/* Intro text */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm leading-relaxed">
            Stories são uma forma rápida de atrair novos clientes, aumentar sua visibilidade na cidade e mostrar que você está ativa.
            <br />
            Perfis com Stories recebem muito mais mensagens e aparecem mais vezes para clientes próximos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stories Ativos */}
            <section className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Stories Ativos</h2>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 mt-1"></span>
              </div>
              <p className="text-gray-400 text-xs mb-6">
                Stories ficam ativos por um tempo limitado e aparecem para clientes da sua cidade. Quanto mais Stories você publica, mais vezes seu perfil aparece.
              </p>
              <div className="flex gap-8">
                {activeStories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-1">
                    <div className="relative p-1 rounded-full border-2 border-pink-500">
                      <img
                        src={story.image}
                        alt="Story"
                        className="w-16 h-16 rounded-full object-cover grayscale-[0.2]"
                      />
                    </div>
                    <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                      {story.timeLeft}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-0.5">
                      <Eye size={14} />
                      <span>{story.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Novo Story */}
            <section className="bg-white rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Novo Story</h2>
                <p className="text-gray-400 text-xs mb-6">
                  Duração máxima: 15 segundos. Stories muito curtos têm mais visualizações.
                </p>
                <div className="flex gap-4">
                  <button className="flex-1 border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-pink-200 transition-colors group">
                    <div className="p-3 bg-pink-50 rounded-xl text-pink-500 group-hover:bg-pink-100 transition-colors">
                      <Video size={24} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-600">Gravar vídeo</span>
                  </button>
                  <button className="flex-1 border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-pink-200 transition-colors group">
                    <div className="p-3 bg-pink-50 rounded-xl text-pink-500 group-hover:bg-pink-100 transition-colors">
                      <Upload size={24} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-600">Enviar vídeo</span>
                  </button>
                  <button className="flex-1 border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-pink-200 transition-colors group">
                    <div className="p-3 bg-pink-50 rounded-xl text-pink-500 group-hover:bg-pink-100 transition-colors">
                      <Image size={24} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-600">Enviar foto</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Duração</h3>
                <p className="text-gray-400 text-[10px] mb-4">Escolha quanto tempo quer que seu Story fique visível.</p>
                <div className="space-y-2">
                  {durationOptions.map((opt) => {
                    const isActive = selectedDuration === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedDuration(opt.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200'
                            : 'bg-white border-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="text-left">
                          <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{opt.label}</div>
                          <div className={`text-[9px] ${isActive ? 'text-pink-100' : 'text-gray-400'}`}>{opt.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-white bg-white' : 'border-gray-200'}`}>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-pink-600"></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Destaques */}
            <section className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Destaques</h2>
                <div className="flex gap-2">
                  <button className="bg-pink-50 text-pink-500 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <span className="text-sm">+</span> Adicionar
                  </button>
                  <button className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <span className="text-xs">✎</span> Renomear
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-8">
                Você pode fixar Stories no seu perfil por até 7 dias.
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                  <button className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-colors">
                    <span className="text-2xl font-light">+</span>
                  </button>
                  <span className="text-[10px] text-gray-600">Criar</span>
                </div>
                {highlights.map((h) => (
                  <div key={h.id} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden p-1 bg-gray-100">
                      <img src={h.image} alt={h.title} className="w-full h-full rounded-full object-cover mix-blend-multiply opacity-80" />
                    </div>
                    <span className="text-[10px] text-gray-600">{h.title}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Dicas para mais mensagens */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-transparent">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-pink-500"><Info size={18} /></div>
                <h2 className="text-base font-bold text-gray-800">Dicas para mais mensagens</h2>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">O QUE POSTAR?</h3>
                <ul className="space-y-2">
                  {[
                    'Estou disponível agora',
                    'Tenho horários hoje',
                    'Estarei em tal bairro',
                    'Estou viajando / Cheguei',
                    'Promoções & Eventos',
                    'Novidades'
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 p-4 bg-pink-50 rounded-2xl italic text-[11px] text-gray-500 leading-relaxed text-center">
                "Stories funcionam como uma vitrine instantânea. Clientes gostam de ver que você está ativa."
              </div>
            </section>

            {/* Benefícios comerciais */}
            <section className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-800 mb-2">Benefícios comerciais</h2>
              <p className="text-gray-400 text-[10px] mb-6">
                Stories são uma das formas mais rápidas de conquistar novas visitas no seu perfil.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: <Eye size={18} />, label: 'Mais visualizações' },
                  { icon: <MessageSquare size={18} />, label: 'Mais mensagens' },
                  { icon: <TrendingUp size={18} />, label: 'Aparece mais vezes' },
                  { icon: <MapPin size={18} />, label: 'Destaque por cidade' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                    <div className="text-pink-500">{item.icon}</div>
                    <span className="text-[9px] font-bold text-gray-700 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 text-green-600 text-[10px] font-bold p-3 rounded-xl flex items-center justify-center gap-2">
                <TrendingUp size={18} />
                Perfis ativos recebem até 57% mais conversas
              </div>
            </section>

            {/* Privacidade */}
            <section className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-800 mb-6">Privacidade</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">Apenas clientes logados</span>
                  <Toggle
                    enabled={privacySettings.loggedInOnly}
                    onChange={(val) => setPrivacySettings(prev => ({ ...prev, loggedInOnly: val }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">Permitir replies no chat</span>
                  <Toggle
                    enabled={privacySettings.replies}
                    onChange={(val) => setPrivacySettings(prev => ({ ...prev, replies: val }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">Esconder stories públicos</span>
                  <Toggle
                    enabled={privacySettings.publicStories}
                    onChange={(val) => setPrivacySettings(prev => ({ ...prev, publicStories: val }))}
                  />
                </div>
              </div>
            </section>

            {/* Conteúdo Permitido Warning */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-start border border-gray-100">
              <div className="text-gray-400 mt-0.5"><Info size={18} /></div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">CONTEÚDO PERMITIDO</h4>
                <p className="text-[9px] text-gray-400 leading-normal">
                  Conteúdos sensuais são permitidos. <br />
                  <span className="text-red-500">Nude explícito será removido automaticamente.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button className="bg-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-2xl shadow-pink-400 flex items-center gap-2 hover:bg-pink-700 transition-all active:scale-95">
              Salvar mudanças
              <Check size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <footer className="mt-12 max-w-2xl mx-auto text-center">
          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-white">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Publique Stories todos os dias para aumentar sua visibilidade e receber mais mensagens. <br />
              Perfis com Stories ativos aparecem mais vezes para clientes, especialmente quando estão na mesma região.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default MyStories;
