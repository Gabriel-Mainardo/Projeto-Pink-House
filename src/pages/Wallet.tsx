import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  Coins,
  Gift,
  History,
  Loader2,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { PixPaymentModal } from '../components/PixPaymentModal';
import { usePinkWallet } from '../hooks/usePinkWallet';
import { pinkWalletService } from '../services/pinkWalletService';
import type { PinkcoinPackage, WalletActivity } from '../types/pinkEconomy';

type HistoryFilter = 'all' | 'purchases' | 'consumption' | 'cashback' | 'rewards';

const numberFormatter = new Intl.NumberFormat('pt-BR');
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const filterActivity = (activity: WalletActivity, filter: HistoryFilter) => {
  if (filter === 'all') return true;
  if (filter === 'purchases') return activity.currency === 'pinkcoins' && activity.transaction_type === 'purchase';
  if (filter === 'consumption') return activity.currency === 'pinkcoins' && activity.transaction_type === 'consumption';
  if (filter === 'cashback') return activity.currency === 'pinkpoints' && activity.source === 'pinkcoin_cashback';
  return activity.currency === 'pinkpoints' && ['redemption', 'refund'].includes(activity.transaction_type);
};

const activityIcon = (activity: WalletActivity) => {
  if (activity.source === 'pinkcoin_cashback') return Sparkles;
  if (activity.transaction_type === 'purchase') return ShoppingBag;
  if (activity.transaction_type === 'redemption') return Gift;
  return activity.amount > 0 ? ArrowDownLeft : ArrowUpRight;
};

const Wallet = () => {
  const navigate = useNavigate();
  const { wallet, activity, loading, error, refresh } = usePinkWallet(true);
  const [packages, setPackages] = useState<PinkcoinPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PinkcoinPackage | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    let active = true;
    pinkWalletService.getActivePackages()
      .then((data) => {
        if (active) setPackages(data);
      })
      .catch(() => {
        if (active) setPackages([]);
      })
      .finally(() => {
        if (active) setPackagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredActivity = useMemo(
    () => activity.filter((item) => filterActivity(item, filter)),
    [activity, filter],
  );

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#d91d83]" />
          Carregando sua PinkWallet
        </div>
      </main>
    );
  }

  if (error || !wallet) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <section className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-[#d91d83]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PinkWallet protegida</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error?.message || 'Faça login como acompanhante para acessar sua carteira.'}
          </p>
          <button
            onClick={() => navigate('/companion/login')}
            className="mt-7 h-11 rounded-lg bg-[#d91d83] px-6 text-sm font-bold text-white hover:bg-[#b90a69]"
          >
            Entrar como acompanhante
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[#d91d83]">PinkWallet</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Sua economia PinkHouse</h1>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Saldos e movimentações registrados em histórico auditável.
              </p>
            </div>
            <button
              onClick={() => setShowPackages(true)}
              disabled={packagesLoading || packages.length === 0}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d91d83] px-5 text-sm font-bold text-white transition-colors hover:bg-[#b90a69] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {packagesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Comprar PinkCoins
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Saldo PinkCoins</span>
              <Coins className="h-5 w-5 text-[#d91d83]" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{numberFormatter.format(wallet.pinkcoins_balance)}</p>
            <p className="mt-2 text-xs text-gray-400">Moeda para recursos da plataforma</p>
          </div>

          <button
            onClick={() => navigate('/rewards')}
            className="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Saldo PinkPoints</span>
              <Award className="h-5 w-5 text-[#d91d83]" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{numberFormatter.format(wallet.pinkpoints_balance)}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#d91d83]">
              Abrir Estante de Recompensas <ArrowUpRight className="h-3 w-3" />
            </p>
          </button>
        </section>

        {packages.length === 0 && !packagesLoading && (
          <section className="mt-5 flex items-start gap-3 border-l-4 border-[#d91d83] bg-white px-4 py-3 text-sm text-gray-600">
            <ReceiptText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#d91d83]" />
            Os pacotes de PinkCoins estão em configuração. Nenhuma cobrança será criada até que preços e quantidades sejam definidos pela administração.
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <History className="h-5 w-5 text-[#d91d83]" /> Histórico
              </h2>
              <p className="mt-1 text-xs text-gray-400">Compras, consumos, cashback e recompensas.</p>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
              {([
                ['all', 'Todos'],
                ['purchases', 'Compras'],
                ['consumption', 'Consumos'],
                ['cashback', 'Cashback'],
                ['rewards', 'Recompensas'],
              ] as Array<[HistoryFilter, string]>).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    filter === value ? 'bg-white text-[#d91d83] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {filteredActivity.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <History className="mx-auto h-7 w-7 text-gray-300" />
                <p className="mt-3 text-sm font-semibold text-gray-600">Nenhuma movimentação nesta categoria</p>
                <p className="mt-1 text-xs text-gray-400">As operações aparecerão aqui automaticamente.</p>
              </div>
            ) : (
              filteredActivity.map((item) => {
                const Icon = activityIcon(item);
                const positive = item.amount > 0;
                return (
                  <div key={`${item.currency}-${item.id}`} className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0 sm:px-5">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${positive ? 'bg-green-50 text-green-600' : 'bg-pink-50 text-[#d91d83]'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{item.description}</p>
                      <p className="mt-1 text-xs text-gray-400">{dateFormatter.format(new Date(item.created_at))}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${positive ? 'text-green-600' : 'text-gray-800'}`}>
                        {positive ? '+' : ''}{numberFormatter.format(item.amount)}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-gray-400">
                        {item.currency === 'pinkcoins' ? 'PinkCoins' : 'PinkPoints'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {showPackages && (
        <div className="fixed inset-0 z-[180] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={() => setShowPackages(false)}>
          <section className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-white sm:rounded-lg" onClick={(event) => event.stopPropagation()}>
            <header className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Comprar PinkCoins</h2>
                <p className="mt-1 text-xs text-gray-400">O saldo será liberado após confirmação do pagamento.</p>
              </div>
              <button onClick={() => setShowPackages(false)} className="p-2 text-gray-400 hover:text-gray-700" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {packages.map((pinkcoinPackage) => (
                <button
                  key={pinkcoinPackage.id}
                  onClick={() => setSelectedPackage(pinkcoinPackage)}
                  className="border border-gray-200 p-4 text-left transition-colors hover:border-[#d91d83] hover:bg-pink-50"
                >
                  <p className="text-xs font-semibold text-gray-400">{pinkcoinPackage.name}</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">{numberFormatter.format(pinkcoinPackage.coins_amount)} PinkCoins</p>
                  <p className="mt-3 text-sm font-bold text-[#d91d83]">R$ {Number(pinkcoinPackage.price_brl).toFixed(2).replace('.', ',')}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedPackage && (
        <PixPaymentModal
          isOpen
          onClose={() => setSelectedPackage(null)}
          onPaymentConfirmed={() => {
            setSelectedPackage(null);
            setShowPackages(false);
            void refresh();
          }}
          productName={selectedPackage.name}
          value={Number(selectedPackage.price_brl)}
          transactionType="pinkcoins"
          referenceId={selectedPackage.code}
          description={`Compra de ${selectedPackage.coins_amount} PinkCoins`}
          successMessage="PinkCoins creditadas na sua carteira."
        />
      )}
    </main>
  );
};

export default Wallet;
