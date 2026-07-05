import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket, Zap, Clock, Lightbulb, Calendar, Moon, Users, PartyPopper, CalendarDays,
  CheckCircle2, Eye, ArrowLeft, AlertCircle, Timer, TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActiveBoostData {
  id: string;
  plan_name: string;
  badge_text: string;
  started_at: string;
  expires_at: string;
  hours_remaining: number;
  minutes_remaining: number;
  duration_hours: number;
  progress: number; // 0-100
}

interface BoostPlan {
  id: string;
  name: string;
  duration_hours: number;
  price: number;
  badge_text: string;
  highlight_color: string;
  position_priority: number;
}

const MAX_BOOSTS_PER_DAY = 3;
const MIN_HOURS_BETWEEN_BOOSTS = 6;

const MyBoosts: React.FC = () => {
  const navigate = useNavigate();
  const [activeBoost, setActiveBoost] = useState<ActiveBoostData | null>(null);
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Get companion ID
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCompanionId(parsed?.companionId || parsed?.id || null);
      }
    } catch { setCompanionId(null); }
  }, []);

  // Load active boost and plans
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load plans
        const { data: plansData } = await supabase
          .from('boost_plans')
          .select('*')
          .eq('is_active', true)
          .order('position_priority', { ascending: true });

        setPlans(plansData || []);

        // Check active boost
        if (companionId) {
          const { data } = await supabase
            .from('active_boosts')
            .select(`
              id, started_at, expires_at,
              boost_plans (name, duration_hours, badge_text)
            `)
            .eq('companion_id', companionId)
            .eq('is_active', true)
            .eq('payment_status', 'approved')
            .gt('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data) {
            const expiresAt = new Date(data.expires_at);
            const startedAt = new Date(data.started_at);
            const now = new Date();
            const totalMs = expiresAt.getTime() - startedAt.getTime();
            const elapsedMs = now.getTime() - startedAt.getTime();
            const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());
            const hoursRemaining = remainingMs / (1000 * 60 * 60);
            const minutesRemaining = remainingMs / (1000 * 60);

            setActiveBoost({
              id: data.id,
              plan_name: (data.boost_plans as any)?.name || 'Boost',
              badge_text: (data.boost_plans as any)?.badge_text || 'BOOST',
              started_at: data.started_at,
              expires_at: data.expires_at,
              hours_remaining: Math.floor(hoursRemaining),
              minutes_remaining: Math.floor(minutesRemaining % 60),
              duration_hours: (data.boost_plans as any)?.duration_hours || 1,
              progress: Math.min(100, (elapsedMs / totalMs) * 100),
            });
          } else {
            setActiveBoost(null);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar boosts:', err);
      }
      setLoading(false);
    };

    load();
  }, [companionId, tick]);

  // Live countdown
  useEffect(() => {
    if (!activeBoost) return;
    const interval = setInterval(() => setTick(t => t + 1), 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeBoost]);

  // Cancel boost
  const handleCancel = async () => {
    if (!activeBoost) return;
    setIsDeactivating(true);
    try {
      await supabase.from('active_boosts').update({ is_active: false }).eq('id', activeBoost.id);
      setActiveBoost(null);
      setShowDeactivateModal(false);
      setTick(t => t + 1);
    } catch (err) {
      alert('Erro ao cancelar boost.');
    } finally {
      setIsDeactivating(false);
    }
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <main className="flex-grow max-w-3xl mx-auto px-4 py-6 w-full">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/companion-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Subidas</h1>
            <p className="text-sm text-gray-500">Gerencie seus boosts e veja seu status</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Carregando...</div>
        ) : (
          <>
            {/* ====== ACTIVE BOOST CARD ====== */}
            {activeBoost ? (
              <div className="mb-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-200/40 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Boost Ativo</span>
                  </div>

                  <h2 className="text-2xl font-bold mb-1">{activeBoost.plan_name}</h2>
                  <p className="text-sm opacity-80 mb-4">
                    Badge: {activeBoost.badge_text} · Duração: {activeBoost.duration_hours}h
                  </p>

                  {/* Countdown */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium opacity-80">Tempo restante</span>
                      <span className="text-xs font-medium opacity-80">{Math.round(activeBoost.progress)}% usado</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-white/20 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-white rounded-full h-2.5 transition-all duration-1000"
                        style={{ width: `${100 - activeBoost.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <span className="text-4xl font-bold">{activeBoost.hours_remaining}</span>
                        <span className="text-sm ml-1 opacity-80">h</span>
                      </div>
                      <span className="text-2xl font-light opacity-50">:</span>
                      <div className="text-center">
                        <span className="text-4xl font-bold">{String(activeBoost.minutes_remaining).padStart(2, '0')}</span>
                        <span className="text-sm ml-1 opacity-80">min</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs opacity-70 mb-4">
                    <span>Iniciou: {new Date(activeBoost.started_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Expira: {new Date(activeBoost.expires_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/15 hover:bg-white/25 transition-colors border border-white/20"
                  >
                    Desativar Subida
                  </button>
                </div>
              </div>
            ) : (
              /* No active boost */
              <div className="mb-8 bg-gray-100 rounded-3xl p-6 text-center border-2 border-dashed border-gray-300">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-700 mb-1">Nenhum boost ativo</h2>
                <p className="text-sm text-gray-500 mb-4">Seu perfil não está em destaque no momento.</p>
                <button
                  onClick={() => navigate('/subidas')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-lg shadow-pink-200"
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Ativar Subida
                </button>
              </div>
            )}

            {/* ====== AVAILABLE PLANS ====== */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-pink-500" />
                Planos Disponíveis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-800">{plan.name}</h4>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold text-white"
                        style={{ backgroundColor: plan.highlight_color || '#d91d83' }}
                      >
                        {plan.badge_text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {plan.duration_hours}h de duração
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <TrendingUp className="w-3 h-3" /> Prioridade {plan.position_priority}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-pink-600">
                        {plan.price > 0 ? `R$ ${plan.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/subidas?plan=${plan.id}`)}
                      disabled={!!activeBoost}
                      className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        activeBoost
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-pink-500 hover:bg-pink-600 text-white'
                      }`}
                    >
                      {activeBoost ? 'Boost já ativo' : 'Ativar'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ====== TIPS ====== */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Melhores Horários
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Moon size={18} className="text-pink-500" />, label: 'À noite', sub: '19h - 23h' },
                  { icon: <Users size={18} className="text-pink-500" />, label: 'Sexta/Sábado', sub: 'Alta procura' },
                  { icon: <PartyPopper size={18} className="text-pink-500" />, label: 'Feriados', sub: 'O dia todo' },
                  { icon: <CalendarDays size={18} className="text-pink-500" />, label: 'Início de mês', sub: 'Pagamentos' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 text-center border border-gray-100">
                    <div className="mb-2 flex justify-center">{item.icon}</div>
                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ====== QUICK TIPS ====== */}
            <section className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Dicas Rápidas</h3>
              <ul className="space-y-2">
                {[
                  'Use subidas quando estiver realmente disponível para atender',
                  'Combine boost com Stories recentes para mais impacto',
                  'Ative nos horários de pico da sua cidade',
                  `Máximo de ${MAX_BOOSTS_PER_DAY} subidas por dia, com intervalo mínimo de ${MIN_HOURS_BETWEEN_BOOSTS}h entre elas`,
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>

      {/* Deactivation confirmation modal */}
      {showDeactivateModal && activeBoost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Warning icon */}
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Confirmar Desativacao
            </h2>

            <p className="text-sm text-gray-500 text-center mb-5">
              Voce tem certeza que deseja desativar sua subida? Esta acao nao pode ser desfeita.
            </p>

            {/* Remaining time card */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-[#d91d83]" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Tempo Restante</span>
                </div>
                <span className="text-base font-bold text-[#d91d83]">
                  {activeBoost.hours_remaining}h {String(activeBoost.minutes_remaining).padStart(2, '0')}min
                </span>
              </div>
              {/* Progress */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${100 - activeBoost.progress}%`,
                    backgroundColor: '#d91d83',
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Voce perdera o tempo restante ao desativar
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#d91d83' }}
              >
                Manter Ativa
              </button>
              <button
                onClick={handleCancel}
                disabled={isDeactivating}
                className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isDeactivating ? 'Desativando...' : 'Desativar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBoosts;
