import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Eye,
  PenLine,
  Image as ImageIcon,
  MapPin,
  History,
  TrendingUp,
  Zap,
  Star,
  MessageSquareText,
  Trophy,
  CreditCard,
  ArrowLeft,
  LogOut,
  Gift,
  Tag,
  Radio,
  Heart,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProfileVerificationModal from './ProfileVerificationModal';
import Footer from '../components/Footer';
import VirtualAssistantChat from '../components/VirtualAssistantChat';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { User, MapPin } from 'lucide-react';


const ProfileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuario");
  const [userLocation, setUserLocation] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showLowReliabilityWarning, setShowLowReliabilityWarning] = useState(false);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [reliability, setReliability] = useState(20); // Confiabilidade em %

  // Buscar dados do usuário do localStorage e do banco
  useEffect(() => {
    const fetchUserData = async () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setUserName(parsedUser.name || "Usuario");
          setUserLocation(parsedUser.location || "");
          const id = parsedUser.companionId || null;
          setCompanionId(id);

          // Buscar status de disponibilidade do banco
          if (id) {
            const { data, error } = await supabase
              .from('acompanhantes')
              .select('is_available')
              .eq('id', id)
              .single();

            if (!error && data) {
              setIsAvailable(data.is_available || false);
            }
          }
        } catch {
          setUserName("Usuario");
          setUserLocation("");
          setCompanionId(null);
        }
      }

      // Buscar dados de autenticação temporários se existirem
      const tempAuthData = localStorage.getItem('tempAuthData');
      if (tempAuthData) {
        try {
          const authData = JSON.parse(tempAuthData);
          if (authData.artisticName) {
            setUserName(authData.artisticName);
          }
        } catch {
          // Ignore
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tempAuthData');
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  const handleViewProfile = () => {
    if (companionId) {
      navigate(`/profile/${companionId}`);
    } else {
      console.warn('CompanionId não encontrado. Complete seu cadastro primeiro.');
    }
  };

  const handleEditInfo = () => {
    if (companionId) {
      navigate(`/editar-perfil/${companionId}`);
    } else {
      console.warn('CompanionId não encontrado. Complete seu cadastro primeiro.');
    }
  };

  const handleManagePhotos = () => {
    navigate('/photo-video-manager');
  };

  const handleChangeCity = () => {
    navigate('/location-register');
  };

  const handleMyStories = () => {
    navigate('/my-stories');
  };

  const handleMySubidas = () => {
    navigate('/my-boosts');
  };

  const handleComprarSubida = () => {
    navigate('/subidas');
  };

  // Função para atualizar disponibilidade
  const handleToggleAvailability = async () => {
    if (!companionId) {
      console.warn('CompanionId não encontrado');
      return;
    }

    const newAvailability = !isAvailable;

    // VERIFICAR CONFIABILIDADE antes de ATIVAR
    if (newAvailability && reliability < 40) {
      // Se está tentando ATIVAR e a confiabilidade é baixa, mostrar aviso
      setShowLowReliabilityWarning(true);
      return;
    }

    // Atualizar estado local imediatamente para melhor UX
    setIsAvailable(newAvailability);

    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('acompanhantes')
        .update({
          is_available: newAvailability,
          updated_at: new Date().toISOString()
        })
        .eq('id', companionId);

      if (error) {
        console.error('Erro ao atualizar disponibilidade:', error);
        // Reverter estado em caso de erro
        setIsAvailable(!newAvailability);
        alert('Erro ao atualizar disponibilidade. Tente novamente.');
      } else {
        console.log('✅ Disponibilidade atualizada com sucesso:', newAvailability);
      }
    } catch (err) {
      console.error('Erro ao atualizar disponibilidade:', err);
      // Reverter estado em caso de erro
      setIsAvailable(!newAvailability);
      alert('Erro ao atualizar disponibilidade. Tente novamente.');
    }
  };

  // Função para forçar ativar mesmo com confiabilidade baixa
  const handleForceActivate = async () => {
    setShowLowReliabilityWarning(false);
    setIsAvailable(true);

    try {
      const { error } = await supabase
        .from('acompanhantes')
        .update({
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', companionId);

      if (error) {
        console.error('Erro ao atualizar disponibilidade:', error);
        setIsAvailable(false);
        alert('Erro ao atualizar disponibilidade. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao atualizar disponibilidade:', err);
      setIsAvailable(false);
      alert('Erro ao atualizar disponibilidade. Tente novamente.');
    }
  };

  return (
    <div className="space-y-0 md:space-y-6">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center p-4 bg-gray-50">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-center text-gray-900 pr-8" style={{ }}>
          Meu Perfil
        </h1>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h2 className="text-2xl text-slate-900" style={{ }}>Meu Perfil</h2>
        <p className="text-slate-500 text-sm mt-1" style={{ }}>Gerencie suas informacoes e atividades.</p>
      </div>

      {/* Mobile Profile Summary */}
      <div className="md:hidden flex flex-col items-center mb-0 px-5 pt-2">
        <div className="relative mb-3">
          <div className="w-24 h-24 p-1 rounded-full border-2 border-pink-500">
            <img
              src="https://picsum.photos/200/200"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <h2 className="text-xl font-bold text-gray-900" style={{ }}>{userName}</h2>
          <CheckCircle2 className="w-5 h-5 text-pink-500 fill-pink-500" strokeWidth={0} />
        </div>
        <p className="text-gray-500 text-sm" style={{ }}>
          25, {userLocation || "São Paulo/SP"}
        </p>
      </div>

      {/* Desktop Profile Card */}
      <div className="hidden md:flex bg-slate-50 rounded-3xl p-6 shadow-sm border border-slate-100 items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#FF007F] bg-white">
            <img
              src="https://picsum.photos/200/200"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl text-slate-900" style={{ }}>{userName}</h3>
            <span className="text-[#FF007F]">
              <CheckCircle2 size={18} fill="#FF007F" className="text-white" />
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1" style={{ }}>{userLocation || "Localização não definida"}</p>
        </div>
      </div>

      {/* Reliability Banner */}
      <div className="bg-pink-50 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-sm border border-pink-100 mx-5 md:mx-0 mt-5 md:mt-0">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-800 text-sm" style={{ }}>Confiabilidade do Perfil: 20%</span>
          </div>
          <div className="w-full bg-gray-200 md:bg-pink-100 rounded-full h-2.5 mb-3">
            <div className="bg-pink-500 md:bg-[#FF007F] h-2.5 rounded-full w-1/5 transition-all duration-500 md:shadow-[0_0_10px_rgba(255,0,127,0.5)]"></div>
          </div>
          <p className="text-xs text-gray-500 md:text-slate-500 leading-relaxed" style={{ }}>
            Complete etapas de seguranca para aumentar sua visibilidade e ganhar PinkUps.
          </p>
        </div>
        <button
          onClick={() => setShowVerificationModal(true)}
          className="w-full md:w-auto py-3 md:px-6 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 md:bg-[#FF007F] md:hover:bg-[#e6006e] text-white font-bold rounded-xl md:rounded-full text-sm transition-all shadow-md shadow-pink-200 md:shadow-lg md:shadow-pink-200 whitespace-nowrap"
          style={{ }}
        >
          Completar verificacoes
        </button>
      </div>

      {/* Seção: Indique e Ganhe + Disponibilidade na mesma linha */}
      <section className="flex flex-col md:flex-row gap-4 mb-6 mx-5 md:mx-0 mt-6 md:mt-0">

        {/* Botão Indique e Ganhe */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer group active:scale-95">
          <Zap size={22} className="text-[#d91d83] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-[#d91d83] text-lg">Indique e ganhe</span>
        </div>

        {/* Toggle de Disponibilidade */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ícone com animação de pulso quando ativo */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAvailable ? 'bg-pink-100 text-[#d91d83]' : 'bg-gray-100 text-gray-400'}`}>
              <Radio size={20} className={isAvailable ? 'animate-pulse' : ''} />
            </div>
            <span className="font-bold text-gray-800 text-sm md:text-base">Disponível para atendimento</span>
          </div>

          {/* Switch (Toggle) */}
          <button
            onClick={handleToggleAvailability}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none ${
              isAvailable ? 'bg-[#d91d83]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

      </section>

      {/* Mobile Section Title */}
      <div className="md:hidden px-5 mt-6">
        <h3 className="font-bold text-gray-900 mb-2 text-sm" style={{ }}>Gerenciamento da Conta</h3>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-6 mt-0 md:mt-0">

        {/* Left Column: Menu Items */}
        <div className="lg:col-span-2 space-y-4 md:space-y-4">
          <div className="md:bg-slate-50 md:rounded-3xl md:p-6 md:shadow-sm md:border md:border-slate-100 rounded-2xl shadow-sm overflow-hidden mx-5 md:mx-0">
            <h4 className="hidden md:block text-slate-900 mb-6" style={{ }}>Gerenciamento da Conta</h4>
            <div className="space-y-4 md:space-y-4">
              <MenuItem
                icon={Eye}
                iconColor="bg-blue-100 text-blue-600"
                label="Ver meu perfil"
                onClick={handleViewProfile}
              />
              <MenuItem
                icon={PenLine}
                iconColor="bg-purple-100 text-purple-600"
                label="Editar Informacoes"
                onClick={handleEditInfo}
              />
              <MenuItem
                icon={ImageIcon}
                iconColor="bg-pink-100 text-pink-600"
                label="Gerenciar Fotos e Videos"
                onClick={handleManagePhotos}
              />
              <MenuItem
                icon={Zap}
                iconColor="bg-yellow-100 text-yellow-600"
                label="Comprar Subida"
                subLabel={
                  <span className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5" style={{ }}>
                    Destaque seu perfil no topo
                  </span>
                }
                onClick={handleComprarSubida}
              />
              <MenuItem
                icon={MapPin}
                iconColor="bg-green-100 text-green-600"
                label="Mudar Cidade"
                onClick={handleChangeCity}
              />
              <MenuItem
                icon={History}
                iconColor="bg-orange-100 text-orange-600"
                label="Meus Stories"
                onClick={handleMyStories}
              />
              <MenuItem
                icon={TrendingUp}
                iconColor="bg-indigo-100 text-indigo-600"
                label="Minhas Subidas"
                onClick={handleMySubidas}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Widgets */}
        <div className="space-y-6 md:space-y-6 mt-6 md:mt-0">

          {/* Stats Grid - Mobile version with different layout */}
          <div className="md:hidden flex flex-col gap-3 px-5 mb-6">
            {/* Top Row: Points and Reviews */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[100px]">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <span className="text-xl font-bold text-gray-900" style={{ }}>3.480</span>
                <span className="text-xs text-gray-500" style={{ }}>PinkPoints</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[100px]">
                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-gray-900" style={{ }}>4.8</span>
                  <span className="text-xs text-gray-400" style={{ }}>(120)</span>
                </div>
                <span className="text-xs text-gray-500" style={{ }}>Avaliações</span>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-xl font-bold text-gray-900" style={{ }}>5</span>
                <span className="text-xs text-gray-500 uppercase" style={{ }}>Mensagens</span>
              </div>
            </div>

            {/* Bottom Row: Ranking and Coupons */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[100px]">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-xl font-bold text-gray-900" style={{ }}>12ª</span>
                <span className="text-xs text-gray-500" style={{ }}>Ranking</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[100px]">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <Tag className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-xl font-bold text-gray-900" style={{ }}>3</span>
                <span className="text-xs text-gray-500" style={{ }}>Cupons</span>
              </div>
            </div>
          </div>

          {/* Desktop Stats - Keep original layout */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
                <Star size={16} className="text-yellow-500" fill="currentColor" />
              </div>
              <span className="text-xl text-slate-900" style={{ }}>3,480</span>
              <span className="text-xs text-slate-500" style={{ }}>PinkPoints</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
               <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
                <Star size={16} className="text-yellow-500" />
              </div>
              <span className="text-xl text-slate-900" style={{ }}>4.8 <span className="text-sm text-slate-400" style={{ }}>(120)</span></span>
              <span className="text-xs text-slate-500" style={{ }}>Avaliacoes</span>
            </div>
          </div>

          {/* Messages - Desktop */}
          <div className="hidden md:flex bg-blue-50 p-6 rounded-3xl border border-blue-100 flex-col items-center text-center shadow-sm">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-600">
                <MessageSquareText size={20} />
             </div>
             <span className="text-2xl text-slate-900" style={{ }}>5</span>
             <span className="text-xs text-slate-500 uppercase tracking-wide" style={{ }}>Mensagens</span>
          </div>

          {/* Ranking - Desktop */}
          <div className="hidden md:flex bg-yellow-50/50 p-6 rounded-3xl border border-yellow-100 items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Trophy size={20} />
              </div>
              <div>
                <h5 className="text-slate-900 text-sm" style={{ }}>Ranking Geral</h5>
                <p className="text-xs text-slate-500" style={{ }}>Pontuacao: 8.540 pts</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xl text-slate-900" style={{ }}>12a</span>
              <span className="text-xs text-slate-500" style={{ }}>colocada</span>
            </div>
          </div>

          {/* Wallet - Desktop */}
          <div className="hidden md:flex bg-slate-50 p-5 rounded-3xl shadow-sm border border-slate-100 items-center justify-between">
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#FF007F]">
                <CreditCard size={20} />
              </div>
              <div>
                <h5 className="text-slate-900 text-sm" style={{ }}>Rositas</h5>
                <p className="text-xl text-slate-900" style={{ }}>R$ 1.250</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>

        </div>

      </div>

      {/* Mobile Logout Button */}
      <button
        onClick={handleLogout}
        className="md:hidden flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mt-8 px-7"
      >
        <LogOut className="w-5 h-5" />
        <span style={{ }}>Sair</span>
      </button>

      {/* Modal de Aviso - Confiabilidade Baixa */}
      {showLowReliabilityWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Ícone de Alerta */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h3 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-3" style={{ }}>
              ⚠️ Atenção!
            </h3>

            {/* Mensagem */}
            <div className="space-y-3 mb-6">
              <p className="text-center text-gray-700 text-sm md:text-base" style={{ }}>
                Sua <strong className="text-pink-600">confiabilidade está muito baixa ({reliability}%)</strong>.
              </p>
              <p className="text-center text-gray-600 text-sm" style={{ }}>
                Isso pode afetar negativamente:
              </p>
              <ul className="text-left text-gray-600 text-sm space-y-2 pl-6" style={{ }}>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span>Sua <strong>posição no catálogo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span>O número de <strong>visualizações do seu perfil</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span>A <strong>confiança dos clientes</strong></span>
                </li>
              </ul>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              {/* Botão Completar Cadastro */}
              <button
                onClick={() => {
                  setShowLowReliabilityWarning(false);
                  setShowVerificationModal(true);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ }}
              >
                ✨ Completar Cadastro
              </button>

              {/* Botão Ativar Mesmo Assim */}
              <button
                onClick={handleForceActivate}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all"
                style={{ }}
              >
                Ativar mesmo assim
              </button>

              {/* Botão Cancelar */}
              <button
                onClick={() => setShowLowReliabilityWarning(false)}
                className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors text-sm"
                style={{ }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Verificação de Perfil */}
      <ProfileVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );
};

export default ProfileDashboard;
