import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { pinkWalletService } from '../services/pinkWalletService';
import type { PinkWalletSnapshot, WalletActivity } from '../types/pinkEconomy';

export const usePinkWallet = (includeActivity = false, enabled = true) => {
  const [wallet, setWallet] = useState<PinkWalletSnapshot | null>(null);
  const [activity, setActivity] = useState<WalletActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setWallet(null);
      setActivity([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [snapshot, history] = await Promise.all([
        pinkWalletService.getSnapshot(),
        includeActivity ? pinkWalletService.getActivity() : Promise.resolve([]),
      ]);
      setWallet(snapshot);
      setActivity(history);
    } catch (caught) {
      setWallet(null);
      setActivity([]);
      setError(caught instanceof Error ? caught : new Error('Falha ao carregar a PinkWallet.'));
    } finally {
      setLoading(false);
    }
  }, [enabled, includeActivity]);

  useEffect(() => {
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  return { wallet, activity, loading, error, refresh };
};
