// ─── Server-side UNO Game Engine ──────────────────────────────────────────────
// Mirror of client/src/utils/gameEngine.js — kept in sync manually.
// (In a real monorepo this would be a shared package.)

const COLORS       = ['red', 'blue', 'green', 'yellow'];
const ACTION_CARDS = ['skip', 'reverse', 'draw_two'];

function buildDeck() {
  let id = 0;
  const cards = [];
  for (const color of COLORS) {
    cards.push({ id: id++, color, type: 'number', value: '0' });
    for (let n = 1; n <= 9; n++) {
      cards.push({ id: id++, color, type: 'number', value: String(n) });
      cards.push({ id: id++, color, type: 'number', value: String(n) });
    }
    for (const action of ACTION_CARDS) {
      cards.push({ id: id++, color, type: action, value: action });
      cards.push({ id: id++, color, type: action, value: action });
    }
  }
  for (let i = 0; i < 4; i++) {
    cards.push({ id: id++, color: 'wild', type: 'wild',           value: 'wild' });
    cards.push({ id: id++, color: 'wild', type: 'wild_draw_four', value: 'wild_draw_four' });
  }
  return cards;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dealCards(drawPile, count) {
  return { hand: drawPile.slice(0, count), drawPile: drawPile.slice(count) };
}

function reshuffleDiscard(drawPile, discardPile) {
  const topCard   = discardPile[discardPile.length - 1];
  const newDraw   = shuffle([...drawPile, ...discardPile.slice(0, -1)]);
  return { drawPile: newDraw, discardPile: [topCard] };
}

function canPlay(card, topCard, currentColor) {
  if (card.type === 'wild' || card.type === 'wild_draw_four') return true;
  if (card.color === currentColor) return true;
  if (card.type === 'number' && card.value === topCard.value) return true;
  if (card.type !== 'number' && card.type === topCard.type) return true;
  return false;
}

function topCard(state) { return state.discardPile[state.discardPile.length - 1]; }

function nextIndex(state, skip = false) {
  const { players, currentIndex, direction } = state;
  const n = players.length;
  let next = (currentIndex + direction + n) % n;
  if (skip) next = (next + direction + n) % n;
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

export function createInitialState(playerConfigs) {
  let drawPile = shuffle(buildDeck());
  const players = playerConfigs.map(cfg => {
    const { hand, drawPile: remaining } = dealCards(drawPile, 7);
    drawPile = remaining;
    return { ...cfg, hand };
  });
  let top;
  while (true) {
    top = drawPile[0]; drawPile = drawPile.slice(1);
    if (top.color !== 'wild') break;
    drawPile = [...drawPile, top];
  }
  return {
    players, drawPile,
    discardPile:  [top],
    currentColor: top.color,
    currentIndex: 0,
    direction:    1,
    phase:        'playing',
    winner:       null,
    lastAction:   'Game started',
  };
}

export function playCard(state, playerId, cardId, chosenColor = null) {
  if (state.phase !== 'playing') throw 'Not in playing phase';
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex < 0) throw 'Player not found';
  if (playerIndex !== state.currentIndex) throw 'Not your turn';
  const player = state.players[playerIndex];
  const card   = player.hand.find(c => c.id === cardId);
  if (!card) throw 'Card not in hand';
  if (!canPlay(card, topCard(state), state.currentColor)) throw 'Card cannot be played';

  if ((card.type === 'wild' || card.type === 'wild_draw_four') && !chosenColor) {
    const newHand = player.hand.filter(c => c.id !== cardId);
    const players = state.players.map((p, i) => i === playerIndex ? { ...p, hand: newHand } : p);
    return { ...state, players, discardPile: [...state.discardPile, card], phase: 'choosing_color', lastAction: `${player.name} played ${card.type}` };
  }

  const newHand = player.hand.filter(c => c.id !== cardId);
  const players = state.players.map((p, i) => i === playerIndex ? { ...p, hand: newHand } : p);
  let ns = { ...state, players, discardPile: [...state.discardPile, card], currentColor: chosenColor ?? card.color, lastAction: `${player.name} played ${card.value}` };

  if (newHand.length === 0) return { ...ns, phase: 'game_over', winner: playerId };

  switch (card.type) {
    case 'skip':
      ns = { ...ns, currentIndex: nextIndex(ns, true) };
      break;
    case 'reverse':
      ns = { ...ns, direction: ns.direction * -1 };
      ns = ns.players.length === 2
        ? { ...ns, currentIndex: nextIndex({ ...ns, direction: ns.direction * -1 }) }
        : { ...ns, currentIndex: nextIndex(ns) };
      break;
    case 'draw_two':
      ns = applyDraw(ns, nextIndex(ns), 2);
      ns = { ...ns, currentIndex: nextIndex(ns, true) };
      break;
    case 'wild_draw_four':
      ns = applyDraw(ns, nextIndex(ns), 4);
      ns = { ...ns, currentIndex: nextIndex(ns, true) };
      break;
    default:
      ns = { ...ns, currentIndex: nextIndex(ns) };
  }
  return ns;
}

export function chooseColor(state, playerId, color) {
  if (state.phase !== 'choosing_color') throw 'Not choosing color';
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex !== state.currentIndex) throw 'Not your turn';
  const card = topCard(state);
  let ns = { ...state, currentColor: color, phase: 'playing' };
  if (card.type === 'wild_draw_four') {
    ns = applyDraw(ns, nextIndex(ns), 4);
    ns = { ...ns, currentIndex: nextIndex(ns, true) };
  } else {
    ns = { ...ns, currentIndex: nextIndex(ns) };
  }
  ns.lastAction = `Color changed to ${color}`;
  return ns;
}

export function drawCard(state, playerId) {
  if (state.phase !== 'playing') throw 'Not in playing phase';
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex < 0) throw 'Player not found';
  if (playerIndex !== state.currentIndex) throw 'Not your turn';
  let ns = applyDraw(state, playerIndex, 1);
  ns.lastAction = `${state.players[playerIndex].name} drew a card`;
  const drawnCard = ns.players[playerIndex].hand.at(-1);
  if (!canPlay(drawnCard, topCard(ns), ns.currentColor)) {
    ns = { ...ns, currentIndex: nextIndex(ns) };
  }
  return ns;
}
