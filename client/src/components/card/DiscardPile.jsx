// ─── Discard Pile ──────────────────────────────────────────────────────────────
import { AnimatePresence, motion } from 'framer-motion';
import UnoCard from './UnoCard.jsx';

export default function DiscardPile({ topCard, currentColor }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Color indicator ring */}
        <div
          className={[
            'absolute -inset-2 rounded-2xl opacity-60 blur-sm transition-colors duration-500',
            colorRing(currentColor),
          ].join(' ')}
        />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={topCard?.id}
            initial={{ scale: 0.5, rotate: -20, opacity: 0, y: -30 }}
            animate={{ scale: 1,   rotate: randomTilt(), opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          >
            <UnoCard card={topCard} />
          </motion.div>
        </AnimatePresence>
      </div>

      <span className="text-xs text-gray-400 font-medium capitalize">
        {currentColor} active
      </span>
    </div>
  );
}

function randomTilt() {
  return (Math.random() - 0.5) * 14; // -7 to +7 degrees
}

function colorRing(color) {
  return {
    red:    'bg-red-500',
    blue:   'bg-blue-500',
    green:  'bg-green-500',
    yellow: 'bg-yellow-400',
    wild:   'bg-purple-500',
  }[color] ?? 'bg-gray-600';
}
