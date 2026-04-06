// ─── MultiplayerGamePage ──────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerStore } from '../store/multiplayerStore.js';
import { getPlayable } from '../utils/gameEngine.js';

import GameHUD     from '../components/hud/GameHUD.jsx';
import TurnTimer   from '../components/hud/TurnTimer.jsx';
import GameTable   from '../components/table/GameTable.jsx';
import PlayerHand  from '../components/card/PlayerHand.jsx';
import ColorPicker from '../components/ui/ColorPicker.jsx';
import WinnerModal from '../components/ui/WinnerModal.jsx';
import UnoButton   from '../components/ui/UnoButton.jsx';
import Toast       from '../components/ui/Toast.jsx';
import { Sounds }  from '../utils/sounds.js';

export default function MultiplayerGamePage() {
  const navigate = useNavigate();

  const gameState   = useMultiplayerStore(s => s.gameState);
  const myId        = useMultiplayerStore(s => s.myId);
  const colorPicker = useMultiplayerStore(s => s.colorPicker);
  const error       = useMultiplayerStore(s => s.error);
  const phase       = useMultiplayerStore(s => s.phase);

  const playCard      = useMultiplayerStore(s => s.playCard);
  const drawCard      = useMultiplayerStore(s => s.drawCard);
  const confirmColor  = useMultiplayerStore(s => s.confirmColor);
  const disconnect    = useMultiplayerStore(s => s.disconnect);
  const clearError    = useMultiplayerStore(s => s.clearError);

  useEffect(() => {
    if (!gameState && phase !== 'game_over') navigate('/lobby');
  }, []);

  useEffect(() => {
    if (gameState?.phase === 'game_over') {
      gameState.winner === myId ? Sounds.win() : Sounds.lose();
    }
  }, [gameState?.phase]);

  if (!gameState) return null;

  const { players, currentIndex } = gameState;
  const isMyTurn   = players[currentIndex]?.id === myId && gameState.phase === 'playing';
  const human      = players.find(p => p.id === myId);
  const playable   = isMyTurn ? getPlayable(gameState, myId) : [];
  const playableIds = playable.map(c => c.id);
  const showUNO    = isMyTurn && human?.hand.length === 2;

  function handlePlay(cardId) {
    Sounds.playCard();
    playCard(cardId);
  }

  function handleDraw() {
    if (!isMyTurn) return;
    Sounds.drawCard();
    drawCard();
  }

  function handleColor(color) {
    Sounds.wildCard();
    confirmColor(color);
  }

  function handleTimeout() {
    if (isMyTurn) { Sounds.drawCard(); drawCard(); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 select-none overflow-hidden">
      <GameHUD gameState={gameState} humanId={myId} />

      <div className="flex justify-center py-1">
        <TurnTimer active={isMyTurn} onTimeout={handleTimeout} />
      </div>

      <GameTable
        gameState={gameState}
        humanId={myId}
        onDraw={handleDraw}
        canDraw={isMyTurn && gameState.phase === 'playing'}
      />

      <div className="bg-gray-800/60 backdrop-blur border-t border-gray-700/50 pb-safe">
        <div className="flex items-center justify-between px-4 py-1">
          <span className="text-gray-400 text-xs font-semibold">
            {human?.name} — {human?.hand.length} cards
          </span>
          {isMyTurn && playableIds.length === 0 && (
            <span className="text-yellow-400 text-xs animate-pulse font-medium">
              No valid card — draw!
            </span>
          )}
        </div>

        <PlayerHand
          hand={human?.hand ?? []}
          playableIds={playableIds}
          onPlay={handlePlay}
          isMyTurn={isMyTurn}
        />
      </div>

      <UnoButton show={showUNO} onCall={() => Sounds.unoCall()} />

      <ColorPicker open={colorPicker} onSelect={handleColor} />

      <WinnerModal
        winner={gameState.phase === 'game_over' ? gameState.winner : null}
        players={players}
        scores={{}}
        onPlayAgain={() => navigate('/lobby')}
        onHome={() => { disconnect(); navigate('/'); }}
      />

      <Toast message={error} onDismiss={clearError} />
    </div>
  );
}
