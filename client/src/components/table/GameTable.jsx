// ─── GameTable ────────────────────────────────────────────────────────────────
// Positions all opponents around the table with the human at the bottom.
import OpponentHand from '../card/OpponentHand.jsx';
import DrawPile    from '../card/DrawPile.jsx';
import DiscardPile from '../card/DiscardPile.jsx';

export default function GameTable({ gameState, humanId, onDraw, canDraw }) {
  const { players, drawPile, discardPile, currentColor, currentIndex } = gameState;

  const humanIndex     = players.findIndex(p => p.id === humanId);
  const opponents      = players.filter(p => p.id !== humanId);
  const topCard        = discardPile[discardPile.length - 1];

  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full px-4 py-2 relative overflow-hidden">

      {/* ── Opponents row ── */}
      <div className="flex items-start justify-center gap-6 flex-wrap w-full pt-2">
        {opponents.map(opp => (
          <OpponentHand
            key={opp.id}
            player={opp}
            isActive={players[currentIndex]?.id === opp.id}
          />
        ))}
      </div>

      {/* ── Center Table ── */}
      <div className="flex items-center justify-center gap-8 sm:gap-14 my-4">
        <DrawPile
          count={drawPile.length}
          onDraw={onDraw}
          canDraw={canDraw}
        />

        <DiscardPile topCard={topCard} currentColor={currentColor} />
      </div>

      {/* Spacer so human hand stays at bottom */}
      <div />
    </div>
  );
}
