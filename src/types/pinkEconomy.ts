export type WalletCurrency = 'pinkcoins' | 'pinkpoints';

export interface PinkWalletSnapshot {
  wallet_id: string;
  user_id: string;
  pinkcoins_balance: number;
  pinkpoints_balance: number;
  pinkpoints_per_pinkcoin: number;
  minimum_redemption_balance: number;
  updated_at: string;
}
export interface WalletActivity {
  id: string;
  currency: WalletCurrency;
  transaction_type: string;
  amount: number;
  description: string;
  balance_after: number;
  source: string;
  created_at: string;
}

export interface PinkcoinPackage {
  id: string;
  code: string;
  name: string;
  description: string | null;
  coins_amount: number;
  price_brl: number;
  display_order: number;
  metadata: Record<string, unknown>;
}

export interface PlatformResource {
  id: string;
  code: string;
  name: string;
  description: string | null;
  pinkcoin_cost: number;
  fulfillment_type: 'entitlement' | 'boost';
  fulfillment_config: Record<string, unknown>;
}

export interface PinkcoinConsumptionResult {
  success: true;
  idempotent: boolean;
  transaction_id: string;
  fulfillment_id?: string;
  boost_id?: string;
  pinkcoins_spent?: number;
  pinkcoins_balance: number;
  pinkpoints_credited?: number;
}

export interface PinkpointTransaction {
  id: string;
  type: 'credit' | 'redemption' | 'refund' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  source: string;
  reference_id: string | null;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RewardCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
}

export interface Reward {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  pinkpoints_cost: number;
  image_url: string | null;
  stock: number | null;
  active: boolean;
  fulfillment_type: 'manual' | 'platform_entitlement' | 'digital' | 'partner';
  metadata: Record<string, unknown>;
  reward_categories?: RewardCategory | RewardCategory[] | null;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  fulfilled_at: string | null;
  rewards?: Pick<Reward, 'name' | 'code' | 'image_url'> | null;
}

export interface RewardRedemptionResult {
  success: true;
  idempotent: boolean;
  redemption_id: string;
  status: RewardRedemption['status'];
  points_spent?: number;
  pinkpoints_balance: number;
}
