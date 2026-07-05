import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Link as LinkIcon,
  Copy,
  MessageCircle,
  FileText,
  UserPlus,
  Star,
  TrendingUp,
  Award,
  Clock,
  Gift
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// --- Types ---
interface Referral {
  id: string;
  name: string;
  status: 'Verificada' | 'Em análise' | 'Incompleto';
  date: string;
  earnings: string | null;
}

// --- Referral Table Component ---
const ReferralTable: React.FC = () => {
  const referrals: Referral[] = [
    { id: '1', name: 'Julia Santos', status: 'Verificada', date: '12 Out, 2023', earnings: '+ 30 Rositas' },
    { id: '2', name: 'Carla Dias', status: 'Em análise', date: '15 Out, 2023', earnings: '--' },
    { id: '3', name: 'Beatriz Lima', status: 'Incompleto', date: '18 Out, 2023', earnings: '--' },
  ];

  const getStatusStyle = (status: Referral['status']) => {
    switch (status) {
      case 'Verificada': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Em análise': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Incompleto': return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-sm border border-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Suas Indicadas</h2>
        <button className="text-sm font-semibold text-[#d91d83] hover:underline">Ver todas</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-50">
              <th className="pb-4 font-semibold">Nome</th>
              <th className="pb-4 font-semibold hidden sm:table-cell">Status</th>
              <th className="pb-4 font-semibold hidden md:table-cell">Data</th>
              <th className="pb-4 font-semibold text-right">Ganhos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {referrals.map((ref) => (
              <tr key={ref.id} className="group">
                <td className="py-4 lg:py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${ref.id}/40/40`} className="rounded-full w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 text-sm block">{ref.name}</span>
                      <span className={`sm:hidden px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(ref.status)}`}>
                        {ref.status}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 lg:py-5 hidden sm:table-cell">
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${getStatusStyle(ref.status)}`}>
                    <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                    {ref.status}
                  </span>
                </td>
                <td className="py-4 lg:py-5 hidden md:table-cell">
                  <span className="text-gray-400 text-sm">{ref.date}</span>
                </td>
                <td className="py-4 lg:py-5 text-right">
                  <span className={`text-sm font-bold ${ref.earnings?.includes('+') ? 'text-[#d91d83]' : 'text-gray-300'}`}>
                    {ref.earnings}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const IndiqueGanhe: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState(false);
  const referralLink = "faixarosa.com/convite/anasilva";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    toast({
      title: "Link copiado!",
      description: "O link de indicação foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Indique e Ganhe</h1>
          </div>
          <div className="bg-pink-50 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Star size={12} className="text-[#d91d83] fill-current" />
            <span className="text-[10px] font-bold text-[#d91d83]">Partner Plus</span>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Central Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">Indique e Ganhe</h1>
                  <p className="text-gray-400 text-sm font-medium mt-1">Convide amigas e desbloqueie benefícios exclusivos</p>
                </div>
              </div>

              <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-pink-50 flex items-center gap-3">
                <div className="bg-pink-100 p-1.5 rounded-full">
                  <Star size={14} className="text-[#d91d83] fill-current" />
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold">
                  <span className="text-gray-400 block -mb-0.5">Status da parceira</span>
                  <span className="text-[#d91d83]">Partner Plus</span>
                </div>
              </div>
            </div>

            {/* Invitation Card */}
            <div className="bg-white rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 shadow-sm border border-gray-50">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Convide outras acompanhantes</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-6 lg:mb-8">
                Compartilhe seu link exclusivo. Para cada amiga que se cadastrar e completar a verificação, você ganha recompensas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="flex-1 flex items-center bg-[#f9fafb] rounded-2xl px-4 lg:px-6 py-3 lg:py-4 border border-gray-100">
                  <span className="text-gray-600 font-medium text-sm truncate">{referralLink}</span>
                  <LinkIcon size={18} className="ml-auto text-gray-300 flex-shrink-0" />
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-[#d91d83] hover:bg-pink-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm shadow-lg shadow-pink-100 transition-all hover:scale-105"
                >
                  <Copy size={18} />
                  {copySuccess ? 'Copiado!' : 'Copiar link'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <button className="flex items-center justify-center gap-3 py-3 lg:py-4 px-4 lg:px-6 rounded-2xl bg-[#E7FBF3] text-[#00A86B] font-bold text-sm hover:bg-[#DFF8EE] transition-colors border border-[#D5F5E9]">
                  <MessageCircle size={20} />
                  Convidar pelo WhatsApp
                </button>
                <button className="flex items-center justify-center gap-3 py-3 lg:py-4 px-4 lg:px-6 rounded-2xl bg-[#f9fafb] text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-100">
                  <FileText size={20} />
                  Ver mensagens prontas
                </button>
              </div>
            </div>

            {/* Benefits Cards - Mobile Only */}
            <div className="lg:hidden space-y-4">
              {/* Main Action Card */}
              <div className="bg-gradient-to-br from-[#FF1E85] to-[#B2125C] rounded-[24px] p-5 text-white shadow-xl shadow-pink-200">
                <button className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-2xl backdrop-blur-sm">
                  <UserPlus size={22} />
                  <span className="font-bold">Indicar nova acompanhante</span>
                </button>
                <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-90">
                  <span className="text-pink-100">Convites disponíveis</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">10 restantes</span>
                </div>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-50">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Star size={18} className="text-yellow-500 fill-current" />
                  </div>
                  <span className="block text-lg font-black text-gray-900">+30</span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Rositas</span>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-50">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Gift size={18} className="text-[#d91d83]" />
                  </div>
                  <span className="block text-lg font-black text-gray-900">+15</span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">PinkPoints</span>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-50">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp size={18} className="text-purple-500" />
                  </div>
                  <span className="block text-lg font-black text-gray-900">+50</span>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Ranking</span>
                </div>
              </div>

              {/* Earnings Summary Mobile */}
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo dos seus ganhos</h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#f9fafb] rounded-2xl p-3 text-center border border-gray-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Rositas</span>
                    <span className="text-xl font-black text-gray-900">1.240</span>
                  </div>
                  <div className="bg-[#f9fafb] rounded-2xl p-3 text-center border border-gray-50">
                    <span className="text-[10px] uppercase font-bold text-[#d91d83] block mb-1">PinkPoints</span>
                    <span className="text-xl font-black text-[#d91d83]">850</span>
                  </div>
                </div>

                <div className="bg-[#f9fafb] rounded-2xl p-4 flex items-center justify-between border border-gray-50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Posição no Ranking</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-gray-900">#42</span>
                      <div className="flex items-center text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                        <TrendingUp size={12} className="mr-1" />
                        3
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Award size={20} className="text-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <ReferralTable />
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[340px] space-y-6">
            {/* Main Action Card */}
            <div className="bg-gradient-to-br from-[#FF1E85] to-[#B2125C] rounded-[32px] p-6 text-white shadow-xl shadow-pink-200">
              <button className="w-full flex items-center justify-center gap-4 bg-white/10 hover:bg-white/20 transition-colors py-5 rounded-2xl backdrop-blur-sm">
                <UserPlus size={24} />
                <span className="font-bold text-lg">Indicar nova acompanhante</span>
              </button>
              <div className="mt-6 flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-90">
                <span className="text-pink-100">Convites disponíveis</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">10 restantes</span>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="bg-pink-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6">Por cada indicação:</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/5 group-hover:bg-white/15 transition-all">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Star size={20} className="text-pink-700 fill-current" />
                    </div>
                    <div>
                      <span className="block text-lg font-black">+30</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Rositas</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/5 group-hover:bg-white/15 transition-all">
                    <div className="w-10 h-10 bg-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Gift size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="block text-lg font-black">+15</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">PinkPoints</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/5 group-hover:bg-white/15 transition-all">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="block text-lg font-black">+50</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Ranking</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decoration */}
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo dos seus ganhos</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#f9fafb] rounded-[24px] p-4 text-center border border-gray-50">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Rositas</span>
                  <span className="text-2xl font-black text-gray-900">1.240</span>
                </div>
                <div className="bg-[#f9fafb] rounded-[24px] p-4 text-center border border-gray-50">
                  <span className="text-[10px] uppercase font-bold text-[#d91d83] block mb-1">PinkPoints</span>
                  <span className="text-2xl font-black text-[#d91d83]">850</span>
                </div>
              </div>

              <div className="bg-[#f9fafb] rounded-[24px] p-5 flex items-center justify-between border border-gray-50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Posição no Ranking</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900">#42</span>
                    <div className="flex items-center text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                      <TrendingUp size={12} className="mr-1" />
                      3
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Award size={24} className="text-amber-500" />
                </div>
              </div>
            </div>

            {/* Weekly Goal */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Meta Semanal</h4>
                <p className="text-xs text-gray-400">Faltam 3 indicações</p>
              </div>
              <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-100">
                <Clock size={14} className="text-[#d91d83]" />
                <span className="text-[10px] font-bold text-[#d91d83] uppercase leading-none">2 dias<br/>rest.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile CTA Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <button className="w-full bg-gradient-to-r from-[#FF1E85] to-[#B2125C] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-pink-200">
          <UserPlus size={20} />
          Indicar nova acompanhante
        </button>
      </div>

    </div>
  );
};

export default IndiqueGanhe;
