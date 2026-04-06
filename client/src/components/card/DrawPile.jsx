// ─── Draw Pile ─────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';

export default function DrawPile({ count, onDraw, canDraw }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        whileHover={canDraw ? { scale: 1.07, rotate: -3 } : {}}
        whileTap={canDraw ? { scale: 0.95 } : {}}
        onClick={canDraw ? onDraw : undefined}
        className={[
          'relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-4 border-gray-600',
          'bg-gray-800 flex items-center justify-center card-shadow',
          canDraw ? 'cursor-pointer hover:border-white/60' : 'cursor-default opacity-70',
        ].join(' ')}
      >
        {/* stacked effect */}
        <div className="absolute -bottom-1 -right-1 w-full h-full rounded-xl border-4 border-gray-700 bg-gray-900 -z-10" />
        <div className="absolute -bottom-2 -right-2 w-full h-full rounded-xl border-4 border-gray-700 bg-gray-950 -z-20" />

        <div className="inset-2 absolute rounded-lg bg-red-600 flex items-center justify-center">
          <span className="text-white font-black text-sm italic tracking-tight drop-shadow select-none">
            UNO
          </span>
        </div>

        {canDraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-2 -right-2 bg-white text-gray-900 text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
          >
            +
          </motion.div>
        )}
      </motion.div>

      <span className="text-xs text-gray-400 font-medium">{count} left</span>
    </div>
  );
}
