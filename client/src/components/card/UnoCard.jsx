// ─── UnoCard Component ────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import { cardLabel } from '../../utils/deck.js';

const COLOR_CLASS = {
  red:    'card-red    text-white',
  blue:   'card-blue   text-white',
  green:  'card-green  text-white',
  yellow: 'card-yellow text-gray-900',
  wild:   'card-wild   text-white',
};

const GLOW = {
  red:    'shadow-[0_0_16px_4px_rgba(239,68,68,.7)]',
  blue:   'shadow-[0_0_16px_4px_rgba(59,130,246,.7)]',
  green:  'shadow-[0_0_16px_4px_rgba(34,197,94,.7)]',
  yellow: 'shadow-[0_0_16px_4px_rgba(234,179,8,.7)]',
  wild:   'shadow-[0_0_16px_4px_rgba(168,85,247,.7)]',
};

/**
 * UnoCard
 * Props:
 *   card       — card object { id, color, type, value }
 *   faceDown   — boolean (render back face)
 *   playable   — boolean (highlight as playable)
 *   onClick    — handler
 *   small      — boolean (opponent hand sizing)
 *   selected   — boolean
 */
export default function UnoCard({ card, faceDown = false, playable = false, onClick, small = false, selected = false }) {
  if (faceDown) return <CardBack small={small} />;

  const colorClass = COLOR_CLASS[card.color] ?? COLOR_CLASS.wild;
  const glowClass  = playable ? GLOW[card.color] ?? GLOW.wild : '';
  const label      = cardLabel(card);

  const sizeClass = small
    ? 'w-9 h-14 text-[10px]'
    : 'w-20 h-28 text-base sm:w-24 sm:h-36 sm:text-lg';

  return (
    <motion.div
      layout
      whileHover={playable ? { y: -10, scale: 1.08 } : {}}
      whileTap={playable ? { scale: 0.95 } : {}}
      animate={selected ? { y: -14 } : { y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={playable ? onClick : undefined}
      className={[
        'relative flex flex-col items-center justify-center',
        'rounded-xl border-4 font-extrabold no-select',
        'card-shadow',
        sizeClass,
        colorClass,
        glowClass,
        playable ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {/* corner label top-left */}
      <span className="absolute top-1 left-1.5 leading-none text-[0.6em] font-black opacity-90">
        {label}
      </span>

      {/* center symbol */}
      <span className="text-[1.4em] font-black drop-shadow-sm select-none">
        {label}
      </span>

      {/* UNO ellipse decoration */}
      <div className="absolute inset-1 rounded-lg border-2 border-white/20 pointer-events-none" />

      {/* corner label bottom-right (rotated) */}
      <span className="absolute bottom-1 right-1.5 leading-none text-[0.6em] font-black opacity-90 rotate-180">
        {label}
      </span>
    </motion.div>
  );
}

function CardBack({ small }) {
  const sizeClass = small ? 'w-9 h-14' : 'w-20 h-28 sm:w-24 sm:h-36';
  return (
    <div className={[
      'relative rounded-xl border-4 border-gray-600 bg-gray-800 card-shadow no-select flex items-center justify-center',
      sizeClass,
    ].join(' ')}>
      <div className="absolute inset-2 rounded-lg bg-red-600 flex items-center justify-center">
        <span className="text-white font-black text-xs italic tracking-tight drop-shadow">UNO</span>
      </div>
    </div>
  );
}
