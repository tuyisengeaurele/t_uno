// ─── OpponentHand ─────────────────────────────────────────────────────────────
// Renders an AI/remote player's hand face-down in a fan layout.
import { motion, AnimatePresence } from 'framer-motion';
import UnoCard from './UnoCard.jsx';

export default function OpponentHand({ player, isActive, position = 'top' }) {
  const count = player.hand.length;

  // Fan angle spread
  const spread = Math.min(count * 6, 48);
  const startAngle = -spread / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Name tag */}
      <div className={[
        'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300',
        isActive
          ? 'bg-white text-gray-900 shadow-lg shadow-white/20'
          : 'bg-gray-700/60 text-gray-300',
      ].join(' ')}>
        <span className={[
          'w-2 h-2 rounded-full',
          isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500',
        ].join(' ')} />
        {player.name}
        <span className="ml-1 text-xs opacity-70">({count})</span>
      </div>

      {/* Fan of face-down cards */}
      <div className="relative flex items-center justify-center" style={{ height: 64, width: Math.max(count * 10 + 36, 60) }}>
        <AnimatePresence>
          {Array.from({ length: count }).map((_, i) => {
            const angle = count > 1 ? startAngle + (spread / (count - 1)) * i : 0;
            return (
              <motion.div
                key={`${player.id}-card-${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, rotate: angle }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 280, damping: 22 }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${(i - (count - 1) / 2) * 10}px)`,
                  transformOrigin: 'bottom center',
                  zIndex: i,
                }}
              >
                <UnoCard faceDown small />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
