import { supabase } from '../lib/supabase';
import type { PinkcoinConsumptionResult, PlatformResource } from '../types/pinkEconomy';
import { createIdempotencyKey, parsePinkEconomyError } from './pinkEconomyErrors';

export interface ConsumePinkcoinResourceInput {
  resourceCode: string;
  referenceId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export const pinkcoinService = {
  async getActiveResources(): Promise<PlatformResource[]> {
    const { data, error } = await supabase
      .from('platform_resources')
      .select('id, code, name, description, pinkcoin_cost, fulfillment_type, fulfillment_config')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw parsePinkEconomyError(error);
    return (data || []) as PlatformResource[];
  },

  async consumeResource(input: ConsumePinkcoinResourceInput): Promise<PinkcoinConsumptionResult> {
    const idempotencyKey = input.idempotencyKey || createIdempotencyKey(input.resourceCode);
    const { data, error } = await supabase.rpc('consume_pinkcoin_resource', {
      p_resource_code: input.resourceCode,
      p_reference_id: input.referenceId || null,
      p_idempotency_key: idempotencyKey,
      p_metadata: input.metadata || {},
    });

    if (error) throw parsePinkEconomyError(error);
    return data as PinkcoinConsumptionResult;
  },
};
