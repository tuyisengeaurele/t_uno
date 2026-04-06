// ─── Multiplayer Store (Zustand + Socket.IO) ──────────────────────────────────
import { create } from 'zustand';
import { io } from 'socket.io-client';

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io({ autoConnect: false, transports: ['websocket'] });
  }
  return socket;
}

export const useMultiplayerStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  socket:      null,
  connected:   false,
  roomCode:    null,
  players:     [],       // [{ id, name, ready }]
  myId:        null,
  myName:      '',
  gameState:   null,
  phase:       'idle',   // 'idle' | 'lobby' | 'playing' | 'game_over'
  error:       null,
  colorPicker: false,
  pendingCard: null,

  // ── Connect ───────────────────────────────────────────────────────────────

  connect(name) {
    const s = getSocket();
    set({ socket: s, myName: name });

    s.off();  // remove old listeners before reconnecting

    s.on('connect', () => {
      set({ connected: true, myId: s.id, error: null });
      // Auto-reconnect: if we were in a game, try to rejoin
      const { roomCode, myName, phase } = get();
      if (roomCode && (phase === 'playing' || phase === 'game_over')) {
        s.emit('room:reconnect', { roomCode, name: myName });
      }
    });
    s.on('disconnect', () => set({ connected: false }));
    s.on('error',      ({ message }) => set({ error: message }));

    // Lobby events
    s.on('room:created',  ({ roomCode, players }) => set({ roomCode, players, phase: 'lobby' }));
    s.on('room:joined',   ({ roomCode, players }) => set({ roomCode, players, phase: 'lobby' }));
    s.on('room:updated',  ({ players }) => set({ players }));
    s.on('room:error',    ({ message }) => set({ error: message }));

    // Reconnect events
    s.on('room:reconnected',         ({ gameState }) => set({ gameState, phase: 'playing', myId: s.id }));
    s.on('room:player_disconnected', ({ name, graceMs }) =>
      set({ error: `${name} disconnected — ${graceMs / 1000}s to reconnect…` })
    );

    // Game events
    s.on('game:start',   ({ gameState }) => set({ gameState, phase: 'playing', error: null }));
    s.on('game:state',   ({ gameState }) => {
      set({ gameState });
      if (gameState.phase === 'game_over') set({ phase: 'game_over' });
    });
    s.on('game:color',   () => set({ colorPicker: true }));

    s.connect();
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
    set({ connected: false, roomCode: null, players: [], gameState: null, phase: 'idle' });
  },

  // ── Room actions ──────────────────────────────────────────────────────────

  createRoom() {
    const { socket: s, myName } = get();
    s?.emit('room:create', { name: myName });
  },

  joinRoom(roomCode) {
    const { socket: s, myName } = get();
    s?.emit('room:join', { roomCode: roomCode.toUpperCase(), name: myName });
  },

  startGame() {
    const { socket: s, roomCode } = get();
    s?.emit('game:start', { roomCode });
  },

  // ── Game actions ──────────────────────────────────────────────────────────

  playCard(cardId) {
    const { socket: s, roomCode, gameState, myId } = get();
    const player = gameState?.players.find(p => p.id === myId);
    const card   = player?.hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      set({ colorPicker: true, pendingCard: card });
      return;
    }
    s?.emit('game:play', { roomCode, cardId, chosenColor: null });
  },

  confirmColor(color) {
    const { socket: s, roomCode, pendingCard } = get();
    if (!pendingCard) return;
    s?.emit('game:play', { roomCode, cardId: pendingCard.id, chosenColor: color });
    set({ colorPicker: false, pendingCard: null });
  },

  cancelColorPicker() { set({ colorPicker: false, pendingCard: null }); },

  drawCard() {
    const { socket: s, roomCode } = get();
    s?.emit('game:draw', { roomCode });
  },

  clearError() { set({ error: null }); },
}));
