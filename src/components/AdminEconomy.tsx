import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Coins, Gift, Loader2, Package, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import {
  adminEconomyService,
  type AdminEconomyOverview,
  type AdminResource,
} from '../services/adminEconomyService';

type Section = 'resources' | 'packages' | 'rewards' | 'redemptions' | 'wallets';

const EMPTY_PACKAGE = { code: '', name: '', coins_amount: '', price_brl: '' };
const EMPTY_REWARD = { code: '', name: '', category_id: '', pinkpoints_cost: '', stock: '', image_url: '' };
const EMPTY_OVERVIEW: AdminEconomyOverview = { resources: [], packages: [], categories: [], rewards: [], redemptions: [], wallets: [] };
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Nao foi possivel concluir a operacao.';

const AdminEconomy = () => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('resources');
  const [data, setData] = useState<AdminEconomyOverview>(EMPTY_OVERVIEW);
  const [resourceCosts, setResourceCosts] = useState<Record<string, string>>({});
  const [packageForm, setPackageForm] = useState(EMPTY_PACKAGE);
  const [rewardForm, setRewardForm] = useState(EMPTY_REWARD);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState({ userId: '', currency: 'pinkcoins' as 'pinkcoins' | 'pinkpoints', amount: '', reason: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const canManage = await adminEconomyService.isAuthorized();
    setAuthorized(canManage);
    if (canManage) {
      try {
        const overview = await adminEconomyService.getOverview();
        setData(overview);
        setResourceCosts(Object.fromEntries(overview.resources.map((item) => [item.id, item.pinkcoin_cost ?? ''])));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#d91d83]" /></div>;
  }

  if (!authorized) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h2 className="font-bold text-amber-900">Sessao administrativa segura necessaria</h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              O acesso local legado abre o painel, mas nao recebe permissao financeira. Entre com uma conta do Supabase Auth ativa e cadastrada em admin_users para gerenciar recursos, saldos e resgates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const saveResource = async (resource: AdminResource, active: boolean) => {
    const rawCost = resourceCosts[resource.id];
    const cost = rawCost === '' ? null : Number(rawCost);
    if (cost !== null && (!Number.isInteger(cost) || cost < 0)) return toast.error('Informe um custo inteiro valido.');
    if (active && cost === null) return toast.error('Defina o custo antes de ativar o recurso.');
    try {
      await adminEconomyService.saveResource(resource.id, cost, active);
      toast.success('Recurso atualizado.');
      await load();
    } catch (error: unknown) { toast.error(getErrorMessage(error)); }
  };

  const createPackage = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await adminEconomyService.savePackage({
        code: packageForm.code.trim().toUpperCase(),
        name: packageForm.name.trim(),
        coins_amount: Number(packageForm.coins_amount),
        price_brl: Number(packageForm.price_brl),
        active: false,
      });
      setPackageForm(EMPTY_PACKAGE);
      toast.success('Pacote criado inativo para revisao.');
      await load();
    } catch (error: unknown) { toast.error(getErrorMessage(error)); }
  };

  const createReward = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await adminEconomyService.saveReward({
        code: rewardForm.code.trim().toUpperCase(),
        name: rewardForm.name.trim(),
        category_id: rewardForm.category_id,
        pinkpoints_cost: Number(rewardForm.pinkpoints_cost),
        stock: rewardForm.stock === '' ? null : Number(rewardForm.stock),
        image_url: rewardForm.image_url.trim() || null,
        ...(editingRewardId ? {} : { active: false }),
      }, editingRewardId || undefined);
      setRewardForm(EMPTY_REWARD);
      setEditingRewardId(null);
      toast.success(editingRewardId ? 'Recompensa atualizada.' : 'Recompensa criada inativa para revisao.');
      await load();
    } catch (error: unknown) { toast.error(getErrorMessage(error)); }
  };

  const submitAdjustment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adjustment.reason.trim()) return toast.error('O motivo do ajuste e obrigatorio.');
    try {
      await adminEconomyService.adjustWallet(adjustment.userId, adjustment.currency, Number(adjustment.amount), adjustment.reason.trim());
      setAdjustment({ userId: '', currency: 'pinkcoins', amount: '', reason: '' });
      toast.success('Ajuste registrado no historico.');
      await load();
    } catch (error: unknown) { toast.error(getErrorMessage(error)); }
  };

  const sections: Array<{ id: Section; label: string; icon: typeof Coins }> = [
    { id: 'resources', label: 'Recursos', icon: Coins },
    { id: 'packages', label: 'Pacotes', icon: Package },
    { id: 'rewards', label: 'Recompensas', icon: Gift },
    { id: 'redemptions', label: 'Resgates', icon: ReceiptText },
    { id: 'wallets', label: 'Carteiras', icon: Wallet },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} onClick={() => setSection(item.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${section === item.id ? 'bg-[#d91d83] text-white' : 'bg-gray-100 text-gray-600'}`}><Icon className="h-4 w-4" />{item.label}</button>;
        })}
      </div>

      {section === 'resources' && <div className="space-y-3">
        <h2 className="text-xl font-bold">Precos dos recursos</h2>
        <p className="text-sm text-gray-500">Recursos sem custo definido permanecem inativos e preservam os fluxos atuais.</p>
        {data.resources.map((resource) => <div key={resource.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_160px_110px] md:items-center">
          <div><p className="font-semibold text-gray-900">{resource.name}</p><p className="text-xs text-gray-500">{resource.code}</p></div>
          <input aria-label={`Custo de ${resource.name}`} type="number" min="0" step="1" placeholder="Pendente" value={resourceCosts[resource.id] ?? ''} onChange={(event) => setResourceCosts((current) => ({ ...current, [resource.id]: event.target.value }))} className="h-10 rounded-lg border border-gray-300 px-3 text-sm" />
          <button onClick={() => void saveResource(resource, !resource.active)} className={`h-10 rounded-lg text-sm font-bold ${resource.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{resource.active ? 'Ativo' : 'Inativo'}</button>
        </div>)}
      </div>}

      {section === 'packages' && <div className="space-y-5">
        <form onSubmit={createPackage} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-5">
          <input required placeholder="Codigo" value={packageForm.code} onChange={(e) => setPackageForm({ ...packageForm, code: e.target.value })} className="h-10 rounded-lg border px-3" />
          <input required placeholder="Nome" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} className="h-10 rounded-lg border px-3" />
          <input required min="1" type="number" placeholder="PinkCoins" value={packageForm.coins_amount} onChange={(e) => setPackageForm({ ...packageForm, coins_amount: e.target.value })} className="h-10 rounded-lg border px-3" />
          <input required min="0.01" step="0.01" type="number" placeholder="Preco R$" value={packageForm.price_brl} onChange={(e) => setPackageForm({ ...packageForm, price_brl: e.target.value })} className="h-10 rounded-lg border px-3" />
          <button className="h-10 rounded-lg bg-[#d91d83] font-bold text-white">Criar inativo</button>
        </form>
        {data.packages.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Nenhum pacote comercial configurado.</p> : data.packages.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-semibold">{item.name}: {item.coins_amount} PinkCoins</p><p className="text-xs text-gray-500">R$ {Number(item.price_brl).toFixed(2)} | {item.code}</p></div><button onClick={async () => { await adminEconomyService.savePackage({ active: !item.active }, item.id); await load(); }} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold">{item.active ? 'Desativar' : 'Ativar'}</button></div>)}
      </div>}

      {section === 'rewards' && <div className="space-y-5">
        <form onSubmit={createReward} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-3">
          <input required placeholder="Codigo" value={rewardForm.code} onChange={(e) => setRewardForm({ ...rewardForm, code: e.target.value })} className="h-10 rounded-lg border px-3" />
          <input required placeholder="Nome" value={rewardForm.name} onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })} className="h-10 rounded-lg border px-3" />
          <select required value={rewardForm.category_id} onChange={(e) => setRewardForm({ ...rewardForm, category_id: e.target.value })} className="h-10 rounded-lg border px-3"><option value="">Categoria</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          <input required min="1" type="number" placeholder="Custo PinkPoints" value={rewardForm.pinkpoints_cost} onChange={(e) => setRewardForm({ ...rewardForm, pinkpoints_cost: e.target.value })} className="h-10 rounded-lg border px-3" />
          <input min="0" type="number" placeholder="Estoque (vazio = ilimitado)" value={rewardForm.stock} onChange={(e) => setRewardForm({ ...rewardForm, stock: e.target.value })} className="h-10 rounded-lg border px-3" />
          <input placeholder="URL da imagem" value={rewardForm.image_url} onChange={(e) => setRewardForm({ ...rewardForm, image_url: e.target.value })} className="h-10 rounded-lg border px-3" />
          <button className="h-10 rounded-lg bg-[#d91d83] font-bold text-white md:col-span-3">{editingRewardId ? 'Salvar recompensa' : 'Criar recompensa inativa'}</button>
        </form>
        {data.rewards.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Nenhuma recompensa configurada.</p> : data.rewards.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-gray-500">{item.pinkpoints_cost.toLocaleString('pt-BR')} pontos | estoque {item.stock ?? 'ilimitado'}</p></div><div className="flex gap-2"><button onClick={() => { setEditingRewardId(item.id); setRewardForm({ code: item.code, name: item.name, category_id: item.category_id, pinkpoints_cost: String(item.pinkpoints_cost), stock: item.stock === null ? '' : String(item.stock), image_url: item.image_url || '' }); }} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold">Editar</button><button onClick={async () => { await adminEconomyService.saveReward({ active: !item.active }, item.id); await load(); }} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold">{item.active ? 'Desativar' : 'Ativar'}</button></div></div>)}
      </div>}

      {section === 'redemptions' && <div className="space-y-3">{data.redemptions.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Nenhum resgate solicitado.</p> : data.redemptions.map((item) => <div key={item.id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_150px_180px] md:items-center"><div><p className="font-semibold">{item.rewards?.name || 'Recompensa'}</p><p className="text-xs text-gray-500">{item.points_spent.toLocaleString('pt-BR')} pontos | usuario {item.user_id.slice(0, 8)}</p></div><span className="text-sm font-semibold uppercase text-gray-600">{item.status}</span><select value={item.status} onChange={async (e) => { await adminEconomyService.setRedemptionStatus(item.id, e.target.value); await load(); }} className="h-10 rounded-lg border px-3 text-sm"><option value={item.status}>{item.status}</option>{['approved','processing','completed','cancelled','refunded'].filter((status) => status !== item.status).map((status) => <option key={status} value={status}>{status}</option>)}</select></div>)}</div>}

      {section === 'wallets' && <div className="space-y-5">
        <form onSubmit={submitAdjustment} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-5">
          <input required placeholder="UUID do usuario" value={adjustment.userId} onChange={(e) => setAdjustment({ ...adjustment, userId: e.target.value })} className="h-10 rounded-lg border px-3 md:col-span-2" />
          <select value={adjustment.currency} onChange={(e) => setAdjustment({ ...adjustment, currency: e.target.value as 'pinkcoins' | 'pinkpoints' })} className="h-10 rounded-lg border px-3"><option value="pinkcoins">PinkCoins</option><option value="pinkpoints">PinkPoints</option></select>
          <input required type="number" step="1" placeholder="Valor +/-" value={adjustment.amount} onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })} className="h-10 rounded-lg border px-3" />
          <button className="h-10 rounded-lg bg-[#d91d83] font-bold text-white">Registrar ajuste</button>
          <input required placeholder="Motivo auditavel" value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} className="h-10 rounded-lg border px-3 md:col-span-5" />
        </form>
        {data.wallets.map((item) => <button key={item.id} onClick={() => setAdjustment({ ...adjustment, userId: item.user_id })} className="grid w-full gap-2 rounded-lg border p-4 text-left md:grid-cols-3"><span className="font-mono text-xs text-gray-500">{item.user_id}</span><span className="font-semibold">{item.pinkcoins_balance.toLocaleString('pt-BR')} PinkCoins</span><span className="font-semibold">{item.pink_points_balance.toLocaleString('pt-BR')} PinkPoints</span></button>)}
      </div>}
    </div>
  );
};

export default AdminEconomy;
