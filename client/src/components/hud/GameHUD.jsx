// ─── GameHUD ──────────────────────────────────────────────────────────────────
// Top bar: direction indicator, current player name, last action.
import { motion, AnimatePresence } from 'framer-motion';

export default function GameHUD({ gameState, humanId }) {
  const { players, currentIndex, direction, lastAction } = gameState;
  const current  = players[currentIndex];
  const isMyTurn = current?.id === humanId;

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-gray-900/80 backdrop-blur border-b border-gray-700/60">

      {/* Direction arrow */}
      <div className="flex items-center gap-1.5">
        <motion.span
          key={direction}
          initial={{ opacity: 0, x: direction > 0 ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-gray-400 text-xs font-semibold"
        >
          {direction > 0 ? '▶ Clockwise' : '◀ Counter'}
        </motion.span>
      </div>

      {/* Current turn */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className={[
            'px-4 py-1 rounded-full font-extrabold text-sm tracking-wide transition-colors',
            isMyTurn
              ? 'bg-white text-gray-900 shadow shadow-white/30'
              : 'bg-gray-700 text-gray-200',
          ].join(' ')}
        >
          {isMyTurn ? '🎯 Your Turn' : `${current?.name}'s turn`}
        </motion.div>
      </AnimatePresence>

      {/* Last action */}
      <AnimatePresence mode="wait">
        <motion.span
          key={lastAction}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="text-gray-400 text-xs max-w-[140px] text-right truncate"
        >
          {lastAction}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
