// ─── GameHistory Panel ────────────────────────────────────────────────────────
// Collapsible slide-out log of every game action.
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameHistory({ log }) {
  const [open, setOpen]   = useState(false);
  const scrollRef         = useRef(null);

  // Auto-scroll to top (newest entry) when log updates
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [log.length, open]);

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="fixed right-4 top-16 z-30 bg-gray-800/90 border border-gray-600 text-gray-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur transition-colors"
      >
        {open ? '✕ Log' : '📜 Log'}
        {log.length > 0 && (
          <span className="ml-1.5 bg-gray-600 text-gray-200 rounded-full px-1.5 py-0.5 text-[10px]">
            {log.length}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0,       opacity: 1 }}
            exit={{   x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-64 z-20 bg-gray-900/95 border-l border-gray-700 backdrop-blur-sm flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-bold text-sm">Game Log</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <AnimatePresence initial={false}>
                {log.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={[
                      'text-xs px-3 py-1.5 rounded-lg',
                      entry.phase === 'game_over'
                        ? 'bg-yellow-500/20 text-yellow-300 font-semibold'
                        : 'bg-gray-800/60 text-gray-300',
                    ].join(' ')}
                  >
                    {entry.text}
                  </motion.div>
                ))}
              </AnimatePresence>

              {log.length === 0 && (
                <p className="text-gray-600 text-xs text-center mt-6">No actions yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
