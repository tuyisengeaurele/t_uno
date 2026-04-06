// ─── Color Picker Modal ────────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  { id: 'red',    label: 'Red',    bg: 'bg-red-500',    ring: 'ring-red-300' },
  { id: 'blue',   label: 'Blue',   bg: 'bg-blue-500',   ring: 'ring-blue-300' },
  { id: 'green',  label: 'Green',  bg: 'bg-green-500',  ring: 'ring-green-300' },
  { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-300' },
];

export default function ColorPicker({ open, onSelect }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1,   y: 0 }}
            exit={{ scale: 0.7, y: 40 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="bg-gray-800 border border-gray-600 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-5"
          >
            <h2 className="text-white font-extrabold text-xl tracking-wide">Choose a Color</h2>

            <div className="grid grid-cols-2 gap-4">
              {COLORS.map(c => (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => onSelect(c.id)}
                  className={[
                    'w-24 h-24 rounded-2xl font-black text-white text-lg shadow-lg',
                    'ring-4 ring-transparent hover:ring-4 transition-all duration-150',
                    c.bg,
                    `hover:${c.ring}`,
                  ].join(' ')}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
