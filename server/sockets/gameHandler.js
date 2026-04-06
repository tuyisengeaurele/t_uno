// ─── Socket.IO Game Handler ────────────────────────────────────────────────────
import {
  createRoom, getRoom, deleteRoom, getRoomByPlayer,
} from '../models/Room.js';
import {
  createInitialState, playCard, drawCard, chooseColor,
} from '../models/gameEngine.js';

// Maps old socket id → { roomCode, name } for reconnect grace window
const reconnectPending = new Map(); // oldId -> { roomCode, name, expiry }
const RECONNECT_GRACE_MS = 30_000;

export function registerGameHandlers(io, socket) {
  const { id } = socket;

  // ── Room: Create ────────────────────────────────────────────────────────────
  socket.on('room:create', ({ name }) => {
    try {
      const room = createRoom(id, name || 'Player');
      socket.join(room.code);
      socket.emit('room:created', { roomCode: room.code, players: room.players });
    } catch (err) {
      socket.emit('error', { message: String(err) });
    }
  });

  // ── Room: Join ──────────────────────────────────────────────────────────────
  socket.on('room:join', ({ roomCode, name }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit('room:error', { message: 'Room not found' });
    if (room.players.length >= 4) return socket.emit('room:error', { message: 'Room is full' });
    if (room.gameState) return socket.emit('room:error', { message: 'Game already in progress' });

    room.addPlayer(id, name || 'Player');
    socket.join(roomCode);

    socket.emit('room:joined',   { roomCode, players: room.players });
    socket.to(roomCode).emit('room:updated', { players: room.players });
  });

  // ── Reconnect: Rejoin a game in progress ───────────────────────────────────
  socket.on('room:reconnect', ({ roomCode, name }) => {
    const room = getRoom(roomCode);
    if (!room?.gameState) return socket.emit('room:error', { message: 'No active game to rejoin' });

    // Find a pending reconnect slot for this name
    const slot = [...reconnectPending.entries()].find(
      ([, v]) => v.roomCode === roomCode && v.name === name && v.expiry > Date.now()
    );

    if (!slot) {
      // Allow spectator-style rejoin (read-only state sync)
      socket.join(roomCode);
      socket.emit('game:state', { gameState: room.gameState });
      return;
    }

    // Swap old player id → new socket id in game state
    const [oldId, { expiry }] = slot;
    reconnectPending.delete(oldId);

    // Patch gameState player id
    room.gameState = {
      ...room.gameState,
      players: room.gameState.players.map(p =>
        p.id === oldId ? { ...p, id } : p
      ),
    };
    // Patch room player list
    const rp = room.players.find(p => p.id === oldId);
    if (rp) rp.id = id;

    socket.join(roomCode);
    socket.emit('game:reconnected', { gameState: room.gameState });
    socket.to(roomCode).emit('room:updated', { players: room.players });
    console.log(`[reconnect] ${name} (${oldId} → ${id}) rejoined room ${roomCode}`);
  });

  // ── Game: Start ─────────────────────────────────────────────────────────────
  socket.on('game:start', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit('error', { message: 'Room not found' });
    if (room.hostId !== id) return socket.emit('error', { message: 'Only the host can start' });
    if (room.players.length < 2) return socket.emit('error', { message: 'Need at least 2 players' });

    const configs  = room.players.map(p => ({ id: p.id, name: p.name, isAI: false }));
    room.gameState = createInitialState(configs);

    io.to(roomCode).emit('game:start', { gameState: room.gameState });
  });

  // ── Game: Play Card ─────────────────────────────────────────────────────────
  socket.on('game:play', ({ roomCode, cardId, chosenColor: color }) => {
    const room = getRoom(roomCode);
    if (!room?.gameState) return;
    try {
      let ns = playCard(room.gameState, id, cardId, color ?? null);
      if (ns.phase === 'choosing_color' && color) {
        ns = chooseColor(ns, id, color);
      }
      room.gameState = ns;
      io.to(roomCode).emit('game:state', { gameState: ns });
    } catch (err) {
      socket.emit('error', { message: String(err) });
    }
  });

  // ── Game: Draw Card ─────────────────────────────────────────────────────────
  socket.on('game:draw', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room?.gameState) return;
    try {
      const ns = drawCard(room.gameState, id);
      room.gameState = ns;
      io.to(roomCode).emit('game:state', { gameState: ns });
    } catch (err) {
      socket.emit('error', { message: String(err) });
    }
  });

  // ── Disconnect cleanup (with reconnect grace period) ────────────────────────
  socket.on('disconnect', () => {
    const room = getRoomByPlayer(id);
    if (!room) return;

    const player = room.players.find(p => p.id === id);
    if (!player) return;

    // If game is running, store reconnect slot and give grace period
    if (room.gameState && room.gameState.phase === 'playing') {
      reconnectPending.set(id, {
        roomCode: room.code,
        name:     player.name,
        expiry:   Date.now() + RECONNECT_GRACE_MS,
      });

      io.to(room.code).emit('room:player_disconnected', {
        playerId: id,
        name:     player.name,
        graceMs:  RECONNECT_GRACE_MS,
      });

      // Clean up pending slot after grace window
      setTimeout(() => {
        if (!reconnectPending.has(id)) return; // already reconnected
        reconnectPending.delete(id);

        // Check room still exists
        const r = getRoom(room.code);
        if (!r) return;

        r.removePlayer(id);
        if (r.players.length === 0) { deleteRoom(r.code); return; }

        // End game as forfeit
        r.gameState = { ...r.gameState, phase: 'game_over', winner: r.players[0].id };
        io.to(r.code).emit('game:state', { gameState: r.gameState });
      }, RECONNECT_GRACE_MS);

      return;
    }

    // Not in game — just remove
    room.removePlayer(id);
    if (room.players.length === 0) { deleteRoom(room.code); return; }
    io.to(room.code).emit('room:updated', { players: room.players });
  });
}
