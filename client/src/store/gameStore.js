// ─── Game Store (Zustand) ──────────────────────────────────────────────────────
import { create } from 'zustand';
import { createInitialState, playCard, drawCard, chooseColor } from '../utils/gameEngine.js';
import { executeAITurn } from '../utils/aiPlayer.js';

const AI_DELAY_MS = 900; // feel natural

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
  gameState:    null,   // UNO engine state
  mode:         null,   // 'singleplayer' | 'multiplayer'
  humanId:      'human',
  aiCount:      1,
  humanName:    'You',
  isAnimating:  false,
  colorPicker:  false,  // show color picker modal
  pendingCard:  null,   // card waiting for color pick
  message:      '',     // feedback message shown to user
  scores:       {},     // { playerId: wins }

  // ── Single-player actions ──────────────────────────────────────────────────

  startSinglePlayer(humanName, aiCount) {
    const configs = makePlayerConfigs(humanName, aiCount);
    const state   = createInitialState(configs);
    set({
      gameState:   state,
      mode:        'singleplayer',
      humanName:   humanName || 'You',
      humanId:     'human',
      aiCount,
      colorPicker: false,
      pendingCard: null,
      message:     '',
    });
  },

  resetGame() {
    const { humanName, aiCount } = get();
    const configs = makePlayerConfigs(humanName, aiCount);
    const state   = createInitialState(configs);
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
      const newState = playCard(gameState, humanId, cardId, null);
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
      let newState = playCard(gameState, humanId, pendingCard.id, color);
      if (newState.phase === 'choosing_color') {
        newState = chooseColor(newState, humanId, color);
      }
      set({ gameState: newState, colorPicker: false, pendingCard: null, message: '' });
      if (newState.phase === 'playing') get()._runAITurns(newState);
    } catch (err) {
      set({ colorPicker: false, pendingCard: null, message: typeof err === 'string' ? err : 'Error' });
    }
  },

  cancelColorPicker() {
    set({ colorPicker: false, pendingCard: null });
  },

  // ── Human draws ──────────────────────────────────────────────────────────

  drawCard() {
    const { gameState, humanId } = get();
    try {
      const newState = drawCard(gameState, humanId);
      set({ gameState: newState, message: '' });
      if (newState.phase === 'playing' && newState.currentIndex !== gameState.currentIndex) {
        get()._runAITurns(newState);
      }
    } catch (err) {
      set({ message: typeof err === 'string' ? err : 'Error' });
    }
  },

  // ── AI turn runner ────────────────────────────────────────────────────────

  _runAITurns(state) {
    const run = (s) => {
      if (s.phase !== 'playing') {
        set({ gameState: s });
        return;
      }
      const current = s.players[s.currentIndex];
      if (!current.isAI) {
        set({ gameState: s });
        return;
      }
      setTimeout(() => {
        const next = executeAITurn(s);
        run(next);
      }, AI_DELAY_MS);
    };
    run(state);
  },

  // ── Scoring ───────────────────────────────────────────────────────────────

  recordWin(playerId) {
    set(state => ({
      scores: { ...state.scores, [playerId]: (state.scores[playerId] ?? 0) + 1 },
    }));
  },

  clearMessage() { set({ message: '' }); },
}));
