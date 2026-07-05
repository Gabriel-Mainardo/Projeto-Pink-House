import { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, X, Clock, AlertTriangle, CheckCircle, Trash2, Search, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActiveBoost {
  id: string;
  companion_id: string;
  plan_id: string;
  payment_status: string;
  payment_method: string;
  amount_paid: number;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  companion_name: string;
  companion_image: string;
  plan_name: string;
  plan_duration: number;
  badge_text: string;
  hours_remaining: number;
  is_expired: boolean;
}

const AdminBoosts = () => {
  const [boosts, setBoosts] = useState<ActiveBoost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [stats, setStats] = useState({ total: 0, active: 0, expired_not_cleaned: 0 });

  const loadBoosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('active_boosts')
        .select(`
          *,
          companion:acompanhantes!companion_id (id, name, display_name, image),
          plan:boost_plans!plan_id (name, duration_hours, badge_text)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const mapped: ActiveBoost[] = (data || []).map((b: any) => {
        const expiresAt = new Date(b.expires_at);
        const hoursRemaining = Math.max(0, (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
        const isExpired = expiresAt <= now;
        return {
          id: b.id,
          companion_id: b.companion_id,
          plan_id: b.plan_id,
          payment_status: b.payment_status,
          payment_method: b.payment_method,
          amount_paid: b.amount_paid || 0,
          started_at: b.started_at,
          expires_at: b.expires_at,
          is_active: b.is_active,
          companion_name: b.companion?.display_name || b.companion?.name || 'Desconhecida',
          companion_image: b.companion?.image || '/default-profile.png',
          plan_name: b.plan?.name || 'Plano removido',
          plan_duration: b.plan?.duration_hours || 0,
          badge_text: b.plan?.badge_text || 'BOOST',
          hours_remaining: Math.round(hoursRemaining * 10) / 10,
          is_expired: isExpired,
        };
      });

      setBoosts(mapped);
      setStats({
        total: mapped.length,
        active: mapped.filter(b => !b.is_expired && b.is_active).length,
        expired_not_cleaned: mapped.filter(b => b.is_expired && b.is_active).length,
      });
    } catch (err) {
      console.error('Erro ao carregar boosts:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadBoosts(); }, [loadBoosts]);

  // Client-side expiration cleanup (Task C)
  const cleanupExpired = async () => {
    const expiredActive = boosts.filter(b => b.is_expired && b.is_active);
    if (expiredActive.length === 0) {
      alert('Nenhum boost expirado para limpar.');
      return;
    }

    if (!confirm(`Desativar ${expiredActive.length} boost(s) expirado(s)?`)) return;

    try {
      const ids = expiredActive.map(b => b.id);
      const { error } = await supabase
        .from('active_boosts')
        .update({ is_active: false })
        .in('id', ids);

      if (error) throw error;
      alert(`${expiredActive.length} boost(s) desativado(s) com sucesso!`);
      await loadBoosts();
    } catch (err) {
      console.error('Erro ao limpar boosts:', err);
      alert('Erro ao desativar boosts expirados.');
    }
  };

  const deactivateBoost = async (boostId: string, companionName: string) => {
    if (!confirm(`Desativar boost de ${companionName}?`)) return;

    try {
      const { error } = await supabase
        .from('active_boosts')
        .update({ is_active: false })
        .eq('id', boostId);

      if (error) throw error;
      await loadBoosts();
    } catch (err) {
      console.error('Erro ao desativar boost:', err);
      alert('Erro ao desativar boost.');
    }
  };

  const deleteBoost = async (boostId: string, companionName: string) => {
    if (!confirm(`Deletar permanentemente o boost de ${companionName}?`)) return;

    try {
      const { error } = await supabase
        .from('active_boosts')
        .delete()
        .eq('id', boostId);

      if (error) throw error;
      await loadBoosts();
    } catch (err) {
      console.error('Erro ao deletar boost:', err);
      alert('Erro ao deletar boost.');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const filtered = boosts.filter(b => {
    if (filter === 'active' && (b.is_expired || !b.is_active)) return false;
    if (filter === 'expired' && !b.is_expired) return false;
    if (search) {
      return b.companion_name.toLowerCase().includes(search.toLowerCase()) || b.plan_name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xl font-bold text-gray-700">{stats.total}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Total Boosts</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-xl font-bold text-green-600">{stats.active}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Ativos Agora</p>
        </div>
        <div className={`rounded-xl p-3 border ${stats.expired_not_cleaned > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between mb-1">
            <AlertTriangle className={`w-4 h-4 ${stats.expired_not_cleaned > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={`text-xl font-bold ${stats.expired_not_cleaned > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.expired_not_cleaned}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Expirados (não limpos)</p>
        </div>
      </div>

      {/* Alert: expired not cleaned */}
      {stats.expired_not_cleaned > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-xs font-medium text-red-700">
            {stats.expired_not_cleaned} boost(s) expirado(s) ainda marcados como ativos! O cron pode não estar funcionando.
          </span>
          <button onClick={cleanupExpired} className="ml-auto text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700">
            Limpar agora
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300"
          />
        </div>
        {(['all', 'active', 'expired'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filter === f ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Expirados'}
          </button>
        ))}
        <button onClick={loadBoosts} className="ml-auto text-gray-400 hover:text-pink-500">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Boost List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Nenhum boost encontrado</div>
        ) : (
          filtered.map(boost => (
            <div
              key={boost.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                boost.is_expired
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : boost.is_active
                    ? 'bg-white border-green-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <img
                src={boost.companion_image}
                alt=""
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 truncate">{boost.companion_name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    boost.is_expired ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'
                  }`}>
                    {boost.is_expired ? 'Expirado' : 'Ativo'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">
                  {boost.plan_name} · {boost.badge_text} · {boost.payment_method}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[9px] text-gray-400">Início: {formatDate(boost.started_at)}</span>
                  <span className="text-[9px] text-gray-400">Expira: {formatDate(boost.expires_at)}</span>
                  {!boost.is_expired && (
                    <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {boost.hours_remaining}h restantes
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!boost.is_expired && boost.is_active && (
                  <button
                    onClick={() => deactivateBoost(boost.id, boost.companion_name)}
                    className="text-amber-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-50"
                    title="Desativar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteBoost(boost.id, boost.companion_name)}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBoosts;
