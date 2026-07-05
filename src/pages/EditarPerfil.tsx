import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { completeProfile } from '../services/verificationService';
import {
  Briefcase,
  Check,
  ChevronLeft,
  Circle,
  Clock,
  DollarSign,
  HelpCircle,
  MapPin,
  Save,
  ShieldCheck,
  User,
  Users,
  AlignLeft,
} from 'lucide-react';
import { toast } from 'sonner';

enum Availability {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
  className?: string;
  borderColor?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, badge, className = '', borderColor }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${borderColor ? `border-l-4 ${borderColor}` : 'border-transparent'} ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-pink-50 p-2 rounded-lg text-pink-600">
            {icon}
          </div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
        </div>
        {badge && (
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded uppercase tracking-widest">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, wrapperClassName = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <input
        {...props}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
      />
    </div>
  );
};

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  count?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, count, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
      <div className="relative">
        <textarea
          {...props}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[120px] transition-all scrollbar-hide"
        />
        {count && (
          <span className="absolute bottom-3 right-4 text-[11px] text-gray-400 font-medium">
            {count}
          </span>
        )}
      </div>
    </div>
  );
};

const parseLocation = (location?: string | null) => {
  if (!location) {
    return { city: '', neighborhood: '' };
  }

  const [city = '', ...rest] = location.split(' - ');
  return {
    city: city.trim(),
    neighborhood: rest.join(' - ').trim()
  };
};

const EditarPerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromVerification = searchParams.get('fromVerification') === 'true';
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState(18);
  const [height, setHeight] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [availability, setAvailability] = useState<Availability>(Availability.ONLINE);
  const [minRate, setMinRate] = useState(300);
  const [selectedAudience, setSelectedAudience] = useState<string[]>(['Homens', 'Casais']);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Jantar a dois', 'Massagem', 'Conversa']);
  const [hasOwnLocation, setHasOwnLocation] = useState(false);
  const [acceptsClientLocation, setAcceptsClientLocation] = useState(false);
  const [acceptsMotel, setAcceptsMotel] = useState(false);

  const services = [
    'Jantar a dois', 'Massagem', 'Conversa', 'Viagens',
    'Eventos sociais', 'Strip', 'Dominação leve', 'Outros'
  ];

  const toggleAudience = (item: string) => {
    setSelectedAudience((prev) =>
      prev.includes(item) ? prev.filter((current) => current !== item) : [...prev, item]
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((current) => current !== service) : [...prev, service]
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        toast.error('ID da acompanhante não encontrado');
        navigate('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('acompanhantes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const parsedLocation = parseLocation(data.location);

          setName(data.display_name || data.name || '');
          setPhone(data.phone || '');
          setAge(data.age || 18);
          setHeight(data.height || '');
          setCity(parsedLocation.city || data.cities_served?.[0] || '');
          setNeighborhood(parsedLocation.neighborhood);
          setAboutMe(data.description || '');
          setMinRate(Number(data.priceperhour) || 300);
          setSelectedServices(Array.isArray(data.tags) ? data.tags : []);
          setHasOwnLocation(Boolean(data.hasownlocation));
          setAcceptsClientLocation(Boolean(data.acceptsclientlocation));
          setAcceptsMotel(Boolean(data.acceptsmotel));
          setAvailability(data.is_available === false ? Availability.OFFLINE : Availability.ONLINE);
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Não foi possível carregar os dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!id) {
      toast.error('ID da acompanhante não encontrado');
      return;
    }

    setIsSaving(true);

    try {
      const location = neighborhood.trim() ? `${city.trim()} - ${neighborhood.trim()}` : city.trim();
      const { data, error } = await supabase
        .from('acompanhantes')
        .update({
          name: name.trim(),
          display_name: name.trim(),
          phone: phone.trim(),
          age,
          height: height.trim() || null,
          location,
          cities_served: city.trim() ? [city.trim()] : [],
          description: aboutMe.trim(),
          priceperhour: minRate,
          tags: selectedServices,
          hasownlocation: hasOwnLocation,
          acceptsclientlocation: acceptsClientLocation,
          acceptsmotel: acceptsMotel,
          is_available: availability === Availability.ONLINE,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, name, display_name, location, phone, height, is_available')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado ao salvar o perfil.');

      await completeProfile(id);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({
            ...parsedUser,
            name: data.display_name || data.name || parsedUser.name,
            location: data.location || parsedUser.location,
            phone: data.phone || parsedUser.phone,
            height: data.height || parsedUser.height,
            is_available: data.is_available ?? parsedUser.is_available
          }));
        } catch (parseError) {
          console.error('Erro ao atualizar user local apos salvar perfil:', parseError);
        }
      }

      toast.success('Perfil atualizado com sucesso');
      setTimeout(() => {
        if (fromVerification) {
          navigate('/companion-dashboard?openVerification=true');
        } else {
          navigate('/companion-dashboard');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          font-family: 'Poppins', sans-serif !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen pb-24 bg-[#f3f4f6]">
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/companion-dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-600"></div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Editar Informações</h1>
          </div>
          <div className="w-20"></div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <Card title="Dados Pessoais" icon={<User size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="Nome do perfil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <InputField
                  label="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <InputField
                  label="Idade"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
                />
                <InputField
                  label="Altura"
                  placeholder="Ex: 1,70"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>

              <div className="mt-4 flex items-center gap-2 text-blue-500 bg-blue-50/50 p-2 rounded-lg">
                <HelpCircle size={14} />
                <p className="text-[10px] font-medium opacity-80 uppercase tracking-tight">
                  Esses campos agora refletem exatamente o que é salvo no perfil.
                </p>
              </div>
            </Card>

            <Card title="Localização" icon={<MapPin size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <InputField
                  label="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>
            </Card>

            <Card title="Sobre mim" icon={<AlignLeft size={20} />}>
              <TextareaField
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                count={`${aboutMe.length}/500`}
                maxLength={500}
              />
            </Card>

            <Card
              title="Segurança"
              icon={<ShieldCheck size={20} />}
              badge="Somente Visualização"
              borderColor="border-l-pink-600"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-700">Confiabilidade do Perfil</span>
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-pink-600 w-[20%]"></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 max-w-[180px] leading-tight font-medium">
                      Complete as etapas para aumentar sua confiabilidade e ganhar destaque.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-pink-600">20%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Selfie', status: 'Verificado', color: 'green' },
                    { label: 'Documento', status: 'Pendente', color: 'gray' },
                    { label: 'Reconhecimento Facial', status: 'Pendente', color: 'gray' },
                    { label: 'Vídeo-chamada', status: 'Pendente', color: 'gray' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.color === 'green' ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}>
                          {item.color === 'green' ? <Check size={12} strokeWidth={4} /> : <Circle size={10} className="text-gray-300" />}
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.status === 'Verificado' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-pink-100">
                  <ShieldCheck size={18} />
                  Completar verificações
                </button>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card title="Atendimento" icon={<Users size={20} />}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Quem você atende?</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Homens', 'Mulheres', 'Casais'].map((item) => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => toggleAudience(item)}
                          className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedAudience.includes(item) ? 'bg-pink-600 border-pink-600' : 'border-gray-200'}`}
                        >
                          {selectedAudience.includes(item) && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Onde atende?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                    {[
                      { label: 'Local próprio', checked: hasOwnLocation, toggle: () => setHasOwnLocation((prev) => !prev) },
                      { label: 'Local do cliente', checked: acceptsClientLocation, toggle: () => setAcceptsClientLocation((prev) => !prev) },
                      { label: 'Motel', checked: acceptsMotel, toggle: () => setAcceptsMotel((prev) => !prev) },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={item.toggle}
                          className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${item.checked ? 'bg-pink-600 border-pink-600' : 'border-gray-200'}`}
                        >
                          {item.checked && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Serviços Oferecidos" icon={<Briefcase size={20} />}>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selectedServices.includes(service) ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Disponibilidade" icon={<Clock size={20} />}>
              <div className="space-y-3">
                {[
                  { id: Availability.ONLINE, label: 'Disponível agora', dot: 'bg-green-500' },
                  { id: Availability.OFFLINE, label: 'Offline' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAvailability(option.id)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${availability === option.id ? 'border-pink-600 bg-white ring-2 ring-pink-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${availability === option.id ? 'border-pink-600' : 'border-gray-300'}`}>
                        {availability === option.id && <div className="w-2.5 h-2.5 rounded-full bg-pink-600"></div>}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{option.label}</span>
                    </div>
                    {option.dot && <div className={`w-2 h-2 rounded-full ${option.dot} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Cachê Mínimo" icon={<DollarSign size={20} />}>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Valor por hora</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input
                      type="number"
                      value={minRate}
                      onChange={(e) => setMinRate(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 text-xl font-black text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-pink-600">
                  <div className="bg-pink-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">!</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">O valor exibido será a partir de</p>
                </div>
              </div>
            </Card>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t px-6 py-4 flex items-center justify-center sm:justify-between z-[100]">
          <p className="hidden sm:block text-[11px] font-medium text-gray-400 tracking-tight">
            Certifique-se de salvar suas alterações antes de sair.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white px-10 py-4 rounded-2xl flex items-center gap-3 font-black text-sm transition-all shadow-xl shadow-pink-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </footer>
      </div>
    </>
  );
};

export default EditarPerfil;
