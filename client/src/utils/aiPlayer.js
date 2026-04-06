// ─── Simple AI Opponent ────────────────────────────────────────────────────────
// Strategy (priority order):
//   1. Wild Draw Four  (save for dire need — only if no other match)
//   2. Action cards    (skip, reverse, draw_two) matching current color
//   3. Number cards    matching current color
//   4. Any card matching current number/type (different color)
//   5. Wild            (color change — pick most common color in hand)
//   6. Wild Draw Four  (last resort)
//   7. Draw            (no playable card)

import { COLORS } from './deck.js';
import { getPlayable, drawCard, playCard, chooseColor } from './gameEngine.js';

/**
 * Pick the best card for the AI to play.
 * Returns { card, chosenColor } or null (should draw).
 */
export function pickAIMove(state, playerId) {
  const playable = getPlayable(state, playerId);
  if (playable.length === 0) return null;

  const player = state.players.find(p => p.id === playerId);

  // Separate wilds from colored cards
  const wildsPlus4 = playable.filter(c => c.type === 'wild_draw_four');
  const wilds      = playable.filter(c => c.type === 'wild');
  const colored    = playable.filter(c => c.color !== 'wild');

  // 1. Action cards matching color (aggressive play)
  const colorActions = colored.filter(c =>
    c.color === state.currentColor && c.type !== 'number'
  );
  if (colorActions.length) return { card: colorActions[0], chosenColor: null };

  // 2. Number cards matching color
  const colorNumbers = colored.filter(c =>
    c.color === state.currentColor && c.type === 'number'
  );
  if (colorNumbers.length) return { card: colorNumbers[0], chosenColor: null };

  // 3. Other colored cards (off-color match by number/type)
  if (colored.length) return { card: colored[0], chosenColor: null };

  // 4. Wild (choose best color)
  if (wilds.length) {
    return { card: wilds[0], chosenColor: bestColor(player.hand) };
  }

  // 5. Wild Draw Four (last resort)
  if (wildsPlus4.length) {
    return { card: wildsPlus4[0], chosenColor: bestColor(player.hand) };
  }

  return null;
}

/** Return the color most represented in a hand (excluding wilds) */
function bestColor(hand) {
  const counts = { red: 0, blue: 0, green: 0, yellow: 0 };
  for (const c of hand) {
    if (c.color !== 'wild') counts[c.color]++;
  }
  return COLORS.reduce((best, col) => counts[col] > counts[best] ? col : best, 'red');
}

/**
 * Execute one AI turn, returning the new game state.
 * Handles draw + play-or-pass logic.
 */
export function executeAITurn(state) {
  const player = state.players[state.currentIndex];
  if (!player.isAI) return state;

  const move = pickAIMove(state, player.id);

  if (!move) {
    // Draw and check if drawable card can be played
    let newState = drawCard(state, player.id);
    // drawCard already advances the turn if card isn't playable
    // If it's still the AI's turn, try to play the drawn card
    if (newState.currentIndex === state.currentIndex) {
      const drawnCard = newState.players[state.currentIndex].hand.at(-1);
      const newMove = { card: drawnCard, chosenColor: null };
      if (drawnCard.type === 'wild' || drawnCard.type === 'wild_draw_four') {
        newMove.chosenColor = bestColor(newState.players[state.currentIndex].hand);
      }
      try {
        newState = playCard(newState, player.id, drawnCard.id, newMove.chosenColor);
        if (newState.phase === 'choosing_color') {
          newState = chooseColor(newState, player.id, newMove.chosenColor);
        }
      } catch {
        // Can't play drawn card — turn already advanced in drawCard
      }
    }
    return newState;
  }

  let newState = playCard(state, player.id, move.card.id, move.chosenColor);

  // If we land on choosing_color (shouldn't happen since we pass chosenColor, but safety net)
  if (newState.phase === 'choosing_color') {
    newState = chooseColor(newState, player.id, move.chosenColor ?? bestColor(state.players[state.currentIndex].hand));
  }

  return newState;
}
