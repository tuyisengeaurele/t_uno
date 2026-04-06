// ─── useGameHistory ───────────────────────────────────────────────────────────
// Accumulates lastAction strings into a scrollable log.
import { useEffect, useRef, useState } from 'react';

export function useGameHistory(gameState) {
  const [log, setLog]     = useState([]);
  const prevAction = useRef(null);

  useEffect(() => {
    if (!gameState?.lastAction) return;
    if (gameState.lastAction === prevAction.current) return;
    prevAction.current = gameState.lastAction;

    setLog(prev => [
      { id: Date.now(), text: gameState.lastAction, phase: gameState.phase },
      ...prev.slice(0, 49), // keep last 50 entries
    ]);
  }, [gameState?.lastAction]);

  function clearHistory() { setLog([]); }

  return { log, clearHistory };
}
