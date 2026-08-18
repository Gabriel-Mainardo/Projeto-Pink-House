import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Award, CheckCircle, Gift, Loader2, Lock, PackageX, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePinkWallet } from '../hooks/usePinkWallet';
import { rewardsService } from '../services/rewardsService';
import type { Reward, RewardRedemption } from '../types/pinkEconomy';

const numberFormatter = new Intl.NumberFormat('pt-BR');

const getCategory = (reward: Reward) => {
  const category = Array.isArray(reward.reward_categories)
    ? reward.reward_categories[0]
    : reward.reward_categories;
  return category || null;
};

const Rewards = () => {
  const navigate = useNavigate();
  const { wallet, loading: walletLoading, error: walletError, refresh: refreshWallet } = usePinkWallet();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const redemptionKeyRef = useRef<string | null>(null);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [catalog, history] = await Promise.all([
        rewardsService.getCatalog(),
        rewardsService.getMyRedemptions().catch(() => []),
      ]);
      setRewards(catalog);
      setRedemptions(history);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar as recompensas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    rewards.forEach((reward) => {
      const category = getCategory(reward);
      if (category) map.set(category.code, category.name);
    });
    return Array.from(map.entries());
  }, [rewards]);

  const visibleRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter((reward) => getCategory(reward)?.code === selectedCategory);

  const activeRedemptionFor = (rewardId: string) => redemptions.find(
    (redemption) => redemption.reward_id === rewardId
      && ['pending', 'approved', 'processing'].includes(redemption.status),
  );

  const confirmRedemption = async () => {
    if (!selectedReward) return;
    if (!redemptionKeyRef.current) {
      redemptionKeyRef.current = `reward:${selectedReward.id}:${crypto.randomUUID()}`;
    }

    setRedeeming(true);
    try {
      await rewardsService.redeem(selectedReward.id, redemptionKeyRef.current);
      toast.success('Resgate solicitado com sucesso.');
      setSelectedReward(null);
      redemptionKeyRef.current = null;
      await Promise.all([refreshWallet(), loadCatalog()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível concluir o resgate.');
    } finally {
      setRedeeming(false);
    }
  };

  if (walletLoading || loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#d91d83]" />
      </main>
    );
  }

  if (walletError || !wallet) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16 text-center">
        <Lock className="mx-auto h-8 w-8 text-[#d91d83]" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Acesso protegido</h1>
        <p className="mt-2 text-sm text-gray-500">{walletError?.message}</p>
        <button onClick={() => navigate('/companion/login')} className="mt-6 rounded-lg bg-[#d91d83] px-5 py-3 text-sm font-bold text-white">Entrar</button>
      </main>
    );
  }

  const minimumReached = wallet.pinkpoints_balance >= wallet.minimum_redemption_balance;

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[#d91d83]">PinkPoints</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Estante de Recompensas</h1>
              <p className="mt-2 text-sm text-gray-500">Troque seus pontos por benefícios dentro do ecossistema PinkHouse.</p>
            </div>
            <button onClick={() => navigate('/wallet')} className="text-left sm:text-right">
              <p className="text-xs font-semibold text-gray-400">Seu saldo</p>
              <p className="mt-1 text-2xl font-bold text-[#d91d83]">{numberFormatter.format(wallet.pinkpoints_balance)} PinkPoints</p>
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <section className={`flex items-start gap-3 border-l-4 bg-white px-4 py-4 ${minimumReached ? 'border-green-500' : 'border-[#d91d83]'}`}>
          {minimumReached ? <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" /> : <AlertCircle className="mt-0.5 h-5 w-5 text-[#d91d83]" />}
          <div>
            <p className="text-sm font-bold text-gray-800">{minimumReached ? 'Resgates liberados' : 'Continue acumulando PinkPoints'}</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {minimumReached
                ? 'Você já atingiu o saldo mínimo. Cada recompensa ainda exige o saldo indicado no card.'
                : `Os resgates são liberados ao atingir ${numberFormatter.format(wallet.minimum_redemption_balance)} PinkPoints.`}
            </p>
          </div>
        </section>

        {categories.length > 0 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCategory('all')} className={`rounded-lg px-4 py-2 text-xs font-bold ${selectedCategory === 'all' ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-500'}`}>Todas</button>
            {categories.map(([code, name]) => (
              <button key={code} onClick={() => setSelectedCategory(code)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold ${selectedCategory === code ? 'bg-[#d91d83] text-white' : 'bg-white text-gray-500'}`}>{name}</button>
            ))}
          </div>
        )}

        {visibleRewards.length === 0 ? (
          <section className="mt-8 border border-gray-200 bg-white px-5 py-14 text-center">
            <Gift className="mx-auto h-8 w-8 text-gray-300" />
            <h2 className="mt-4 text-lg font-bold text-gray-800">Recompensas em preparação</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">A estrutura está pronta, mas custos, estoque e benefícios ainda precisam ser definidos pela administração.</p>
          </section>
        ) : (
          <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleRewards.map((reward) => {
              const requested = activeRedemptionFor(reward.id);
              const outOfStock = reward.stock === 0;
              const enoughPoints = wallet.pinkpoints_balance >= reward.pinkpoints_cost;
              const disabled = !minimumReached || !enoughPoints || outOfStock || Boolean(requested);
              const category = getCategory(reward);

              return (
                <article key={reward.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] bg-gray-100">
                    {reward.image_url ? (
                      <img src={reward.image_url} alt={reward.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Award className="h-8 w-8 text-[#d91d83]" /></div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase text-[#d91d83]">{category?.name || 'Recompensa'}</p>
                    <h2 className="mt-1 line-clamp-2 text-sm font-bold text-gray-900 sm:text-base">{reward.name}</h2>
                    <p className="mt-3 text-sm font-bold text-gray-800">{numberFormatter.format(reward.pinkpoints_cost)} pts</p>
                    <p className="mt-1 text-[10px] text-gray-400">{reward.stock === null ? 'Disponível' : `${reward.stock} em estoque`}</p>
                    <button
                      onClick={() => {
                        redemptionKeyRef.current = null;
                        setSelectedReward(reward);
                      }}
                      disabled={disabled}
                      className="mt-4 h-9 w-full rounded-lg bg-[#d91d83] px-2 text-[11px] font-bold text-white disabled:bg-gray-200 disabled:text-gray-500 sm:text-xs"
                    >
                      {requested ? 'Resgate solicitado' : outOfStock ? 'Esgotado' : !minimumReached || !enoughPoints ? 'Saldo insuficiente' : 'Resgatar'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {selectedReward && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 p-4" onClick={() => !redeeming && setSelectedReward(null)}>
          <section className="w-full max-w-md rounded-lg bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#d91d83]">Confirmar resgate</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">{selectedReward.name}</h2>
              </div>
              <button onClick={() => setSelectedReward(null)} disabled={redeeming} className="p-1 text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 border-y border-gray-100 py-4">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Custo</span><strong>{numberFormatter.format(selectedReward.pinkpoints_cost)} PinkPoints</strong></div>
              <div className="mt-3 flex justify-between text-sm"><span className="text-gray-500">Saldo após resgate</span><strong>{numberFormatter.format(wallet.pinkpoints_balance - selectedReward.pinkpoints_cost)}</strong></div>
            </div>
            <p className="mt-4 text-xs leading-5 text-gray-500">O pedido será registrado como pendente e acompanhado pela administração até a entrega.</p>
            <button onClick={confirmRedemption} disabled={redeeming} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d91d83] text-sm font-bold text-white disabled:opacity-60">
              {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              Confirmar resgate
            </button>
          </section>
        </div>
      )}
    </main>
  );
};

export default Rewards;
