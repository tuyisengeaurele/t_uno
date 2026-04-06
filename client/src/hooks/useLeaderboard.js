// ─── useLeaderboard ───────────────────────────────────────────────────────────
// Persists win records in localStorage under key 'uno-leaderboard'.
import { useState, useCallback } from 'react';

const KEY = 'uno-leaderboard';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function useLeaderboard() {
  const [entries, setEntries] = useState(load);

  const addWin = useCallback((name) => {
    setEntries(prev => {
      const existing = prev.find(e => e.name === name);
      const updated  = existing
        ? prev.map(e => e.name === name ? { ...e, wins: e.wins + 1 } : e)
        : [...prev, { name, wins: 1 }];
      const sorted = [...updated].sort((a, b) => b.wins - a.wins);
      save(sorted);
      return sorted;
    });
  }, []);

  const clearBoard = useCallback(() => {
    localStorage.removeItem(KEY);
    setEntries([]);
  }, []);

  return { entries, addWin, clearBoard };
}
