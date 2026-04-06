// ─── GameTable ────────────────────────────────────────────────────────────────
// Positions all opponents around the table with the human at the bottom.
// Includes felt texture background, radial gradient, and turn spotlight.
import { motion } from 'framer-motion';
import OpponentHand from '../card/OpponentHand.jsx';
import DrawPile     from '../card/DrawPile.jsx';
import DiscardPile  from '../card/DiscardPile.jsx';

export default function GameTable({ gameState, humanId, onDraw, canDraw }) {
  const { players, drawPile, discardPile, currentColor, currentIndex } = gameState;

  const opponents = players.filter(p => p.id !== humanId);
  const topCard   = discardPile[discardPile.length - 1];

  // Spotlight color mapped to current active color
  const spotlightColor = {
    red:    'rgba(239,68,68,0.07)',
    blue:   'rgba(59,130,246,0.07)',
    green:  'rgba(34,197,94,0.07)',
    yellow: 'rgba(234,179,8,0.07)',
    wild:   'rgba(168,85,247,0.07)',
  }[currentColor] ?? 'rgba(255,255,255,0.04)';

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between w-full px-4 py-2 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 55% at 50% 50%, ${spotlightColor} 0%, transparent 100%),
          repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px,
            transparent 1px, transparent 8px
          ),
          #111827
        `,
        transition: 'background 0.6s ease',
      }}
    >
      {/* Felt oval */}
      <motion.div
        layout
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[200px] sm:w-[480px] sm:h-[260px] rounded-full border border-white/5 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 80%)' }}
      />

      {/* ── Opponents row ── */}
      <div className="flex items-start justify-center gap-6 flex-wrap w-full pt-2 z-10">
        {opponents.map(opp => (
          <OpponentHand
            key={opp.id}
            player={opp}
            isActive={players[currentIndex]?.id === opp.id}
          />
        ))}
      </div>

      {/* ── Center piles ── */}
      <div className="flex items-center justify-center gap-8 sm:gap-14 my-4 z-10">
        <DrawPile count={drawPile.length} onDraw={onDraw} canDraw={canDraw} />
        <DiscardPile topCard={topCard} currentColor={currentColor} />
      </div>

      <div />
    </div>
  );
}
