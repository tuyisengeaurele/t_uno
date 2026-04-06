// ─── UNO! Call Button ─────────────────────────────────────────────────────────
// Shows when the human player has exactly 1 card left.
import { motion, AnimatePresence } from 'framer-motion';

export default function UnoButton({ show, onCall }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1, rotate: 3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={onCall}
          className={[
            'fixed bottom-44 right-4 z-40',
            'bg-red-500 hover:bg-red-400 text-white',
            'font-black text-xl italic tracking-tight',
            'px-5 py-3 rounded-2xl shadow-2xl shadow-red-500/50',
            'border-4 border-red-300/50',
          ].join(' ')}
        >
          UNO!
        </motion.button>
      )}
    </AnimatePresence>
  );
}
