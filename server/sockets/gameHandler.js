// ─── Socket.IO Game Handler ────────────────────────────────────────────────────
import {
  createRoom, getRoom, deleteRoom, getRoomByPlayer,
} from '../models/Room.js';
import {
  createInitialState, playCard, drawCard, chooseColor,
} from '../models/gameEngine.js';

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

  // ── Game: Start ─────────────────────────────────────────────────────────────
  socket.on('game:start', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit('error', { message: 'Room not found' });
    if (room.hostId !== id) return socket.emit('error', { message: 'Only the host can start' });
    if (room.players.length < 2) return socket.emit('error', { message: 'Need at least 2 players' });

    const configs    = room.players.map(p => ({ id: p.id, name: p.name, isAI: false }));
    room.gameState   = createInitialState(configs);

    io.to(roomCode).emit('game:start', { gameState: room.gameState });
  });

  // ── Game: Play Card ─────────────────────────────────────────────────────────
  socket.on('game:play', ({ roomCode, cardId, chosenColor }) => {
    const room = getRoom(roomCode);
    if (!room?.gameState) return;
    try {
      let ns = playCard(room.gameState, id, cardId, chosenColor ?? null);
      // If still in choosing_color phase and chosenColor was given, resolve it
      if (ns.phase === 'choosing_color' && chosenColor) {
        ns = chooseColor(ns, id, chosenColor);
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

  // ── Disconnect cleanup ──────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const room = getRoomByPlayer(id);
    if (!room) return;

    room.removePlayer(id);

    if (room.players.length === 0) {
      deleteRoom(room.code);
      return;
    }

    // If game was running, end it
    if (room.gameState && room.gameState.phase === 'playing') {
      room.gameState = { ...room.gameState, phase: 'game_over', winner: room.players[0].id };
      io.to(room.code).emit('game:state', { gameState: room.gameState });
    } else {
      io.to(room.code).emit('room:updated', { players: room.players });
    }
  });
}
