import { supabase } from '../lib/supabase';
import { createIdempotencyKey, parsePinkEconomyError } from './pinkEconomyErrors';

export interface AdminResource {
  id: string;
  code: string;
  name: string;
  pinkcoin_cost: number | null;
  active: boolean;
}

export interface AdminPackage {
  id: string;
  code: string;
  name: string;
  coins_amount: number;
  price_brl: number;
  active: boolean;
}

export interface AdminCategory { id: string; name: string }
export interface AdminReward {
  id: string;
  code: string;
  name: string;
  category_id: string;
  pinkpoints_cost: number;
  stock: number | null;
  image_url: string | null;
  active: boolean;
}
export interface AdminRedemption { id: string; user_id: string; points_spent: number; status: string; rewards?: { name: string } | null }
export interface AdminWallet { id: string; user_id: string; pinkcoins_balance: number; pink_points_balance: number }

export interface AdminEconomyOverview {
  resources: AdminResource[];
  packages: AdminPackage[];
  categories: AdminCategory[];
  rewards: AdminReward[];
  redemptions: AdminRedemption[];
  wallets: AdminWallet[];
}

const assertNoError = (error: unknown) => {
  if (error) throw parsePinkEconomyError(error);
};

export const adminEconomyService = {
  async isAuthorized() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { data, error } = await supabase.rpc('is_pinkhouse_admin');
    if (error) return false;
    return Boolean(data);
  },

  async getOverview(): Promise<AdminEconomyOverview> {
    const [resources, packages, categories, rewards, redemptions, wallets] = await Promise.all([
      supabase.from('platform_resources').select('*').order('name'),
      supabase.from('pinkcoin_packages').select('*').order('display_order'),
      supabase.from('reward_categories').select('*').eq('active', true).order('display_order'),
      supabase.from('rewards').select('*, reward_categories(id, code, name)').order('created_at', { ascending: false }),
      supabase.from('reward_redemptions').select('*, rewards(name, code)').order('created_at', { ascending: false }).limit(100),
      supabase.from('user_wallets').select('id, user_id, pinkcoins_balance, pink_points_balance, updated_at').order('updated_at', { ascending: false }).limit(100),
    ]);
    [resources, packages, categories, rewards, redemptions, wallets].forEach(({ error }) => assertNoError(error));
    return {
      resources: (resources.data || []) as AdminResource[],
      packages: (packages.data || []) as AdminPackage[],
      categories: (categories.data || []) as AdminCategory[],
      rewards: (rewards.data || []) as AdminReward[],
      redemptions: (redemptions.data || []) as AdminRedemption[],
      wallets: (wallets.data || []) as AdminWallet[],
    };
  },

  async saveResource(id: string, pinkcoinCost: number | null, active: boolean) {
    const { error } = await supabase.from('platform_resources').update({
      pinkcoin_cost: pinkcoinCost,
      active: active && pinkcoinCost !== null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    assertNoError(error);
  },

  async savePackage(input: Record<string, unknown>, id?: string) {
    const query = id
      ? supabase.from('pinkcoin_packages').update(input).eq('id', id)
      : supabase.from('pinkcoin_packages').insert(input);
    const { error } = await query;
    assertNoError(error);
  },

  async saveReward(input: Record<string, unknown>, id?: string) {
    const query = id
      ? supabase.from('rewards').update(input).eq('id', id)
      : supabase.from('rewards').insert(input);
    const { error } = await query;
    assertNoError(error);
  },

  async setRedemptionStatus(id: string, status: string) {
    const { error } = await supabase.rpc('admin_set_reward_redemption_status', {
      p_redemption_id: id,
      p_status: status,
      p_metadata: {},
    });
    assertNoError(error);
  },

  async adjustWallet(userId: string, currency: 'pinkcoins' | 'pinkpoints', amount: number, reason: string) {
    const { error } = await supabase.rpc('admin_adjust_pinkwallet', {
      p_user_id: userId,
      p_currency: currency,
      p_amount: amount,
      p_reason: reason,
      p_idempotency_key: createIdempotencyKey(`admin-${currency}`),
      p_metadata: {},
    });
    assertNoError(error);
  },
};
