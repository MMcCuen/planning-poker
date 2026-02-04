import type { Session } from './session';
import type { Player } from './player';
import type { Vote, VotingResults } from './vote';

export interface ServerToClientEvents {
  // Session events
  'session:updated': (session: Session) => void;
  'session:ended': () => void;

  // Player events
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:updated': (player: Player) => void;

  // Voting events
  'voting:submitted': (playerId: string) => void; // Don't send value
  'voting:revealed': (votes: Vote[], results: VotingResults) => void;
  'voting:reset': () => void;

  // Error events
  error: (error: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  // Session management
  'session:join': (sessionId: string, playerName: string, role: 'dealer' | 'voter') => void;
  'session:leave': () => void;
  'session:end': () => void; // Dealer only

  // Voting
  'vote:submit': (value: string) => void;
  'vote:reveal': () => void; // Dealer only
  'vote:reset': () => void; // Dealer only
  'vote:next-issue': (issueKey: string, issueSummary: string) => void; // Dealer only
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  sessionId?: string;
  playerId?: string;
  playerName?: string;
}
