// ─── GamePage ─────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { getPlayable }  from '../utils/gameEngine.js';
import { useGameHistory }    from '../hooks/useGameHistory.js';
import { useDealAnimation }  from '../hooks/useDealAnimation.js';

import GameHUD      from '../components/hud/GameHUD.jsx';
import TurnTimer    from '../components/hud/TurnTimer.jsx';
import GameHistory  from '../components/hud/GameHistory.jsx';
import GameTable    from '../components/table/GameTable.jsx';
import PlayerHand   from '../components/card/PlayerHand.jsx';
import ColorPicker  from '../components/ui/ColorPicker.jsx';
import WinnerModal  from '../components/ui/WinnerModal.jsx';
import UnoButton    from '../components/ui/UnoButton.jsx';
import Toast        from '../components/ui/Toast.jsx';
import { Sounds }   from '../utils/sounds.js';

export default function GamePage() {
  const navigate = useNavigate();

  const gameState   = useGameStore(s => s.gameState);
  const humanId     = useGameStore(s => s.humanId);
  const colorPicker = useGameStore(s => s.colorPicker);
  const message     = useGameStore(s => s.message);
  const scores      = useGameStore(s => s.scores);

  const playCardAction  = useGameStore(s => s.playCard);
  const drawCardAction  = useGameStore(s => s.drawCard);
  const confirmColor    = useGameStore(s => s.confirmColor);
  const resetGame       = useGameStore(s => s.resetGame);
  const clearMessage    = useGameStore(s => s.clearMessage);
  const recordWin       = useGameStore(s => s.recordWin);

  const { log }     = useGameHistory(gameState);
  const { dealing } = useDealAnimation(gameState);

  // Redirect if no game loaded
  useEffect(() => { if (!gameState) navigate('/'); }, []);

  // Record win + sound on game end
  useEffect(() => {
    if (gameState?.phase === 'game_over' && gameState.winner) {
      recordWin(gameState.winner);
      gameState.winner === humanId ? Sounds.win() : Sounds.lose();
    }
  }, [gameState?.phase]);

  if (!gameState) return null;

  const { players, currentIndex, phase } = gameState;
  const human       = players.find(p => p.id === humanId);
  const isMyTurn    = players[currentIndex]?.id === humanId && phase === 'playing';
  const playable    = isMyTurn ? getPlayable(gameState, humanId) : [];
  const playableIds = playable.map(c => c.id);
  const showUNO     = isMyTurn && human?.hand.length === 2;

  function handlePlay(cardId) { Sounds.playCard();  playCardAction(cardId); }
  function handleDraw()       { if (!isMyTurn) return; Sounds.drawCard(); drawCardAction(); }
  function handleColor(color) { Sounds.wildCard();  confirmColor(color); }
  function handleTimeout()    { if (isMyTurn) { Sounds.drawCard(); drawCardAction(); } }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 select-none overflow-hidden">

      <GameHUD gameState={gameState} humanId={humanId} />

      <div className="flex justify-center py-1">
        <TurnTimer active={isMyTurn} onTimeout={handleTimeout} />
      </div>

      <GameTable
        gameState={gameState}
        humanId={humanId}
        onDraw={handleDraw}
        canDraw={isMyTurn && phase === 'playing'}
      />

      {/* Player hand strip */}
      <div className="bg-gray-800/60 backdrop-blur border-t border-gray-700/50 pb-safe">
        <div className="flex items-center justify-between px-4 py-1">
          <span className="text-gray-400 text-xs font-semibold">
            {human?.name} — {human?.hand.length} cards
          </span>
          {isMyTurn && playableIds.length === 0 && (
            <span className="text-yellow-400 text-xs animate-pulse font-medium">No valid card — draw!</span>
          )}
        </div>
        <PlayerHand
          hand={human?.hand ?? []}
          playableIds={playableIds}
          onPlay={handlePlay}
          isMyTurn={isMyTurn}
          dealing={dealing}
        />
      </div>

      <UnoButton show={showUNO} onCall={() => Sounds.unoCall()} />
      <GameHistory log={log} />

      <ColorPicker open={colorPicker} onSelect={handleColor} />
      <WinnerModal
        winner={phase === 'game_over' ? gameState.winner : null}
        players={players}
        scores={scores}
        onPlayAgain={resetGame}
        onHome={() => navigate('/')}
      />
      <Toast message={message} onDismiss={clearMessage} />
    </div>
  );
}
