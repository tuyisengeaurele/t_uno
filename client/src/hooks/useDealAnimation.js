// ─── useDealAnimation ─────────────────────────────────────────────────────────
// Triggers a short "dealing" phase when a game first starts so cards
// appear to fly onto the table one by one.
import { useEffect, useState } from 'react';

export function useDealAnimation(gameState) {
  const [dealing, setDealing]       = useState(false);
  const [dealDone, setDealDone]     = useState(false);
  const prevPhaseRef                = { current: null };

  useEffect(() => {
    if (!gameState) return;

    // Detect fresh game start (lastAction === 'Game started')
    if (gameState.lastAction === 'Game started' && !dealDone) {
      setDealing(true);
      setDealDone(false);

      // Total deal duration: 7 cards × ~120ms stagger = ~840ms + buffer
      const timer = setTimeout(() => {
        setDealing(false);
        setDealDone(true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [gameState?.lastAction]);

  // Reset when a new game starts
  useEffect(() => {
    if (gameState?.lastAction === 'Game started') setDealDone(false);
  }, [gameState]);

  return { dealing };
}
