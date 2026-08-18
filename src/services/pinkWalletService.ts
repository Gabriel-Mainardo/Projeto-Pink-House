import { supabase } from '../lib/supabase';
import type { PinkcoinPackage, PinkWalletSnapshot, WalletActivity } from '../types/pinkEconomy';
import { parsePinkEconomyError } from './pinkEconomyErrors';

const requireSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw parsePinkEconomyError(new Error('AUTHENTICATION_REQUIRED'));
  }
  return session;
};
export const pinkWalletService = {
  async getSnapshot(): Promise<PinkWalletSnapshot> {
    await requireSession();
    const { data, error } = await supabase.rpc('get_my_pinkwallet');
    if (error) throw parsePinkEconomyError(error);
    return data as PinkWalletSnapshot;
  },

  async getActivity(limit = 50, offset = 0): Promise<WalletActivity[]> {
    await requireSession();
    const { data, error } = await supabase.rpc('get_my_pinkwallet_activity', {
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw parsePinkEconomyError(error);
    return (data || []) as WalletActivity[];
  },

  async getActivePackages(): Promise<PinkcoinPackage[]> {
    const { data, error } = await supabase
      .from('pinkcoin_packages')
      .select('id, code, name, description, coins_amount, price_brl, display_order, metadata')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) throw parsePinkEconomyError(error);
    return (data || []) as PinkcoinPackage[];
  },
};
