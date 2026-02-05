// Simple in-memory session store (POC - no database needed)

export interface Session {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  currentIssue: {
    key: string;
    title: string;
  } | null;
  createdAt: Date;
  status: 'waiting' | 'voting' | 'revealed';
}

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  isOwner: boolean;
  joinedAt: Date;
}

export interface Vote {
  playerId: string;
  playerName: string;
  value: string;
  votedAt: Date;
}

export interface VotingResults {
  average: number;
  median: number;
  min: number;
  max: number;
  mode?: string;
  distribution: Record<string, number>;
}

// In-memory storage
const sessions = new Map<string, Session>();
const players = new Map<string, Player[]>();
const votes = new Map<string, Vote[]>();

// Generate simple IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Session operations
export function createSession(name: string, ownerName: string): { session: Session; playerId: string } {
  const sessionId = generateId();
  const playerId = generateId();

  const session: Session = {
    id: sessionId,
    name,
    ownerId: playerId,
    ownerName,
    currentIssue: null,
    createdAt: new Date(),
    status: 'waiting',
  };

  const owner: Player = {
    id: playerId,
    sessionId,
    name: ownerName,
    isOwner: true,
    joinedAt: new Date(),
  };

  sessions.set(sessionId, session);
  players.set(sessionId, [owner]);
  votes.set(sessionId, []);

  return { session, playerId };
}

export function getSession(sessionId: string): Session | null {
  return sessions.get(sessionId) || null;
}

export function joinSession(sessionId: string, playerName: string): Player | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const sessionPlayers = players.get(sessionId) || [];

  // Check if player already exists
  const existing = sessionPlayers.find(p => p.name === playerName);
  if (existing) return existing;

  const playerId = generateId();
  const player: Player = {
    id: playerId,
    sessionId,
    name: playerName,
    isOwner: false,
    joinedAt: new Date(),
  };

  sessionPlayers.push(player);
  players.set(sessionId, sessionPlayers);

  return player;
}

export function getPlayers(sessionId: string): Player[] {
  return players.get(sessionId) || [];
}

export function setIssue(sessionId: string, issueKey: string, issueTitle: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  session.currentIssue = { key: issueKey, title: issueTitle };
  session.status = 'voting';

  // Clear previous votes
  votes.set(sessionId, []);

  return true;
}

export function submitVote(sessionId: string, playerId: string, value: string): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.status !== 'voting') return false;

  const sessionPlayers = players.get(sessionId) || [];
  const player = sessionPlayers.find(p => p.id === playerId);
  if (!player) return false;

  const sessionVotes = votes.get(sessionId) || [];

  // Remove existing vote
  const filteredVotes = sessionVotes.filter(v => v.playerId !== playerId);

  // Add new vote
  filteredVotes.push({
    playerId,
    playerName: player.name,
    value,
    votedAt: new Date(),
  });

  votes.set(sessionId, filteredVotes);

  return true;
}

export function getVotes(sessionId: string, revealed: boolean = false): Vote[] {
  const sessionVotes = votes.get(sessionId) || [];

  if (!revealed) {
    // Return votes with hidden values (use '✓' to indicate voted but hidden)
    return sessionVotes.map(v => ({
      ...v,
      value: '✓', // Indicates "voted but hidden"
    }));
  }

  return sessionVotes;
}

export function revealVotes(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  session.status = 'revealed';
  return true;
}

export function resetVotes(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  session.status = 'voting';
  votes.set(sessionId, []);

  return true;
}

export function getSessionState(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) return null;

  const sessionPlayers = getPlayers(sessionId);
  const sessionVotes = getVotes(sessionId, session.status === 'revealed');

  return {
    session,
    players: sessionPlayers,
    votes: sessionVotes,
  };
}
