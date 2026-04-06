// ─── UNO Game Engine ──────────────────────────────────────────────────────────
// Pure state-transition functions.
// State shape:
// {
//   players     : [{ id, name, isAI, hand: [] }],
//   drawPile    : [],
//   discardPile : [],
//   currentColor: string,
//   currentIndex: number,   // index in players array whose turn it is
//   direction   : 1 | -1,
//   phase       : 'playing' | 'choosing_color' | 'game_over',
//   winner      : null | playerId,
//   pendingDraw : number,   // accumulated draw cards (stacking)
//   lastAction  : string,
// }

import {
  buildDeck, shuffle, dealCards, reshuffleDiscard,
  canPlay, getPlayableCards,
} from './deck.js';

const HAND_SIZE = 7;

// ── Init ──────────────────────────────────────────────────────────────────────

export function createInitialState(playerConfigs) {
  // playerConfigs: [{ id, name, isAI }]
  let drawPile = shuffle(buildDeck());

  const players = playerConfigs.map(cfg => {
    const { hand, drawPile: remaining } = dealCards(drawPile, HAND_SIZE);
    drawPile = remaining;
    return { ...cfg, hand };
  });

  // Flip first non-wild card to start discard pile
  let topCard;
  while (true) {
    topCard = drawPile[0];
    drawPile = drawPile.slice(1);
    if (topCard.color !== 'wild') break;
    drawPile = [...drawPile, topCard]; // put wild at the bottom
  }

  return {
    players,
    drawPile,
    discardPile:  [topCard],
    currentColor: topCard.color,
    currentIndex: 0,
    direction:    1,
    phase:        'playing',
    winner:       null,
    pendingDraw:  0,
    lastAction:   'Game started',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function topCard(state) {
  return state.discardPile[state.discardPile.length - 1];
}

function nextIndex(state, skip = false) {
  const { players, currentIndex, direction } = state;
  const count = players.length;
  let next = (currentIndex + direction + count) % count;
  if (skip) next = (next + direction + count) % count;
  return next;
}

function applyDraw(state, playerIndex, count) {
  let { drawPile, discardPile } = state;
  if (drawPile.length < count) {
    ({ drawPile, discardPile } = reshuffleDiscard(drawPile, discardPile));
  }
  const { hand: drawn, drawPile: newDraw } = dealCards(drawPile, count);
  const players = state.players.map((p, i) =>
    i === playerIndex ? { ...p, hand: [...p.hand, ...drawn] } : p
  );
  return { ...state, players, drawPile: newDraw, discardPile };
}

// ── Play a card ───────────────────────────────────────────────────────────────

/**
 * playCard(state, playerId, cardId, chosenColor?)
 * Returns new state or throws string error.
 */
export function playCard(state, playerId, cardId, chosenColor = null) {
  if (state.phase !== 'playing') throw 'Not in playing phase';

  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex < 0) throw 'Player not found';
  if (playerIndex !== state.currentIndex) throw 'Not your turn';

  const player = state.players[playerIndex];
  const card = player.hand.find(c => c.id === cardId);
  if (!card) throw 'Card not in hand';

  if (!canPlay(card, topCard(state), state.currentColor)) throw 'Card cannot be played';

  // Wild requires color choice
  if ((card.type === 'wild' || card.type === 'wild_draw_four') && !chosenColor) {
    // Transition to color-choosing phase without advancing turn
    const newHand = player.hand.filter(c => c.id !== cardId);
    const players = state.players.map((p, i) =>
      i === playerIndex ? { ...p, hand: newHand } : p
    );
    return {
      ...state,
      players,
      discardPile:  [...state.discardPile, card],
      phase:        'choosing_color',
      lastAction:   `${player.name} played ${card.type === 'wild' ? 'Wild' : 'Wild +4'}`,
    };
  }

  // Remove card from hand
  const newHand = player.hand.filter(c => c.id !== cardId);
  const players = state.players.map((p, i) =>
    i === playerIndex ? { ...p, hand: newHand } : p
  );
  let newState = {
    ...state,
    players,
    discardPile:  [...state.discardPile, card],
    currentColor: chosenColor ?? card.color,
    lastAction:   `${player.name} played ${card.value}`,
  };

  // Check win
  if (newHand.length === 0) {
    return { ...newState, phase: 'game_over', winner: playerId };
  }

  // Apply card effects
  switch (card.type) {
    case 'skip':
      newState = { ...newState, currentIndex: nextIndex(newState, true) };
      newState.lastAction = `${player.name} played Skip`;
      break;

    case 'reverse':
      newState = { ...newState, direction: newState.direction * -1 };
      // In 2-player, reverse acts like skip
      if (newState.players.length === 2) {
        newState = { ...newState, currentIndex: nextIndex({ ...newState, direction: newState.direction * -1 }) };
      } else {
        newState = { ...newState, currentIndex: nextIndex(newState) };
      }
      newState.lastAction = `${player.name} played Reverse`;
      break;

    case 'draw_two':
      newState = applyDraw(newState, nextIndex(newState), 2);
      newState = { ...newState, currentIndex: nextIndex(newState, true) };
      newState.lastAction = `${player.name} played +2`;
      break;

    case 'wild_draw_four':
      newState = applyDraw(newState, nextIndex(newState), 4);
      newState = { ...newState, currentIndex: nextIndex(newState, true) };
      newState.lastAction = `${player.name} played Wild +4`;
      break;

    default:
      newState = { ...newState, currentIndex: nextIndex(newState) };
  }

  return newState;
}

// ── Choose color after wild ───────────────────────────────────────────────────

export function chooseColor(state, playerId, color) {
  if (state.phase !== 'choosing_color') throw 'Not choosing color';
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex !== state.currentIndex) throw 'Not your turn';

  const card = topCard(state);
  let newState = { ...state, currentColor: color, phase: 'playing' };

  if (card.type === 'wild_draw_four') {
    newState = applyDraw(newState, nextIndex(newState), 4);
    newState = { ...newState, currentIndex: nextIndex(newState, true) };
  } else {
    newState = { ...newState, currentIndex: nextIndex(newState) };
  }

  newState.lastAction = `Color changed to ${color}`;
  return newState;
}

// ── Draw a card ───────────────────────────────────────────────────────────────

export function drawCard(state, playerId) {
  if (state.phase !== 'playing') throw 'Not in playing phase';
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex < 0) throw 'Player not found';
  if (playerIndex !== state.currentIndex) throw 'Not your turn';

  let newState = applyDraw(state, playerIndex, 1);
  const drawnCard = newState.players[playerIndex].hand.at(-1);

  newState.lastAction = `${state.players[playerIndex].name} drew a card`;

  // If drawn card is playable, player may play it immediately (auto-advance turn if not playable)
  if (!canPlay(drawnCard, topCard(newState), newState.currentColor)) {
    newState = { ...newState, currentIndex: nextIndex(newState) };
  }

  return newState;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function currentPlayer(state) {
  return state.players[state.currentIndex];
}

export function getPlayable(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return [];
  return getPlayableCards(player.hand, topCard(state), state.currentColor);
}
