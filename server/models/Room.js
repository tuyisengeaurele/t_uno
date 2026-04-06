// ─── Room Model ───────────────────────────────────────────────────────────────
// In-memory store of all active rooms.
// In a production system this would be backed by Redis.

const rooms = new Map(); // roomCode -> Room

export class Room {
  constructor(code, hostId, hostName) {
    this.code      = code;
    this.players   = [{ id: hostId, name: hostName }]; // [{ id, name }]
    this.gameState = null;
    this.createdAt = Date.now();
  }

  addPlayer(id, name) {
    if (this.players.length >= 4) return false;
    if (this.players.find(p => p.id === id)) return true; // already in
    this.players.push({ id, name });
    return true;
  }

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
  }

  get hostId() {
    return this.players[0]?.id ?? null;
  }

  toJSON() {
    return {
      code:      this.code,
      players:   this.players,
      gameState: this.gameState,
    };
  }
}

// ── Room registry ─────────────────────────────────────────────────────────────

export function createRoom(hostId, hostName) {
  const code = generateCode();
  const room = new Room(code, hostId, hostName);
  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code) ?? null;
}

export function deleteRoom(code) {
  rooms.delete(code);
}

export function getRoomByPlayer(playerId) {
  for (const room of rooms.values()) {
    if (room.players.find(p => p.id === playerId)) return room;
  }
  return null;
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}
