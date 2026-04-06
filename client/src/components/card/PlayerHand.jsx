// ─── PlayerHand ───────────────────────────────────────────────────────────────
// Renders the human player's hand at the bottom of the screen.
// Supports a "dealing" mode where cards fly in with a larger stagger.
import { motion, AnimatePresence } from 'framer-motion';
import UnoCard from './UnoCard.jsx';

export default function PlayerHand({ hand, playableIds, onPlay, isMyTurn, dealing = false }) {
  const playableSet = new Set(playableIds);

  return (
    <motion.div
      layout
      className="flex items-end justify-center flex-wrap gap-2 px-4 py-2 max-w-full"
    >
      <AnimatePresence>
        {hand.map((card, i) => {
          const playable = isMyTurn && playableSet.has(card.id);
          // Dealing = dramatic fly-in from center top; normal = subtle rise
          const initial = dealing
            ? { opacity: 0, y: -120, x: (i - hand.length / 2) * 8, scale: 0.4, rotate: -15 }
            : { opacity: 0, y: 60, scale: 0.7 };
          const dealDelay = dealing ? i * 0.11 : i * 0.04;

          return (
            <motion.div
              key={card.id}
              layout
              initial={initial}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -40, scale: 0.6, transition: { duration: 0.2 } }}
              transition={{
                delay: dealDelay,
                type: 'spring',
                stiffness: dealing ? 260 : 320,
                damping:   dealing ? 20  : 24,
              }}
            >
              <UnoCard
                card={card}
                playable={playable}
                onClick={() => onPlay(card.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
