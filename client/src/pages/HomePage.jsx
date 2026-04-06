// ─── Home Page ─────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const CONTAINER = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const startSinglePlayer = useGameStore(s => s.startSinglePlayer);

  const [name,     setName]     = useState('');
  const [aiCount,  setAICount]  = useState(1);
  const [showSP,   setShowSP]   = useState(false);

  function handleStartSP() {
    startSinglePlayer(name.trim() || 'You', aiCount);
    navigate('/game');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 relative overflow-hidden">

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['bg-red-600','bg-blue-600','bg-green-600','bg-yellow-500'].map((c, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full opacity-10 blur-3xl ${c}`}
            style={{ width: 400, height: 400 }}
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 80, 0],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
            initial={{
              top: `${[10, 60, 30, 70][i]}%`,
              left: `${[10, 60, 80, 20][i]}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={CONTAINER}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div variants={ITEM} className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-red-500 text-white font-black text-6xl italic px-8 py-4 rounded-3xl shadow-2xl shadow-red-500/40 border-4 border-red-300/30 mb-2"
          >
            UNO
          </motion.div>
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">Card Game</p>
        </motion.div>

        {/* Mode buttons */}
        {!showSP ? (
          <>
            <motion.button
              variants={ITEM}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowSP(true)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-red-500/30 border border-red-400/30"
            >
              🤖 Single Player
            </motion.button>

            <motion.button
              variants={ITEM}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/lobby')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-blue-500/30 border border-blue-400/30"
            >
              🌐 Multiplayer
            </motion.button>

            <motion.button
              variants={ITEM}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-gray-700/70 hover:bg-gray-700 text-gray-200 font-bold text-base py-3 rounded-2xl border border-gray-600/50 transition-colors"
            >
              🏆 Leaderboard
            </motion.button>
          </>
        ) : (
          <motion.div
            key="sp-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4"
          >
            <h2 className="text-white font-extrabold text-lg text-center">Single Player Setup</h2>

            {/* Name */}
            <div>
              <label className="text-gray-400 text-sm font-medium mb-1 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Player 1"
                maxLength={16}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* AI count */}
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 block">Number of AI Opponents</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setAICount(n)}
                    className={[
                      'flex-1 py-2.5 rounded-xl font-black text-sm border-2 transition-all',
                      aiCount === n
                        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-400',
                    ].join(' ')}
                  >
                    {n} {n === 1 ? 'Bot' : 'Bots'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSP(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleStartSP}
                className="flex-1 bg-green-500 hover:bg-green-400 text-white font-black py-2.5 rounded-xl text-sm shadow-lg transition-colors"
              >
                Start Game!
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.p variants={ITEM} className="text-gray-600 text-xs text-center">
          Built with React · Tailwind · Framer Motion
        </motion.p>
      </motion.div>
    </div>
  );
}
