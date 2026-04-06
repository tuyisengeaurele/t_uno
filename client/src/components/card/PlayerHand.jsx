// ─── PlayerHand ───────────────────────────────────────────────────────────────
// Renders the human player's hand at the bottom of the screen.
import { motion, AnimatePresence } from 'framer-motion';
import UnoCard from './UnoCard.jsx';

export default function PlayerHand({ hand, playableIds, onPlay, isMyTurn }) {
  const playableSet = new Set(playableIds);

  return (
    <motion.div
      layout
      className="flex items-end justify-center flex-wrap gap-2 px-4 py-2 max-w-full"
    >
      <AnimatePresence>
        {hand.map((card, i) => {
          const playable = isMyTurn && playableSet.has(card.id);
          return (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 60, scale: 0.7 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.6, transition: { duration: 0.25 } }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 24 }}
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
