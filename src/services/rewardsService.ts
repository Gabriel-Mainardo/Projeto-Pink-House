import { supabase } from '../lib/supabase';
import type { Reward, RewardRedemption, RewardRedemptionResult } from '../types/pinkEconomy';
import { createIdempotencyKey, parsePinkEconomyError } from './pinkEconomyErrors';

export const rewardsService = {
  async getCatalog(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select(`
        id, category_id, code, name, description, pinkpoints_cost,
        image_url, stock, active, fulfillment_type, metadata,
        reward_categories (id, code, name, description, display_order)
      `)
      .eq('active', true)
      .order('pinkpoints_cost', { ascending: true });

    if (error) throw parsePinkEconomyError(error);
    return (data || []) as Reward[];
  },

  async getMyRedemptions(): Promise<RewardRedemption[]> {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .select(`
        id, reward_id, points_spent, status, metadata, created_at, updated_at, fulfilled_at,
        rewards (name, code, image_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw parsePinkEconomyError(error);
    return (data || []) as RewardRedemption[];
  },

  async redeem(rewardId: string, idempotencyKey?: string): Promise<RewardRedemptionResult> {
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_reward_id: rewardId,
      p_idempotency_key: idempotencyKey || createIdempotencyKey(`reward:${rewardId}`),
      p_metadata: {},
    });

    if (error) throw parsePinkEconomyError(error);
    return data as RewardRedemptionResult;
  },
};
