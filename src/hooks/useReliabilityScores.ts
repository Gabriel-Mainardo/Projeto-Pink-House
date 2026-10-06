import { useEffect, useState } from 'react';
import { getReliabilityScoresBatch } from '../services/verificationService';

// Refresh the visible scores after a task, on returning to the page, and while
// browsing (including changes made by the professional on another device).
export function useReliabilityScores(companionIds: string[]) {
  const idsKey = JSON.stringify([...new Set(companionIds.filter(Boolean))].sort());
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const ids: string[] = JSON.parse(idsKey);
    if (!ids.length) return;
    let disposed = false;
    let fetching = false;
    let refreshQueued = false;
    const refresh = async () => {
      if (disposed || document.visibilityState === 'hidden') return;
      if (fetching) {
        refreshQueued = true;
        return;
      }
      fetching = true;
      try {
        const next = await getReliabilityScoresBatch(ids);
        if (!disposed) setScores((previous) => ({ ...previous, ...next }));
      } finally {
        fetching = false;
        if (refreshQueued) {
          refreshQueued = false;
          void refresh();
        }
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'pinkhouse:reliability-changed') void refresh();
    };
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pinkhouse:reliability-changed', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pinkhouse:reliability-changed', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [idsKey]);

  return scores;
}
