import { useNavigate } from 'react-router-dom';
import { Award, Gift, Loader2, Sparkles } from 'lucide-react';
import { usePinkWallet } from '../hooks/usePinkWallet';

const formatter = new Intl.NumberFormat('pt-BR');

const PinkPoints = () => {
  const navigate = useNavigate();
  const { wallet, activity, loading, error } = usePinkWallet(true);
  const pointsActivity = activity.filter((item) => item.currency === 'pinkpoints');

  if (loading) {
    return <main className="flex min-h-[70vh] items-center justify-center bg-gray-50"><Loader2 className="h-6 w-6 animate-spin text-[#d91d83]" /></main>;
  }

  if (error || !wallet) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16 text-center">
        <Award className="mx-auto h-8 w-8 text-[#d91d83]" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">PinkPoints protegidos</h1>
        <p className="mt-2 text-sm text-gray-500">{error?.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-9 sm:px-6">
          <p className="text-xs font-bold uppercase text-[#d91d83]">Programa de fidelidade</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{formatter.format(wallet.pinkpoints_balance)} PinkPoints</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Cada PinkCoin consumida gera {formatter.format(wallet.pinkpoints_per_pinkcoin)} PinkPoints. Compras de PinkCoins não geram pontos, e o saldo não pode ser transferido ou sacado.
          </p>
          <button onClick={() => navigate('/rewards')} className="mt-6 flex h-11 items-center gap-2 rounded-lg bg-[#d91d83] px-5 text-sm font-bold text-white">
            <Gift className="h-4 w-4" /> Abrir Estante de Recompensas
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Sparkles className="h-5 w-5 text-[#d91d83]" /> Histórico de PinkPoints</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {pointsActivity.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-500">Nenhuma movimentação de PinkPoints ainda.</div>
          ) : pointsActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 last:border-0">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-800">{item.description}</p><p className="mt-1 text-xs text-gray-400">{new Date(item.created_at).toLocaleString('pt-BR')}</p></div>
              <p className={`text-sm font-bold ${item.amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>{item.amount > 0 ? '+' : ''}{formatter.format(item.amount)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default PinkPoints;
