import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@/types/socket';
import type { SessionStore } from '@/lib/redis/session-store';
import { SOCKET_EVENTS } from '@/lib/constants/socket-events';
import { getValidVoteValues } from '@/lib/constants/voting-scales';
import { calculateVotingResults } from '@/lib/utils/calculations';

export function handleVotingEvents(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  sessionStore: SessionStore
) {
  // Submit vote
  socket.on(SOCKET_EVENTS.VOTE_SUBMIT, async (value) => {
    const { sessionId, playerId } = socket.data;

    if (!sessionId || !playerId) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Not in a session',
        code: 'NOT_IN_SESSION',
      });
      return;
    }

    try {
      // Validate vote value
      const validValues = getValidVoteValues();
      if (!validValues.includes(value)) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Invalid vote value',
          code: 'INVALID_VOTE',
        });
        return;
      }

      const session = await sessionStore.getSession(sessionId);
      if (!session) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Check if voting is allowed
      if (session.status === 'revealed') {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Votes have already been revealed',
          code: 'ALREADY_REVEALED',
        });
        return;
      }

      // Submit vote (hidden from other players)
      await sessionStore.submitVote(sessionId, playerId, session.currentIssueKey, value);

      // Update session status to 'voting' if it was 'waiting'
      if (session.status === 'waiting') {
        await sessionStore.updateSession(sessionId, { status: 'voting' });
        const updatedSession = await sessionStore.getSession(sessionId);
        if (updatedSession) {
          io.to(sessionId).emit(SOCKET_EVENTS.SESSION_UPDATED, updatedSession);
        }
      }

      // Notify other players that this player has voted (but not the value)
      io.to(sessionId).emit(SOCKET_EVENTS.VOTING_SUBMITTED, playerId);

      console.log(`[Voting] Player ${playerId} voted ${value} in session ${sessionId}`);

      // Check if all players have voted and auto-reveal is enabled
      if (session.autoReveal) {
        const allVoted = await sessionStore.haveAllVoted(sessionId);
        if (allVoted) {
          console.log(`[Voting] All players voted, auto-revealing in session ${sessionId}`);

          // Auto-reveal votes
          const votes = await sessionStore.revealVotes(sessionId);
          const results = calculateVotingResults(votes);

          // Update session status
          await sessionStore.updateSession(sessionId, { status: 'revealed' });

          // Broadcast results to all players
          io.to(sessionId).emit(SOCKET_EVENTS.VOTING_REVEALED, votes, results);
        }
      }
    } catch (error) {
      console.error('[Voting] Error submitting vote:', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to submit vote',
        code: 'VOTE_FAILED',
      });
    }
  });

  // Reveal votes (dealer only)
  socket.on(SOCKET_EVENTS.VOTE_REVEAL, async () => {
    const { sessionId, playerId } = socket.data;

    if (!sessionId || !playerId) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Not in a session',
        code: 'NOT_IN_SESSION',
      });
      return;
    }

    try {
      const session = await sessionStore.getSession(sessionId);

      if (!session) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Verify dealer permission
      if (session.dealerId !== playerId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Only the dealer can reveal votes',
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      // Reveal all votes
      const votes = await sessionStore.revealVotes(sessionId);
      const results = calculateVotingResults(votes);

      // Update session status
      await sessionStore.updateSession(sessionId, { status: 'revealed' });

      // Broadcast results to all players
      io.to(sessionId).emit(SOCKET_EVENTS.VOTING_REVEALED, votes, results);

      console.log(`[Voting] Votes revealed in session ${sessionId}`);
    } catch (error) {
      console.error('[Voting] Error revealing votes:', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to reveal votes',
        code: 'REVEAL_FAILED',
      });
    }
  });

  // Reset votes (dealer only)
  socket.on(SOCKET_EVENTS.VOTE_RESET, async () => {
    const { sessionId, playerId } = socket.data;

    if (!sessionId || !playerId) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Not in a session',
        code: 'NOT_IN_SESSION',
      });
      return;
    }

    try {
      const session = await sessionStore.getSession(sessionId);

      if (!session) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Verify dealer permission
      if (session.dealerId !== playerId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Only the dealer can reset votes',
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      // Clear all votes
      await sessionStore.clearVotes(sessionId);

      // Update session status back to voting
      await sessionStore.updateSession(sessionId, { status: 'voting' });

      // Notify all players
      io.to(sessionId).emit(SOCKET_EVENTS.VOTING_RESET);

      const updatedSession = await sessionStore.getSession(sessionId);
      if (updatedSession) {
        io.to(sessionId).emit(SOCKET_EVENTS.SESSION_UPDATED, updatedSession);
      }

      console.log(`[Voting] Votes reset in session ${sessionId}`);
    } catch (error) {
      console.error('[Voting] Error resetting votes:', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to reset votes',
        code: 'RESET_FAILED',
      });
    }
  });

  // Move to next issue (dealer only)
  socket.on(SOCKET_EVENTS.VOTE_NEXT_ISSUE, async (issueKey, issueSummary) => {
    const { sessionId, playerId } = socket.data;

    if (!sessionId || !playerId) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Not in a session',
        code: 'NOT_IN_SESSION',
      });
      return;
    }

    try {
      const session = await sessionStore.getSession(sessionId);

      if (!session) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Verify dealer permission
      if (session.dealerId !== playerId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Only the dealer can change issues',
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      // Clear votes and update issue
      await sessionStore.clearVotes(sessionId);
      await sessionStore.updateSession(sessionId, {
        currentIssueKey: issueKey,
        currentIssueSummary: issueSummary,
        status: 'voting',
      });

      // Notify all players
      const updatedSession = await sessionStore.getSession(sessionId);
      if (updatedSession) {
        io.to(sessionId).emit(SOCKET_EVENTS.SESSION_UPDATED, updatedSession);
      }
      io.to(sessionId).emit(SOCKET_EVENTS.VOTING_RESET);

      console.log(`[Voting] Moved to next issue ${issueKey} in session ${sessionId}`);
    } catch (error) {
      console.error('[Voting] Error changing issue:', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to change issue',
        code: 'NEXT_ISSUE_FAILED',
      });
    }
  });
}
