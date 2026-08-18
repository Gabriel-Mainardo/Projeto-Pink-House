import { supabase } from '../lib/supabase';
import type { PinkpointTransaction } from '../types/pinkEconomy';
import { parsePinkEconomyError } from './pinkEconomyErrors';

export type PinkpointSource =
  | 'pinkcoin_cashback'
  | 'referral'
  | 'profile_verification'
  | 'campaign'
  | 'challenge'
  | 'event'
  | 'admin_adjustment'
  | 'reward_redemption'
  | 'reward_refund';

// Credits and debits are intentionally absent from this browser service.
// They are available only through protected backend functions.
export const pinkpointsService = {
  async getMyTransactions(limit = 100): Promise<PinkpointTransaction[]> {
    const { data, error } = await supabase
      .from('pinkpoint_transactions')
      .select('id, type, amount, balance_before, balance_after, source, reference_id, description, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw parsePinkEconomyError(error);
    return (data || []) as PinkpointTransaction[];
  },
};
