// ─── WinnerModal ──────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';

export default function WinnerModal({ winner, players, scores, onPlayAgain, onHome }) {
  const winnerPlayer = players?.find(p => p.id === winner);
  const isHuman      = winner === 'human';

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 60 }}
            animate={{ scale: 1,   y: 0 }}
            exit={{ scale: 0.5,   y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="bg-gray-800 border border-gray-600 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-5 min-w-[300px]"
          >
            {/* Trophy / skull */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
              className="text-7xl"
            >
              {isHuman ? '🏆' : '😈'}
            </motion.div>

            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium">
                {isHuman ? 'You Win!' : 'Game Over'}
              </p>
              <h1 className="text-white font-black text-3xl mt-1">
                {winnerPlayer?.name ?? 'Unknown'}
              </h1>
            </div>

            {/* Scoreboard */}
            {scores && Object.keys(scores).length > 0 && (
              <div className="w-full bg-gray-700/50 rounded-xl p-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2 text-center">
                  Session Wins
                </p>
                <div className="flex flex-col gap-1">
                  {players?.map(p => (
                    <div key={p.id} className="flex justify-between items-center px-2">
                      <span className="text-gray-200 text-sm">{p.name}</span>
                      <span className="text-yellow-400 font-black text-sm">
                        {scores[p.id] ?? 0} 🏅
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={onPlayAgain}
                className="flex-1 bg-green-500 hover:bg-green-400 text-white font-black py-3 rounded-xl text-sm shadow-lg transition-colors"
              >
                Play Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={onHome}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Main Menu
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
