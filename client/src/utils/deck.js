// ─── UNO Deck & Card Utilities ────────────────────────────────────────────────
// Pure functions — no side effects, easily testable.

export const COLORS = ['red', 'blue', 'green', 'yellow'];

export const ACTION_CARDS = ['skip', 'reverse', 'draw_two'];
export const WILD_CARDS   = ['wild', 'wild_draw_four'];

/**
 * Build a standard 108-card UNO deck.
 * Each card: { id, color, type, value }
 *   color : 'red' | 'blue' | 'green' | 'yellow' | 'wild'
 *   type  : 'number' | 'skip' | 'reverse' | 'draw_two' | 'wild' | 'wild_draw_four'
 *   value : '0'–'9' | 'skip' | 'reverse' | 'draw_two' | 'wild' | 'wild_draw_four'
 */
export function buildDeck() {
  let id = 0;
  const cards = [];

  for (const color of COLORS) {
    // One '0'
    cards.push({ id: id++, color, type: 'number', value: '0' });

    // Two each of '1'–'9'
    for (let n = 1; n <= 9; n++) {
      cards.push({ id: id++, color, type: 'number', value: String(n) });
      cards.push({ id: id++, color, type: 'number', value: String(n) });
    }

    // Two each of action cards
    for (const action of ACTION_CARDS) {
      cards.push({ id: id++, color, type: action, value: action });
      cards.push({ id: id++, color, type: action, value: action });
    }
  }

  // Four wilds + four wild draw fours
  for (let i = 0; i < 4; i++) {
    cards.push({ id: id++, color: 'wild', type: 'wild',           value: 'wild' });
    cards.push({ id: id++, color: 'wild', type: 'wild_draw_four', value: 'wild_draw_four' });
  }

  return cards;
}

/** Fisher-Yates shuffle (returns new array) */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Deal `count` cards from the top of the draw pile */
export function dealCards(drawPile, count) {
  const hand = drawPile.slice(0, count);
  const remaining = drawPile.slice(count);
  return { hand, drawPile: remaining };
}

/**
 * Reshuffle the discard pile back into the draw pile,
 * keeping the top discard card in place.
 */
export function reshuffleDiscard(drawPile, discardPile) {
  const topCard    = discardPile[discardPile.length - 1];
  const toShuffle  = discardPile.slice(0, -1);
  const newDraw    = shuffle([...drawPile, ...toShuffle]);
  return { drawPile: newDraw, discardPile: [topCard] };
}

/** Check whether a card can legally be played on the current top card */
export function canPlay(card, topCard, currentColor) {
  if (card.type === 'wild' || card.type === 'wild_draw_four') return true;
  if (card.color === currentColor) return true;
  if (card.type === 'number' && card.value === topCard.value) return true;
  if (card.type !== 'number' && card.type === topCard.type) return true;
  return false;
}

/** Return all playable cards from a hand */
export function getPlayableCards(hand, topCard, currentColor) {
  return hand.filter(c => canPlay(c, topCard, currentColor));
}

/** Display label for a card */
export function cardLabel(card) {
  const map = {
    skip:           'Skip',
    reverse:        'Reverse',
    draw_two:       '+2',
    wild:           'Wild',
    wild_draw_four: '+4',
  };
  return card.type === 'number' ? card.value : map[card.type] ?? card.type;
}
