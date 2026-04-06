// ─── LeaderboardPage ──────────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useLeaderboard.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const navigate              = useNavigate();
  const { entries, clearBoard } = useLeaderboard();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-8">

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="self-start text-gray-500 hover:text-gray-300 text-sm font-medium mb-6 transition-colors"
      >
        ← Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-black text-3xl">Leaderboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">All-time win records</p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={clearBoard}
              className="text-red-400 hover:text-red-300 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">🃏</p>
            <p className="text-gray-500 font-medium">No games played yet</p>
            <p className="text-gray-600 text-sm mt-1">Win a game to appear here!</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={[
                    'flex items-center justify-between px-4 py-3 rounded-2xl border',
                    i === 0
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : i === 1
                        ? 'bg-gray-400/10 border-gray-400/20'
                        : i === 2
                          ? 'bg-orange-700/10 border-orange-700/20'
                          : 'bg-gray-800/60 border-gray-700/40',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center">
                      {MEDALS[i] ?? `#${i + 1}`}
                    </span>
                    <span className={[
                      'font-bold text-base',
                      i === 0 ? 'text-yellow-300' : 'text-white',
                    ].join(' ')}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={[
                      'font-black text-xl tabular-nums',
                      i === 0 ? 'text-yellow-400' : 'text-gray-200',
                    ].join(' ')}>
                      {entry.wins}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {entry.wins === 1 ? 'win' : 'wins'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
