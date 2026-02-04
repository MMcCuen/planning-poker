'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@/types/socket';
import type { Session, Player, Vote, VotingResults } from '@/types';
import { SOCKET_EVENTS } from '@/lib/constants/socket-events';

interface UseSessionOptions {
  sessionId: string;
  playerName: string;
  playerRole: 'dealer' | 'voter';
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
}

export function useSession({ sessionId, playerName, playerRole, socket }: UseSessionOptions) {
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [results, setResults] = useState<VotingResults | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Join session
    socket.emit(SOCKET_EVENTS.SESSION_JOIN, sessionId, playerName, playerRole);

    // Session events
    socket.on(SOCKET_EVENTS.SESSION_UPDATED, (updatedSession) => {
      setSession(updatedSession);
    });

    socket.on(SOCKET_EVENTS.SESSION_ENDED, () => {
      setError('Session has ended');
    });

    // Player events
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, (player) => {
      setPlayers((prev) => {
        // Check if player already exists
        const exists = prev.some((p) => p.id === player.id);
        if (exists) {
          return prev.map((p) => (p.id === player.id ? player : p));
        }
        return [...prev, player];
      });

      // Store current player ID
      if (player.name === playerName) {
        setCurrentPlayerId(player.id);
      }
    });

    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (playerId) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    });

    socket.on(SOCKET_EVENTS.PLAYER_UPDATED, (player) => {
      setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)));
    });

    // Voting events
    socket.on(SOCKET_EVENTS.VOTING_SUBMITTED, (playerId) => {
      // Just note that a player voted (don't show value)
      console.log(`[Session] Player ${playerId} voted`);
    });

    socket.on(SOCKET_EVENTS.VOTING_REVEALED, (revealedVotes, votingResults) => {
      setVotes(revealedVotes);
      setResults(votingResults);
    });

    socket.on(SOCKET_EVENTS.VOTING_RESET, () => {
      setVotes([]);
      setResults(null);
    });

    // Error events
    socket.on(SOCKET_EVENTS.ERROR, (err) => {
      setError(err.message);
      console.error('[Session] Error:', err);
    });

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_UPDATED);
      socket.off(SOCKET_EVENTS.SESSION_ENDED);
      socket.off(SOCKET_EVENTS.PLAYER_JOINED);
      socket.off(SOCKET_EVENTS.PLAYER_LEFT);
      socket.off(SOCKET_EVENTS.PLAYER_UPDATED);
      socket.off(SOCKET_EVENTS.VOTING_SUBMITTED);
      socket.off(SOCKET_EVENTS.VOTING_REVEALED);
      socket.off(SOCKET_EVENTS.VOTING_RESET);
      socket.off(SOCKET_EVENTS.ERROR);

      // Leave session on unmount
      socket.emit(SOCKET_EVENTS.SESSION_LEAVE);
    };
  }, [socket, sessionId, playerName, playerRole]);

  return {
    session,
    players,
    votes,
    results,
    currentPlayerId,
    error,
  };
}
