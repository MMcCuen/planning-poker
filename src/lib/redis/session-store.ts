import { nanoid } from 'nanoid';
import { getRedisClient, REDIS_KEYS, SESSION_TTL } from './client';
import type { Session, Player, Vote, VotingResults } from '@/types';

export class SessionStore {
  private redis = getRedisClient();

  // ============================================================================
  // SESSION OPERATIONS
  // ============================================================================

  async createSession(
    name: string,
    dealerId: string,
    initialIssueKey: string,
    initialIssueSummary: string
  ): Promise<Session> {
    const session: Session = {
      id: nanoid(),
      name,
      currentIssueKey: initialIssueKey,
      currentIssueSummary: initialIssueSummary,
      dealerId,
      status: 'waiting',
      autoReveal: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(REDIS_KEYS.session(session.id), JSON.stringify(session), {
      ex: SESSION_TTL,
    });

    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const data = await this.redis.get<string>(REDIS_KEYS.session(sessionId));
    if (!data) return null;

    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const updatedSession: Session = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(REDIS_KEYS.session(sessionId), JSON.stringify(updatedSession), {
      ex: SESSION_TTL,
    });

    return updatedSession;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Delete session and all related data
    const pipeline = this.redis.pipeline();

    pipeline.del(REDIS_KEYS.session(sessionId));
    pipeline.del(REDIS_KEYS.players(sessionId));
    pipeline.del(REDIS_KEYS.votes(sessionId));

    await pipeline.exec();
  }

  // ============================================================================
  // PLAYER OPERATIONS
  // ============================================================================

  async addPlayer(
    sessionId: string,
    name: string,
    role: 'dealer' | 'voter' | 'observer'
  ): Promise<Player> {
    const player: Player = {
      id: nanoid(),
      sessionId,
      name,
      role,
      isConnected: true,
      joinedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };

    // Add player to players list
    await this.redis.hset(REDIS_KEYS.players(sessionId), {
      [player.id]: JSON.stringify(player),
    });
    await this.redis.expire(REDIS_KEYS.players(sessionId), SESSION_TTL);

    return player;
  }

  async getPlayer(sessionId: string, playerId: string): Promise<Player | null> {
    const data = await this.redis.hget<string>(REDIS_KEYS.players(sessionId), playerId);
    if (!data) return null;

    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  async getPlayers(sessionId: string): Promise<Player[]> {
    const playersMap = await this.redis.hgetall<Record<string, string>>(
      REDIS_KEYS.players(sessionId)
    );

    if (!playersMap || Object.keys(playersMap).length === 0) {
      return [];
    }

    return Object.values(playersMap).map((data) =>
      typeof data === 'string' ? JSON.parse(data) : data
    );
  }

  async updatePlayer(
    sessionId: string,
    playerId: string,
    updates: Partial<Player>
  ): Promise<Player | null> {
    const player = await this.getPlayer(sessionId, playerId);
    if (!player) return null;

    const updatedPlayer: Player = {
      ...player,
      ...updates,
      lastSeenAt: new Date().toISOString(),
    };

    await this.redis.hset(REDIS_KEYS.players(sessionId), {
      [playerId]: JSON.stringify(updatedPlayer),
    });

    return updatedPlayer;
  }

  async removePlayer(sessionId: string, playerId: string): Promise<void> {
    await this.redis.hdel(REDIS_KEYS.players(sessionId), playerId);
  }

  async updatePlayerConnection(
    sessionId: string,
    playerId: string,
    isConnected: boolean
  ): Promise<void> {
    await this.updatePlayer(sessionId, playerId, { isConnected });
  }

  // ============================================================================
  // VOTE OPERATIONS
  // ============================================================================

  async submitVote(
    sessionId: string,
    playerId: string,
    issueKey: string,
    value: string
  ): Promise<Vote> {
    const vote: Vote = {
      id: nanoid(),
      sessionId,
      playerId,
      issueKey,
      value,
      votedAt: new Date().toISOString(),
      revealed: false,
    };

    // Store vote using playerId as key to allow vote updates
    await this.redis.hset(REDIS_KEYS.votes(sessionId), {
      [playerId]: JSON.stringify(vote),
    });
    await this.redis.expire(REDIS_KEYS.votes(sessionId), SESSION_TTL);

    return vote;
  }

  async getVote(sessionId: string, playerId: string): Promise<Vote | null> {
    const data = await this.redis.hget<string>(REDIS_KEYS.votes(sessionId), playerId);
    if (!data) return null;

    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  async getVotes(sessionId: string): Promise<Vote[]> {
    const votesMap = await this.redis.hgetall<Record<string, string>>(
      REDIS_KEYS.votes(sessionId)
    );

    if (!votesMap || Object.keys(votesMap).length === 0) {
      return [];
    }

    return Object.values(votesMap).map((data) =>
      typeof data === 'string' ? JSON.parse(data) : data
    );
  }

  async revealVotes(sessionId: string): Promise<Vote[]> {
    const votes = await this.getVotes(sessionId);

    // Mark all votes as revealed
    const revealedVotes = votes.map((vote) => ({
      ...vote,
      revealed: true,
    }));

    // Update all votes in Redis
    const pipeline = this.redis.pipeline();
    for (const vote of revealedVotes) {
      pipeline.hset(REDIS_KEYS.votes(sessionId), {
        [vote.playerId]: JSON.stringify(vote),
      });
    }
    await pipeline.exec();

    return revealedVotes;
  }

  async clearVotes(sessionId: string): Promise<void> {
    await this.redis.del(REDIS_KEYS.votes(sessionId));
  }

  async haveAllVoted(sessionId: string): Promise<boolean> {
    const players = await this.getPlayers(sessionId);
    const votes = await this.getVotes(sessionId);

    // Only count connected voters (not observers, not disconnected)
    const connectedVoters = players.filter(
      (p) => p.role === 'voter' && p.isConnected
    );

    return connectedVoters.length > 0 && votes.length >= connectedVoters.length;
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  async sessionExists(sessionId: string): Promise<boolean> {
    const exists = await this.redis.exists(REDIS_KEYS.session(sessionId));
    return exists === 1;
  }

  async extendSessionTTL(sessionId: string): Promise<void> {
    // Extend TTL for session and related data
    await this.redis.expire(REDIS_KEYS.session(sessionId), SESSION_TTL);
    await this.redis.expire(REDIS_KEYS.players(sessionId), SESSION_TTL);
    await this.redis.expire(REDIS_KEYS.votes(sessionId), SESSION_TTL);
  }
}

// Singleton instance
let sessionStore: SessionStore | null = null;

export function getSessionStore(): SessionStore {
  if (!sessionStore) {
    sessionStore = new SessionStore();
  }
  return sessionStore;
}
