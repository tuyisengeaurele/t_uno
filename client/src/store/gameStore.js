// ─── Game Store (Zustand) ──────────────────────────────────────────────────────
import { create } from 'zustand';
import {
  createInitialState,
  playCard  as enginePlayCard,
  drawCard  as engineDrawCard,
  chooseColor as engineChooseColor,
} from '../utils/gameEngine.js';
import { executeAITurn } from '../utils/aiPlayer.js';

const AI_DELAY_MS = 900;

function makePlayerConfigs(humanName, aiCount) {
  const players = [{ id: 'human', name: humanName || 'You', isAI: false }];
  const aiNames = ['Nova', 'Blaze', 'Zara'];
  for (let i = 0; i < aiCount; i++) {
    players.push({ id: `ai_${i}`, name: aiNames[i], isAI: true });
  }
  return players;
}

export const useGameStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  gameState:   null,
  mode:        null,
  humanId:     'human',
  aiCount:     1,
  humanName:   'You',
  colorPicker: false,
  pendingCard: null,
  message:     '',
  scores:      {},

  // ── Single-player setup ───────────────────────────────────────────────────

  startSinglePlayer(humanName, aiCount) {
    const configs = makePlayerConfigs(humanName, aiCount);
    const state   = createInitialState(configs);
    set({
      gameState: state, mode: 'singleplayer',
      humanName: humanName || 'You', humanId: 'human', aiCount,
      colorPicker: false, pendingCard: null, message: '',
    });
  },

  resetGame() {
    const { humanName, aiCount } = get();
    const state = createInitialState(makePlayerConfigs(humanName, aiCount));
    set({ gameState: state, colorPicker: false, pendingCard: null, message: '' });
  },

  // ── Human plays a card ────────────────────────────────────────────────────

  playCard(cardId) {
    const { gameState, humanId } = get();
    const card = gameState.players.find(p => p.id === humanId)?.hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      set({ colorPicker: true, pendingCard: card });
      return;
    }

    try {
      const newState = enginePlayCard(gameState, humanId, cardId, null);
      set({ gameState: newState, message: '' });
      if (newState.phase === 'playing') get()._runAITurns(newState);
    } catch (err) {
      set({ message: typeof err === 'string' ? err : 'Invalid move' });
    }
  },

  confirmColor(color) {
    const { gameState, humanId, pendingCard } = get();
    if (!pendingCard) return;
    try {
      let newState = enginePlayCard(gameState, humanId, pendingCard.id, color);
      if (newState.phase === 'choosing_color') {
        newState = engineChooseColor(newState, humanId, color);
      }
      set({ gameState: newState, colorPicker: false, pendingCard: null, message: '' });
      if (newState.phase === 'playing') get()._runAITurns(newState);
    } catch (err) {
      set({ colorPicker: false, pendingCard: null, message: typeof err === 'string' ? err : 'Error' });
    }
  },

  cancelColorPicker() { set({ colorPicker: false, pendingCard: null }); },

  // ── Human draws ──────────────────────────────────────────────────────────

  drawCard() {
    const { gameState, humanId } = get();
    try {
      const newState = engineDrawCard(gameState, humanId);
      set({ gameState: newState, message: '' });
      // Turn moved to next player → kick off AI chain
      const turnMoved = newState.currentIndex !== gameState.currentIndex;
      if (newState.phase === 'playing' && turnMoved) {
        get()._runAITurns(newState);
      }
      // Drawn card is playable → keep turn on human, show a hint
      if (newState.phase === 'playing' && !turnMoved) {
        const drawnCard = newState.players.find(p => p.id === humanId)?.hand.at(-1);
        if (drawnCard) set({ message: `Drew a ${drawnCard.value} — you may play it!` });
      }
    } catch (err) {
      set({ message: typeof err === 'string' ? err : 'Error' });
    }
  },

  // ── AI turn runner ────────────────────────────────────────────────────────

  _runAITurns(state) {
    const run = (s) => {
      if (s.phase !== 'playing') { set({ gameState: s }); return; }
      const current = s.players[s.currentIndex];
      if (!current.isAI) { set({ gameState: s }); return; }
      setTimeout(() => run(executeAITurn(s)), AI_DELAY_MS);
    };
    run(state);
  },

  // ── Scoring ───────────────────────────────────────────────────────────────

  recordWin(playerId) {
    set(s => ({ scores: { ...s.scores, [playerId]: (s.scores[playerId] ?? 0) + 1 } }));
  },

  clearMessage() { set({ message: '' }); },
}));
